<template>
  <div 
    v-if="shouldShowCallout"
    class="text-center py-2"
    data-testid="status-callout"
  >
    <p class="text-muted-foreground text-sm">{{ contextualMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Activity } from '~/types/activity'

interface Props {
  activities: Activity[]
}

const props = defineProps<Props>()

// Show callout only when action is truly needed
const shouldShowCallout = computed(() => {
  const count = props.activities.length
  // Only show for first-time users and early habit building (0-3 activities)
  return count <= 3
})

// Simple action-oriented message for early users only
const contextualMessage = computed(() => {
  const count = props.activities.length
  
  // First-time user
  if (count === 0) {
    return 'Track your first activity to get started'
  }

  // User with very few activities (1-3, building habit)
  if (count >= 1 && count <= 3) {
    return 'Great start! Keep building your tracking habit'
  }

  // Default fallback
  return 'Ready to track your productivity?'
})
</script>