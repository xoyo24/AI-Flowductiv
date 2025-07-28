<template>
  <div class="bg-card rounded-lg border border-border p-4 space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-6">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-4">
      <!-- Time Period Selector -->
      <div class="flex items-center space-x-1 bg-muted rounded-lg p-1">
        <button
          v-for="period in timePeriods"
          :key="period.key"
          @click="selectedPeriod = period.key"
          :class="{
            'px-3 py-1.5 text-xs font-medium rounded-md transition-colors': true,
            'bg-background text-foreground shadow-sm': selectedPeriod === period.key,
            'text-muted-foreground hover:text-foreground': selectedPeriod !== period.key
          }"
        >
          {{ period.label }}
        </button>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Total Time -->
        <div class="text-center">
          <div class="text-lg font-bold text-foreground">
            {{ formatDuration(currentStats.totalTime) }}
          </div>
          <div class="text-xs text-muted-foreground">Total Time</div>
          <div v-if="previousStats" class="text-xs">
            <TrendIndicator 
              :current="currentStats.totalTime" 
              :previous="previousStats.totalTime"
              format="duration"
            />
          </div>
        </div>

        <!-- Activity Count -->
        <div class="text-center">
          <div class="text-lg font-bold text-foreground">
            {{ currentStats.activityCount }}
          </div>
          <div class="text-xs text-muted-foreground">Activities</div>
          <div v-if="previousStats" class="text-xs">
            <TrendIndicator 
              :current="currentStats.activityCount" 
              :previous="previousStats.activityCount"
              format="number"
            />
          </div>
        </div>

        <!-- Average Focus -->
        <div class="text-center">
          <div class="text-lg font-bold text-foreground">
            {{ currentStats.averageFocus.toFixed(1) }}
          </div>
          <div class="text-xs text-muted-foreground">Avg Focus</div>
          <div v-if="previousStats" class="text-xs">
            <TrendIndicator 
              :current="currentStats.averageFocus" 
              :previous="previousStats.averageFocus"
              format="decimal"
            />
          </div>
        </div>

        <!-- Productivity Score -->
        <div class="text-center">
          <div class="text-lg font-bold text-foreground">
            {{ currentStats.productivityScore }}
          </div>
          <div class="text-xs text-muted-foreground">Score</div>
          <div v-if="previousStats" class="text-xs">
            <TrendIndicator 
              :current="currentStats.productivityScore" 
              :previous="previousStats.productivityScore"
              format="number"
            />
          </div>
        </div>
      </div>

      <!-- Current Streak -->
      <div class="bg-secondary/30 rounded-lg p-3 text-center">
        <div class="text-sm font-medium text-foreground flex items-center justify-center space-x-2">
          <Calendar class="w-4 h-4" />
          <span>{{ currentStats.streakDays }}-day streak</span>
        </div>
        <div class="text-xs text-muted-foreground mt-1">
          {{ getStreakMessage(currentStats.streakDays) }}
        </div>
      </div>

      <!-- Top Tags (Current Period) -->
      <div v-if="currentStats.topTags.length > 0" class="space-y-2">
        <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Top Tags ({{ currentPeriodLabel }})
        </div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in currentStats.topTags.slice(0, 3)"
            :key="tag.name"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
          >
            #{{ tag.name }}
            <span class="ml-1 text-muted-foreground">{{ formatDuration(tag.totalTime) }}</span>
          </span>
        </div>
      </div>

      <!-- Quick Insights -->
      <div v-if="insights.length > 0" class="space-y-2">
        <div class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Quick Insights
        </div>
        <div class="space-y-1">
          <div
            v-for="insight in insights.slice(0, 2)"
            :key="insight.id"
            class="text-xs text-foreground bg-secondary/20 rounded p-2"
          >
            {{ insight.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, TrendingDown, TrendingUp } from 'lucide-vue-next'

interface Props {
  loading?: boolean
}

interface TimePeriod {
  key: string
  label: string
}

interface ActivityStats {
  totalTime: number
  activityCount: number
  averageFocus: number
  productivityScore: number
  streakDays: number
  topTags: Array<{ name: string; totalTime: number }>
}

interface Insight {
  id: string
  text: string
  type: 'positive' | 'neutral' | 'suggestion'
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Composables
const { getActivities, getActivitiesForDate, formatDuration } = useActivities()

// Local state
const selectedPeriod = ref('week')
const currentStats = ref<ActivityStats>({
  totalTime: 0,
  activityCount: 0,
  averageFocus: 0,
  productivityScore: 0,
  streakDays: 0,
  topTags: [],
})
const previousStats = ref<ActivityStats | null>(null)
const insights = ref<Insight[]>([])

// Time periods configuration
const timePeriods: TimePeriod[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]

// Computed
const currentPeriodLabel = computed(() => {
  return timePeriods.find((p) => p.key === selectedPeriod.value)?.label || 'Week'
})

// Methods
const calculateStats = async (period: string): Promise<ActivityStats> => {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
      break
    default:
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
  }

  // Fetch activities for the period
  const activities = await getActivitiesForPeriod(startDate, now)

  // Calculate stats
  const totalTime = activities.reduce((sum, a) => sum + a.durationMs, 0)
  const activityCount = activities.length

  const activitiesWithFocus = activities.filter((a) => a.focusRating !== null)
  const averageFocus =
    activitiesWithFocus.length > 0
      ? activitiesWithFocus.reduce((sum, a) => sum + (a.focusRating || 0), 0) /
        activitiesWithFocus.length
      : 0

  // Calculate productivity score (based on time + focus)
  const hoursWorked = totalTime / (1000 * 60 * 60)
  const focusBonus = averageFocus * 20
  const productivityScore = Math.round(hoursWorked * 10 + focusBonus)

  // Calculate streak (simplified - consecutive days with activities)
  const streakDays = await calculateStreakDays()

  // Calculate top tags
  const tagMap = new Map<string, number>()
  activities.forEach((activity) => {
    activity.tags?.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + activity.durationMs)
    })
  })

  const topTags = Array.from(tagMap.entries())
    .map(([name, totalTime]) => ({ name, totalTime }))
    .sort((a, b) => b.totalTime - a.totalTime)

  return {
    totalTime,
    activityCount,
    averageFocus,
    productivityScore,
    streakDays,
    topTags,
  }
}

