<template>
  <div>
    <!-- AI Insight (Only if available) -->
    <div v-if="hasQuickInsight" class="bg-secondary/20 rounded-lg p-3 mb-3">
      <div class="flex items-center space-x-2">
        <Brain class="w-4 h-4 text-primary" />
        <span class="text-sm font-medium text-foreground">{{ quickInsight }}</span>
      </div>
    </div>

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
const overallStats = ref({ totalTime: 0, activitiesCount: 0, avgFocus: 0 })

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

    // Calculate today's stats
    const todayTotalTime = todayActivities.reduce((sum, a) => sum + a.durationMs, 0)
    const todayRatedActivities = todayActivities.filter(a => a.focusRating !== null)
    const todayAvgFocus = todayRatedActivities.length > 0 
      ? todayRatedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / todayRatedActivities.length
      : 0

    todayStats.value = {
      totalTime: todayTotalTime,
      activitiesCount: todayActivities.length,
      avgFocus: todayAvgFocus
    }

    // Calculate overall stats
    const overallTotalTime = activities.reduce((sum, a) => sum + a.durationMs, 0)
    const overallRatedActivities = activities.filter(a => a.focusRating !== null)
    const overallAvgFocus = overallRatedActivities.length > 0 
      ? overallRatedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / overallRatedActivities.length
      : 0

    overallStats.value = {
      totalTime: overallTotalTime,
      activitiesCount: activities.length,
      avgFocus: overallAvgFocus
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
  // If no overall data, show fallback
  if (overallStats.value.activitiesCount === 0) {
    return 'Start tracking to see your productivity patterns'
  }
  
  // If have today's data, show today's summary
  if (todayStats.value.activitiesCount > 0) {
    const hours = Math.floor(todayStats.value.totalTime / (1000 * 60 * 60))
    const minutes = Math.floor((todayStats.value.totalTime % (1000 * 60 * 60)) / (1000 * 60))
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    
    if (todayStats.value.avgFocus > 0) {
      return `Today: ${timeStr} tracked, ${todayStats.value.avgFocus.toFixed(1)}/5 avg focus`
    }
    
    return `Today: ${timeStr} tracked across ${todayStats.value.activitiesCount} activities`
  }
  
  // If no today's data but have historical data, show overall summary
  const totalHours = Math.floor(overallStats.value.totalTime / (1000 * 60 * 60))
  const totalMinutes = Math.floor((overallStats.value.totalTime % (1000 * 60 * 60)) / (1000 * 60))
  const totalTimeStr = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`
  
  if (overallStats.value.avgFocus > 0) {
    return `${totalTimeStr} total tracked, ${overallStats.value.avgFocus.toFixed(1)}/5 avg focus`
  }
  
  return `${totalTimeStr} tracked across ${overallStats.value.activitiesCount} activities`
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

// Expose methods for parent components
defineExpose({
  openAnalyticsDialog
})
</script>