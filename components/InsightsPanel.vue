<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <BarChart3 class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm font-medium text-foreground">Insights</span>
      </div>
    </div>

    <!-- Quick Summary -->
    <div class="bg-secondary/20 rounded-lg p-3">
      <!-- AI Insight (if available) or fallback -->
      <div v-if="hasQuickInsight" class="flex items-center space-x-2 mb-2">
        <Brain class="w-3 h-3 text-primary" />
        <span class="text-xs text-muted-foreground">{{ quickInsight }}</span>
      </div>
      <div v-else class="flex items-center space-x-2 mb-2">
        <BarChart3 class="w-3 h-3 text-muted-foreground" />
        <span class="text-xs text-muted-foreground">{{ staticInsight }}</span>
      </div>
    </div>

    <!-- View Analytics Button -->
    <button
      @click="openAnalyticsDialog"
      data-testid="view-analytics-button"
      class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
    >
      <TrendingUp class="w-4 h-4" />
      <span class="text-sm font-medium">View Detailed Analytics</span>
    </button>

    <!-- Analytics Dialog -->
    <AnalyticsDialog 
      :is-open="showAnalyticsDialog" 
      @close="closeAnalyticsDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { BarChart3, Brain, TrendingUp } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useActivities } from '~/composables/useActivities'
import { useInsights } from '~/composables/useInsights'
import AnalyticsDialog from './AnalyticsDialog.vue'

interface Props {
  compact?: boolean
  mobileMode?: boolean
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
} = useInsights()

const { getActivities } = useActivities()

// UI State
const showAnalyticsDialog = ref(false)

// Quick insight state
const todayStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })

// Dialog management
const openAnalyticsDialog = () => {
  showAnalyticsDialog.value = true
}

const closeAnalyticsDialog = () => {
  showAnalyticsDialog.value = false
}

// Calculate quick summary stats
const loadTodayStats = async () => {
  try {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const activities = await getActivities(1, 100)
    
    // Filter activities from today
    const todayActivities = activities.filter(a => 
      new Date(a.startTime) >= startOfDay
    )

    const totalTime = todayActivities.reduce((sum, a) => sum + a.durationMs, 0)
    const ratedActivities = todayActivities.filter(a => a.focusRating !== null)
    const avgFocus = ratedActivities.length > 0 
      ? ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length
      : 0

    todayStats.value = {
      totalTime,
      activitiesCount: todayActivities.length,
      avgFocus
    }
  } catch (error) {
    console.error('Failed to load today stats:', error)
  }
}

// Computed insights
const hasQuickInsight = computed(() => {
  return hasAIInsights.value && (
    aiInsights.value.focusPattern?.suggestion ||
    aiInsights.value.peakHours?.recommendation ||
    (aiInsights.value.recommendations && aiInsights.value.recommendations.length > 0)
  )
})

const quickInsight = computed(() => {
  if (!hasAIInsights.value) return ''
  
  // Priority: Focus pattern > Peak hours > Recommendations
  if (aiInsights.value.focusPattern?.suggestion) {
    return aiInsights.value.focusPattern.suggestion
  }
  if (aiInsights.value.peakHours?.recommendation) {
    return aiInsights.value.peakHours.recommendation
  }
  if (aiInsights.value.recommendations && aiInsights.value.recommendations.length > 0) {
    return aiInsights.value.recommendations[0].message
  }
  return ''
})

const staticInsight = computed(() => {
  if (todayStats.value.activitiesCount === 0) {
    return 'Start tracking to see your productivity patterns'
  }
  
  const hours = Math.floor(todayStats.value.totalTime / (1000 * 60 * 60))
  const minutes = Math.floor((todayStats.value.totalTime % (1000 * 60 * 60)) / (1000 * 60))
  const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  
  if (todayStats.value.avgFocus > 0) {
    return `Today: ${timeStr} tracked, ${todayStats.value.avgFocus.toFixed(1)}/5 avg focus`
  }
  
  return `Today: ${timeStr} tracked across ${todayStats.value.activitiesCount} activities`
})

// Initialize on mount
onMounted(() => {
  loadTodayStats()
})

// Auto-refresh when activities change
if (typeof window !== 'undefined') {
  window.addEventListener('activity-saved', loadTodayStats)
  window.addEventListener('activity-updated', loadTodayStats)
  window.addEventListener('activity-deleted', loadTodayStats)
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('activity-saved', loadTodayStats)
    window.removeEventListener('activity-updated', loadTodayStats)
    window.removeEventListener('activity-deleted', loadTodayStats)
  }
})
</script>