const getActivitiesForPeriod = async (startDate: Date, endDate: Date) => {
  // This is a simplified version - in a real implementation,
  // you'd fetch activities with date filtering from the API
  const allActivities = await getActivities(1, 1000) // Get many activities
  return allActivities.filter((activity) => {
    const activityDate = new Date(activity.startTime)
    return activityDate >= startDate && activityDate <= endDate
  })
}

const calculateStreakDays = async (): Promise<number> => {
  // Simplified streak calculation
  // In real implementation, you'd check consecutive days with activities
  let streak = 0
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)

    const dayActivities = await getActivitiesForDate(checkDate)
    if (dayActivities.length > 0) {
      streak++
    } else {
      break
    }
  }

  return streak
}

const generateInsights = (stats: ActivityStats, previousStats: ActivityStats | null): Insight[] => {
  const insights: Insight[] = []

  if (previousStats) {
    // Time comparison
    if (stats.totalTime > previousStats.totalTime * 1.1) {
      insights.push({
        id: 'time-increase',
        text: `Great! You tracked ${Math.round((stats.totalTime - previousStats.totalTime) / (1000 * 60 * 60))}h more than last ${selectedPeriod.value}`,
        type: 'positive',
      })
    }

    // Focus improvement
    if (stats.averageFocus > previousStats.averageFocus) {
      insights.push({
        id: 'focus-improvement',
        text: `Your focus improved by ${(stats.averageFocus - previousStats.averageFocus).toFixed(1)} points`,
        type: 'positive',
      })
    }
  }

  // Streak insights
  if (stats.streakDays >= 7) {
    insights.push({
      id: 'streak-milestone',
      text: `Amazing ${stats.streakDays}-day streak! You're building a strong habit`,
      type: 'positive',
    })
  } else if (stats.streakDays === 0) {
    insights.push({
      id: 'streak-start',
      text: 'Start a tracking streak by logging activities daily',
      type: 'suggestion',
    })
  }

  return insights
}

const getStreakMessage = (days: number): string => {
  if (days === 0) return 'Start your streak today!'
  if (days === 1) return 'Great start!'
  if (days < 7) return 'Building momentum...'
  if (days < 30) return 'Strong habit forming!'
  return 'Incredible consistency!'
}

// Watch for period changes
watch(selectedPeriod, async (newPeriod, oldPeriod) => {
  if (newPeriod !== oldPeriod) {
    await loadStats()
  }
})

// Load stats method
const loadStats = async () => {
  try {
    // Load current period stats
    currentStats.value = await calculateStats(selectedPeriod.value)

    // Load previous period for comparison
    if (selectedPeriod.value !== 'today') {
      const previousPeriodKey = selectedPeriod.value === 'week' ? 'week' : 'month'
      previousStats.value = await calculatePreviousPeriodStats(previousPeriodKey)
    }

    // Generate insights
    insights.value = generateInsights(currentStats.value, previousStats.value)
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const calculatePreviousPeriodStats = async (period: string): Promise<ActivityStats> => {
  const now = new Date()
  let startDate: Date
  let endDate: Date

  switch (period) {
    case 'week':
      endDate = new Date(now)
      endDate.setDate(now.getDate() - 7)
      startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 7)
      break
    case 'month':
      endDate = new Date(now)
      endDate.setDate(now.getDate() - 30)
      startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 30)
      break
    default:
      return currentStats.value
  }

  const activities = await getActivitiesForPeriod(startDate, endDate)

  return {
    totalTime: activities.reduce((sum, a) => sum + a.durationMs, 0),
    activityCount: activities.length,
    averageFocus: activities
      .filter((a) => a.focusRating !== null)
      .reduce((sum, a, _, arr) => sum + (a.focusRating || 0) / arr.length, 0),
    productivityScore: 0, // Simplified for previous period
    streakDays: 0,
    topTags: [],
  }
}

// Initialize on mount
onMounted(() => {
  loadStats()
})

// Refresh when activities change
if (typeof window !== 'undefined') {
  window.addEventListener('activity-saved', loadStats)
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('activity-saved', loadStats)
  }
})
</script>