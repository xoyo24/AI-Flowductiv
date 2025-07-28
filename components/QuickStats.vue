<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <h2 class="text-lg font-semibold text-foreground mb-4">Quick Stats</h2>

    <div v-if="todaysActivities.length === 0" class="text-center py-8 text-muted-foreground">
      <div class="mb-2">No data yet</div>
      <div class="text-sm">Stats will appear as you track activities</div>
    </div>

    <div v-else class="space-y-6">
      <!-- Time Distribution -->
      <div>
        <h3 class="text-sm font-medium text-foreground mb-3">Time by Category</h3>
        <div class="space-y-2">
          <div
            v-for="(stat, tag) in sortedTagStats"
            :key="tag"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-primary"></div>
              <span class="text-sm text-foreground">#{{ tag }}</span>
            </div>
            <div class="text-sm font-medium text-foreground">
              {{ formatDuration(stat.totalTime) }}
            </div>
          </div>
          
          <!-- Untagged time -->
          <div v-if="untaggedTime > 0" class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-gray-400"></div>
              <span class="text-sm text-muted-foreground">Untagged</span>
            </div>
            <div class="text-sm font-medium text-muted-foreground">
              {{ formatDuration(untaggedTime) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Breakdown -->
      <div v-if="priorityStats.length > 0">
        <h3 class="text-sm font-medium text-foreground mb-3">Priority Distribution</h3>
        <div class="space-y-2">
          <div
            v-for="priority in priorityStats"
            :key="priority.level"
            class="flex items-center justify-between"
          >
            <div class="flex items-center space-x-2">
              <div 
                :class="{
                  'w-3 h-3 rounded-full': true,
                  'bg-red-500': priority.level === 3,
                  'bg-yellow-500': priority.level === 2,
                  'bg-green-500': priority.level === 1
                }"
              ></div>
              <span class="text-sm text-foreground">Priority {{ priority.level }}</span>
            </div>
            <div class="text-sm font-medium text-foreground">
              {{ formatDuration(priority.totalTime) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Focus Insights -->
      <div v-if="focusInsights.averageRating">
        <h3 class="text-sm font-medium text-foreground mb-3">Focus Analysis</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-foreground">Average Focus</span>
            <div class="flex items-center space-x-1">
              <div
                v-for="i in 5"
                :key="i"
                :class="{
                  'w-3 h-3 rounded-full': true,
                  'bg-primary': i <= Math.round(focusInsights.averageRating),
                  'bg-gray-200 dark:bg-gray-700': i > Math.round(focusInsights.averageRating)
                }"
              />
              <span class="text-sm font-medium text-foreground ml-2">
                {{ focusInsights.averageRating.toFixed(1) }}
              </span>
            </div>
          </div>
          
          <div v-if="focusInsights.bestSession" class="text-xs text-muted-foreground">
            Best session: {{ focusInsights.bestSession.title }} ({{ focusInsights.bestSession.focusRating }}/5)
          </div>
        </div>
      </div>

      <!-- Session Patterns -->
      <div>
        <h3 class="text-sm font-medium text-foreground mb-3">Session Patterns</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-muted-foreground">Avg Session</div>
            <div class="font-medium text-foreground">{{ formatDuration(averageSessionLength) }}</div>
          </div>
          <div>
            <div class="text-muted-foreground">Total Sessions</div>
            <div class="font-medium text-foreground">{{ todaysActivities.length }}</div>
          </div>
        </div>
      </div>

      <!-- Today's Goal Progress -->
      <div v-if="goalProgress" class="border-t border-border pt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-foreground">Daily Goal</span>
          <span class="text-sm text-muted-foreground">{{ Math.round(goalProgress) }}%</span>
        </div>
        <div class="w-full bg-secondary rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${Math.min(goalProgress, 100)}%` }"
          ></div>
        </div>
        <div class="text-xs text-muted-foreground mt-1">
          {{ formatDuration(totalTime) }} / {{ formatDuration(dailyGoal) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { formatDuration, getActivitiesForDate } = useActivities()

// Local state for today's activities (for stats)
const todaysActivities = ref([])

// Event handler reference for cleanup
let activitySavedHandler: (() => void) | null = null

// Load today's activities for stats calculation
const loadTodaysActivities = async () => {
  const today = new Date()
  todaysActivities.value = await getActivitiesForDate(today)
}

// Load today's activities on mount
onMounted(async () => {
  await loadTodaysActivities()

  // Listen for new activities
  activitySavedHandler = async () => {
    await loadTodaysActivities()
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

// Daily goal (in milliseconds) - could be user configurable
const dailyGoal = ref(8 * 60 * 60 * 1000) // 8 hours

// Computed values for today's activities
const todaysTagStats = computed(() => {
  const tagStats = {}
  todaysActivities.value.forEach((activity) => {
    activity.tags?.forEach((tag) => {
      if (!tagStats[tag]) {
        tagStats[tag] = { count: 0, totalTime: 0 }
      }
      tagStats[tag].count++
      tagStats[tag].totalTime += activity.durationMs
    })
  })
  return tagStats
})

const sortedTagStats = computed(() => {
  return Object.entries(todaysTagStats.value)
    .sort(([, a], [, b]) => b.totalTime - a.totalTime)
    .reduce(
      (acc, [tag, stats]) => {
        acc[tag] = stats
        return acc
      },
      {} as Record<string, { count: number; totalTime: number }>
    )
})

const totalTime = computed(() => {
  return todaysActivities.value.reduce((sum, activity) => sum + activity.durationMs, 0)
})

const untaggedTime = computed(() => {
  const totalTaggedTime = Object.values(todaysTagStats.value).reduce(
    (sum, stat) => sum + stat.totalTime,
    0
  )
  return totalTime.value - totalTaggedTime
})

const priorityStats = computed(() => {
  const stats = [1, 2, 3]
    .map((level) => {
      const activitiesAtLevel = todaysActivities.value.filter((a) => a.priority === level)
      const totalTime = activitiesAtLevel.reduce((sum, a) => sum + a.durationMs, 0)
      return { level, totalTime, count: activitiesAtLevel.length }
    })
    .filter((stat) => stat.count > 0)

  return stats.sort((a, b) => b.totalTime - a.totalTime)
})

const focusInsights = computed(() => {
  const activitiesWithRating = todaysActivities.value.filter(
    (a) => a.focusRating !== null && a.focusRating !== undefined
  )

  if (activitiesWithRating.length === 0) {
    return { averageRating: null, bestSession: null }
  }

  const averageRating =
    activitiesWithRating.reduce((sum, a) => sum + (a.focusRating || 0), 0) /
    activitiesWithRating.length
  const bestSession = activitiesWithRating.reduce((best, current) =>
    (current.focusRating || 0) > (best.focusRating || 0) ? current : best
  )

  return { averageRating, bestSession }
})

const averageSessionLength = computed(() => {
  if (todaysActivities.value.length === 0) return 0
  return totalTime.value / todaysActivities.value.length
})

const goalProgress = computed(() => {
  return (totalTime.value / dailyGoal.value) * 100
})
</script>