<template>
  <div 
    class="bg-card border border-border rounded-lg overflow-hidden"
    data-testid="status-callout"
  >
    <div class="p-4 bg-secondary/30 border-b border-border">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-foreground font-semibold text-base">{{ contextualMessage }}</p>
          <p v-if="motivationalInsight" class="text-muted-foreground text-sm mt-1">
            {{ motivationalInsight }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-primary font-bold text-2xl leading-none">{{ keyMetric.value }}</div>
          <div class="text-muted-foreground text-sm mt-1">{{ keyMetric.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Activity } from '~/types/activity'

interface Props {
  activities: Activity[]
  motivationalInsight?: string | null
}

interface KeyMetric {
  value: string
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  motivationalInsight: null
})

// Action-oriented contextual message (doesn't repeat the count)
const contextualMessage = computed(() => {
  const count = props.activities.length
  
  // First-time user
  if (count === 0) {
    return 'Welcome! Track your first activity to unlock insights'
  }

  // User with very few activities (1-3, building habit)
  if (count >= 1 && count <= 3) {
    return 'Great start! Keep building your tracking habit'
  }

  // User with some activities (4-10, showing progress but need more for patterns)
  if (count >= 4 && count <= 10) {
    return 'Making progress! A few more activities will reveal patterns'
  }

  // User with good activity count (11-20, can see some patterns)
  if (count >= 11 && count <= 20) {
    return 'Nice work! Your activity patterns are becoming clear'
  }

  // User with many activities (21+, strong tracking habit)
  if (count >= 21) {
    return '🔥 Excellent tracking! Rich insights available in your data'
  }

  // Default fallback
  return 'Ready to track your productivity?'
})

// Key metric to show alongside the message (more contextual than just count)
const keyMetric = computed((): KeyMetric => {
  const count = props.activities.length
  
  if (count === 0) {
    return { value: '0', label: 'activities' }
  }
  
  // Calculate today's total time for active users
  const today = new Date().toDateString()
  const todayActivities = props.activities.filter(activity => 
    new Date(activity.endTime).toDateString() === today
  )
  const todayTime = todayActivities.reduce((total, activity) => total + activity.durationMs, 0)
  
  if (todayTime > 0) {
    const hours = Math.floor(todayTime / (1000 * 60 * 60))
    const minutes = Math.floor((todayTime % (1000 * 60 * 60)) / (1000 * 60))
    return { 
      value: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      label: 'today'
    }
  }
  
  // Fall back to total activities count
  return { value: count.toString(), label: 'activities' }
})
</script>