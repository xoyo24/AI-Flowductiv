<template>
  <div class="space-y-3">
    <!-- Header with AI Toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <BarChart3 class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm font-medium text-foreground">Insights</span>
      </div>
      
      <!-- AI Insights Toggle -->
      <button
        @click="toggleAIInsights"
        :disabled="aiLoading"
        class="flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-colors hover:bg-muted/50 disabled:opacity-50"
        :class="showAIInsights ? 'bg-primary/10 text-primary' : 'text-muted-foreground'"
        :title="showAIInsights ? 'Hide AI insights' : 'Get AI insights (premium)'"
      >
        <Brain :class="{ 'animate-pulse': aiLoading }" class="w-3 h-3" />
        <span>{{ aiLoading ? 'Analyzing...' : 'AI' }}</span>
        <Sparkles v-if="!aiLoading" class="w-2 h-2" />
      </button>
    </div>

    <!-- AI Insights Section (Premium) -->
    <div v-if="showAIInsights" class="space-y-3">
      <!-- AI Error State -->
      <div v-if="aiError" class="bg-destructive/10 rounded-lg p-3">
        <div class="text-xs text-destructive">
          {{ aiError }}
        </div>
      </div>

      <!-- AI Loading State -->
      <div v-else-if="aiLoading" class="bg-secondary/20 rounded-lg p-3">
        <div class="flex items-center space-x-2">
          <Brain class="w-3 h-3 animate-pulse text-muted-foreground" />
          <span class="text-xs text-muted-foreground">Generating AI insights...</span>
        </div>
      </div>

      <!-- AI Insights Content -->
      <div v-else-if="hasAIInsights" class="space-y-3">
        <!-- Peak Hours AI Insight -->
        <div v-if="aiInsights.peakHours" class="bg-secondary/20 rounded-lg p-3 border-l-2 border-primary/30">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <Clock class="w-3 h-3 text-muted-foreground" />
              <span class="text-xs font-medium text-foreground">Peak Performance</span>
            </div>
            <span 
              :class="aiInsights.peakHours.confidence > 0.7 ? 'bg-green-500 text-white' : 'bg-secondary text-secondary-foreground'"
              class="px-1.5 py-0.5 text-xs font-medium rounded"
            >
              {{ Math.round(aiInsights.peakHours.confidence * 100) }}%
            </span>
          </div>
          <div class="text-xs text-muted-foreground mb-2">
            {{ aiInsights.peakHours.recommendation }}
          </div>
          <div class="flex items-center space-x-3 text-xs">
            <span class="text-foreground font-medium">{{ aiInsights.peakHours.timeRange }}</span>
            <span class="text-muted-foreground">{{ aiInsights.peakHours.avgFocus.toFixed(1) }}/5 focus</span>
          </div>
        </div>

        <!-- Focus Trend AI Insight -->
        <div v-if="aiInsights.focusPattern" class="bg-secondary/20 rounded-lg p-3 border-l-2 border-primary/30">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <TrendingUp 
                v-if="aiInsights.focusPattern.trend === 'improving'" 
                class="w-3 h-3 text-green-500" 
              />
              <TrendingDown 
                v-else-if="aiInsights.focusPattern.trend === 'declining'" 
                class="w-3 h-3 text-red-500" 
              />
              <Minus v-else class="w-3 h-3 text-muted-foreground" />
              <span class="text-xs font-medium text-foreground">Focus Trend</span>
            </div>
            <span 
              :class="aiInsights.focusPattern.trend === 'improving' ? 'bg-green-500 text-white' : 
                       aiInsights.focusPattern.trend === 'declining' ? 'bg-red-500 text-white' : 'bg-secondary text-secondary-foreground'"
              class="px-1.5 py-0.5 text-xs font-medium rounded"
            >
              {{ aiInsights.focusPattern.trend }}
            </span>
          </div>
          <div class="text-xs text-muted-foreground">
            {{ aiInsights.focusPattern.suggestion }}
          </div>
        </div>

        <!-- Actionable Recommendations -->
        <div v-if="aiInsights.recommendations && aiInsights.recommendations.length > 0">
          <div class="flex items-center space-x-2 mb-2">
            <Lightbulb class="w-3 h-3 text-muted-foreground" />
            <span class="text-xs font-medium text-foreground">AI Recommendations</span>
          </div>
          <div class="space-y-2">
            <div 
              v-for="(rec, index) in aiInsights.recommendations.slice(0, 2)" 
              :key="index"
              class="bg-secondary/20 rounded-lg p-3 border-l-2 border-primary/30"
            >
              <div class="flex items-start space-x-2">
                <AlertCircle 
                  v-if="rec.priority === 'high'" 
                  class="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" 
                />
                <Info v-else class="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <div class="text-xs text-muted-foreground leading-relaxed">
                  {{ rec.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-border"></div>
    </div>

    <!-- Static Analysis Section (Always Available) -->
    <div class="space-y-3">
      <!-- Peak Hours (Static) -->
      <div class="bg-secondary/20 rounded-lg p-3">
        <div class="flex items-center space-x-2 mb-2">
          <Clock class="w-3 h-3 text-muted-foreground" />
          <span class="text-xs font-medium text-foreground">Peak Hours</span>
        </div>
        <div class="text-xs text-muted-foreground">
          {{ peakHours.length > 0 ? `Most productive: ${peakHours.join(', ')}` : 'Track more to discover patterns' }}
        </div>
      </div>

      <!-- Focus Patterns (Static) -->
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
        <div v-if="topCategories.length > 0" class="space-y-1">
          <div 
            v-for="category in topCategories.slice(0, 3)" 
            :key="category.name"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-muted-foreground">#{{ category.name }}</span>
            <span class="text-foreground font-medium">{{ category.percentage }}%</span>
          </div>
        </div>
        <div v-else class="text-xs text-muted-foreground">
          Add tags to see distribution
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertCircle,
  BarChart3,
  Brain,
  Clock,
  Info,
  Lightbulb,
  Minus,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useActivities } from '~/composables/useActivities'
import { useInsights } from '~/composables/useInsights'

interface Props {
  compact?: boolean
  mobileMode?: boolean
}

interface CategoryData {
  name: string
  percentage: number
  totalTime: number
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  mobileMode: false,
})

