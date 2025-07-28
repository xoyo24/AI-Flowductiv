<template>
  <div class="space-y-3">
    <!-- Peak Hours -->
    <div class="bg-secondary/20 rounded-lg p-3">
      <div class="flex items-center space-x-2 mb-2">
        <Clock class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs font-medium text-foreground">Peak Hours</span>
      </div>
      <div class="text-xs text-muted-foreground">
        {{ peakHours.length > 0 ? `Most productive: ${peakHours.join(', ')}` : 'Track more to discover patterns' }}
      </div>
    </div>

    <!-- Focus Patterns -->
    <div class="bg-secondary/20 rounded-lg p-3">
      <div class="flex items-center space-x-2 mb-2">
        <Brain class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs font-medium text-foreground">Focus Trends</span>
      </div>
      <div class="text-xs text-muted-foreground">
        {{ focusPattern || 'Rate your sessions to see patterns' }}
      </div>
    </div>

    <!-- Activity Distribution -->
    <div class="bg-secondary/20 rounded-lg p-3">
      <div class="flex items-center space-x-2 mb-2">
        <BarChart3 class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs font-medium text-foreground">Activity Mix</span>
      </div>
      <div class="space-y-1">
        <div 
          v-for="category in topCategories.slice(0, 3)" 
          :key="category.name"
          class="flex items-center justify-between text-xs"
        >
          <span class="text-muted-foreground">#{{ category.name }}</span>
          <span class="text-foreground font-medium">{{ category.percentage }}%</span>
        </div>
      </div>
    </div>

    <!-- Weekly Comparison -->
    <div v-if="!compact" class="bg-secondary/20 rounded-lg p-3">
      <div class="flex items-center space-x-2 mb-2">
        <Calendar class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs font-medium text-foreground">This Week</span>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <div 
          v-for="(day, index) in weeklyData" 
          :key="index"
          class="text-center"
        >
          <div class="text-xs text-muted-foreground mb-1">{{ day.label }}</div>
          <div 
            :class="{
              'w-4 h-4 rounded-sm mx-auto': true,
              'bg-primary/80': day.hours >= 4,
              'bg-primary/60': day.hours >= 2 && day.hours < 4,
              'bg-primary/30': day.hours >= 1 && day.hours < 2,
              'bg-secondary': day.hours < 1
            }"
            :title="`${day.hours.toFixed(1)}h tracked`"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BarChart3, Brain, Calendar, Clock } from 'lucide-vue-next'

interface Props {
  compact?: boolean
}

interface CategoryData {
  name: string
  percentage: number
  totalTime: number
}

interface DayData {
  label: string
  hours: number
  date: Date
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
})

const { getActivities, getActivitiesForDate } = useActivities()

// Local state
const peakHours = ref<string[]>([])
const focusPattern = ref<string>('')
const topCategories = ref<CategoryData[]>([])
const weeklyData = ref<DayData[]>([])

// Calculate peak hours from recent activities
const calculatePeakHours = async () => {
  try {
    const activities = await getActivities(1, 100) // Get recent activities
    const hourMap = new Map<number, number>()

    activities.forEach((activity) => {
      const hour = new Date(activity.startTime).getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + activity.durationMs)
    })

    // Find top 2 most productive hours
    const sortedHours = Array.from(hourMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([hour]) => {
        if (hour === 0) return '12 AM'
        if (hour === 12) return '12 PM'
        if (hour < 12) return `${hour} AM`
        return `${hour - 12} PM`
      })

    peakHours.value = sortedHours
  } catch (error) {
    console.error('Failed to calculate peak hours:', error)
  }
}

// Analyze focus patterns
const calculateFocusPattern = async () => {
  try {
    const activities = await getActivities(1, 50)
    const ratedActivities = activities.filter((a) => a.focusRating !== null)

    if (ratedActivities.length === 0) {
      focusPattern.value = 'Rate your sessions to see patterns'
      return
    }

    const averageFocus =
      ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length
    const recentAvg =
      ratedActivities.slice(0, 10).reduce((sum, a) => sum + (a.focusRating || 0), 0) /
      Math.min(10, ratedActivities.length)

    if (recentAvg > averageFocus + 0.5) {
      focusPattern.value = 'Focus improving recently ↗'
    } else if (recentAvg < averageFocus - 0.5) {
      focusPattern.value = 'Focus declining lately ↘'
    } else {
      focusPattern.value = `Steady ${averageFocus.toFixed(1)}/5 focus avg`
    }
  } catch (error) {
    console.error('Failed to calculate focus pattern:', error)
  }
}

// Calculate category distribution
const calculateTopCategories = async () => {
  try {
    const activities = await getActivities(1, 100)
    const tagMap = new Map<string, number>()
    let totalTime = 0

    activities.forEach((activity) => {
      totalTime += activity.durationMs
      activity.tags?.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + activity.durationMs)
      })
    })

    if (totalTime === 0) {
      topCategories.value = []
      return
    }

    const categories = Array.from(tagMap.entries())
      .map(([name, time]) => ({
        name,
        totalTime: time,
        percentage: Math.round((time / totalTime) * 100),
      }))
      .sort((a, b) => b.totalTime - a.totalTime)

    topCategories.value = categories
  } catch (error) {
    console.error('Failed to calculate categories:', error)
  }
}

// Calculate weekly activity data
const calculateWeeklyData = async () => {
  try {
    const today = new Date()
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const data: DayData[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)

      const activities = await getActivitiesForDate(date)
      const totalMs = activities.reduce((sum, a) => sum + a.durationMs, 0)
      const hours = totalMs / (1000 * 60 * 60)

      data.push({
        label: dayLabels[date.getDay()],
        hours,
        date,
      })
    }

    weeklyData.value = data
  } catch (error) {
    console.error('Failed to calculate weekly data:', error)
  }
}

// Load all pattern data
const loadPatterns = async () => {
  await Promise.all([
    calculatePeakHours(),
    calculateFocusPattern(),
    calculateTopCategories(),
    calculateWeeklyData(),
  ])
}

// Initialize on mount
onMounted(() => {
  loadPatterns()
})

// Refresh when activities change
if (typeof window !== 'undefined') {
  window.addEventListener('activity-saved', loadPatterns)
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('activity-saved', loadPatterns)
  }
})
</script>