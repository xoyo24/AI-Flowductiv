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
              <h3 class="font-medium text-foreground break-words">
                {{ getCleanTitle(activity.title) }}
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

    <!-- Edit Modal -->
    <div v-if="editingActivity" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-card rounded-lg border border-border p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-foreground mb-4">Edit Activity</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium text-foreground">Activity Name</label>
            <input
              v-model="editingActivity.title"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
            />
          </div>
          
          <div>
            <label class="text-sm font-medium text-foreground">Focus Rating (1-5)</label>
            <select
              v-model="editingActivity.focusRating"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
            >
              <option :value="null">No rating</option>
              <option :value="1">1 - Poor</option>
              <option :value="2">2 - Fair</option>
              <option :value="3">3 - Good</option>
              <option :value="4">4 - Great</option>
              <option :value="5">5 - Excellent</option>
            </select>
          </div>
          
          <div>
            <label class="text-sm font-medium text-foreground">Energy Level</label>
            <select
              v-model="editingActivity.energyLevel"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground mt-1"
            >
              <option :value="null">No rating</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button
            @click="cancelEdit"
            class="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveEdit"
            class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Save
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
import { InputParserService } from '~/services/inputParser'

const { loading, error, getActivityStats, getActivitiesForDate, deleteActivity, formatDuration } =
  useActivities()

// Local state for activities
const activities = ref([])

// Format time helper
const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Clean activity title (remove tags and priority)
const getCleanTitle = (title: string): string => {
  return InputParserService.cleanText(title)
}

// Load today's activities
const loadTodaysActivities = async () => {
  const today = new Date()
  activities.value = await getActivitiesForDate(today)
}

// Actions
const refreshActivities = async () => {
  await loadTodaysActivities()
}

const editingActivity = ref<any>(null)

const editActivity = (activity: any) => {
  editingActivity.value = {
    ...activity,
    // Show clean title for editing (without tags/priority)
    title: getCleanTitle(activity.title),
  }
}

const saveEdit = async () => {
  if (!editingActivity.value) return

  await updateActivity(editingActivity.value.id, {
    title: editingActivity.value.title,
    focusRating: editingActivity.value.focusRating,
    energyLevel: editingActivity.value.energyLevel,
  })

  editingActivity.value = null
}

const cancelEdit = () => {
  editingActivity.value = null
}

const removeActivity = async (id: string) => {
  if (confirm('Are you sure you want to delete this activity?')) {
    await deleteActivity(id)
  }
}

// Event handler reference for cleanup
let activitySavedHandler: (() => void) | null = null

// Initialize and auto-refresh when new activities are added
onMounted(async () => {
  // Load today's activities on mount
  await refreshActivities()

  // Create and store event handler for cleanup
  activitySavedHandler = () => {
    refreshActivities()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('activity-saved', activitySavedHandler)
  }
})

// Cleanup event listener on unmount
onUnmounted(() => {
  if (typeof window !== 'undefined' && activitySavedHandler) {
    window.removeEventListener('activity-saved', activitySavedHandler)
    activitySavedHandler = null
  }
})
</script>