// AI Insights (Premium)
const {
  insights: aiInsights,
  loading: aiLoading,
  error: aiError,
  hasInsights: hasAIInsights,
  generateInsights,
} = useInsights()

const { getActivities, getActivitiesForDate } = useActivities()

// UI State
const showAIInsights = ref(false)

// Static Analysis State (Free)
const peakHours = ref<string[]>([])
const focusPattern = ref<string>('')
const topCategories = ref<CategoryData[]>([])

// AI Insights Toggle
const toggleAIInsights = async () => {
  if (!showAIInsights.value) {
    showAIInsights.value = true
    if (!hasAIInsights.value && !aiLoading.value) {
      // Generate AI insights on first toggle
      await refreshAIInsights()
    }
  } else {
    showAIInsights.value = false
  }
}

// AI Insights Refresh
const refreshAIInsights = async () => {
  try {
    const activities = await getActivities(1, 100)
    await generateInsights(activities)
  } catch (error) {
    console.error('Failed to generate AI insights:', error)
  }
}

// Static Analysis Functions (from PatternInsights)
const calculatePeakHours = async () => {
  try {
    const activities = await getActivities(1, 100)
    const hourMap = new Map<number, number>()

    activities.forEach((activity) => {
      const hour = new Date(activity.startTime).getHours()
      hourMap.set(hour, (hourMap.get(hour) || 0) + activity.durationMs)
    })

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

// Load static analysis data
const loadStaticAnalysis = async () => {
  await Promise.all([calculatePeakHours(), calculateFocusPattern(), calculateTopCategories()])
}

// Initialize on mount
onMounted(() => {
  loadStaticAnalysis()
})

// Auto-refresh when activities change
if (typeof window !== 'undefined') {
  window.addEventListener('activity-saved', () => {
    loadStaticAnalysis()
    if (showAIInsights.value) {
      refreshAIInsights()
    }
  })
  window.addEventListener('activity-updated', loadStaticAnalysis)
  window.addEventListener('activity-deleted', loadStaticAnalysis)
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('activity-saved', loadStaticAnalysis)
    window.removeEventListener('activity-updated', loadStaticAnalysis)
    window.removeEventListener('activity-deleted', loadStaticAnalysis)
  }
})
</script>