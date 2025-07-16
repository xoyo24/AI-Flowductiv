<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-foreground">Today's Activities</h2>
      <div class="text-sm text-muted-foreground">
        {{ activities.length }} activities
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 mb-2">{{ error }}</div>
      <button 
        @click="refreshActivities"
        class="text-sm text-primary hover:text-primary/80"
      >
        Try again
      </button>
    </div>

    <div v-else-if="activities.length === 0" class="text-center py-8 text-muted-foreground">
      <div class="mb-2">No activities tracked today</div>
      <div class="text-sm">Start your first timer session above!</div>
    </div>

    <div v-else class="space-y-3" data-testid="activity-list">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-3">
            <div class="flex-1">
              <h3 class="font-medium text-foreground truncate">
                {{ activity.title }}
              </h3>
              <div class="flex items-center space-x-4 mt-1">
                <span class="text-sm text-muted-foreground">
                  {{ formatDuration(activity.durationMs) }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ formatTime(activity.startTime) }} - {{ formatTime(activity.endTime) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Tags and Priority -->
          <div v-if="activity.tags?.length || activity.priority" class="flex items-center space-x-2 mt-2">
            <span
              v-for="tag in activity.tags"
              :key="tag"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              #{{ tag }}
            </span>
            <span
              v-if="activity.priority"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
            >
              !{{ activity.priority }}
            </span>
          </div>

          <!-- Focus Rating -->
          <div v-if="activity.focusRating" class="flex items-center space-x-1 mt-2">
            <span class="text-xs text-muted-foreground">Focus:</span>
            <div class="flex space-x-1">
              <div
                v-for="i in 5"
                :key="i"
                :class="{
                  'w-3 h-3 rounded-full': true,
                  'bg-primary': i <= activity.focusRating,
                  'bg-gray-200 dark:bg-gray-700': i > activity.focusRating
                }"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-2 ml-4">
          <button
            @click="editActivity(activity)"
            class="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Edit activity"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            @click="removeActivity(activity.id)"
            class="p-2 text-muted-foreground hover:text-red-500 transition-colors"
            title="Delete activity"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="activities.length > 0" class="border-t border-border pt-4 mt-6">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-2xl font-bold text-foreground">{{ formatDuration(getActivityStats.totalTime) }}</div>
          <div class="text-sm text-muted-foreground">Total Time</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-foreground">{{ getActivityStats.activityCount }}</div>
          <div class="text-sm text-muted-foreground">Sessions</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-foreground">{{ formatDuration(getActivityStats.longestSession) }}</div>
          <div class="text-sm text-muted-foreground">Longest</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const {
  activities,
  loading,
  error,
  getActivityStats,
  getTodaysActivities,
  deleteActivity,
  formatDuration
} = useActivities()

// Format time helper
const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Actions
const refreshActivities = async () => {
  await getTodaysActivities()
}

const editActivity = (activity: any) => {
  // TODO: Implement edit modal/form
  console.log('Edit activity:', activity)
}

const removeActivity = async (id: string) => {
  if (confirm('Are you sure you want to delete this activity?')) {
    await deleteActivity(id)
  }
}

// Auto-refresh when new activities are added
// This will be handled by the timer composable calling saveActivity
</script>