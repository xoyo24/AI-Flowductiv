import type { Activity, NewActivity } from '~/server/database/schema'

export interface ActivityInput {
  title: string
  description?: string
  durationMs: number
  startTime: Date
  endTime: Date
  tags?: string[]
  priority?: number | null
  focusRating?: number | null
  energyLevel?: string | null
}

export const useActivities = () => {
  // Reactive state
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Save new activity
  const saveActivity = async (activityInput: ActivityInput): Promise<Activity | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ data: Activity }>('/api/activities', {
        method: 'POST',
        body: {
          title: activityInput.title,
          description: activityInput.description,
          durationMs: activityInput.durationMs,
          startTime: activityInput.startTime.toISOString(),
          endTime: activityInput.endTime.toISOString(),
          tags: activityInput.tags || [],
          priority: activityInput.priority,
          focusRating: activityInput.focusRating,
          energyLevel: activityInput.energyLevel,
        },
      })

      // Add to local state
      activities.value.unshift(response.data)
      return response.data
    } catch (err) {
      console.error('Failed to save activity:', err)
      error.value = 'Failed to save activity. Please try again.'
      return null
    } finally {
      loading.value = false
    }
  }

  // Get activities for a specific date
  const getActivitiesForDate = async (date: Date): Promise<Activity[]> => {
    loading.value = true
    error.value = null

    try {
      const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const response = await $fetch<{ data: Activity[] }>('/api/activities', {
        query: { date: dateStr },
      })

      return response.data
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      error.value = 'Failed to load activities.'
      return []
    } finally {
      loading.value = false
    }
  }

  // Get activities for today
  const getTodaysActivities = async (): Promise<Activity[]> => {
    const today = new Date()
    const todaysActivities = await getActivitiesForDate(today)
    activities.value = todaysActivities
    return todaysActivities
  }

  // Update an existing activity
  const updateActivity = async (
    id: string,
    updates: Partial<ActivityInput>
  ): Promise<Activity | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ data: Activity }>(`/api/activities/${id}`, {
        method: 'PATCH',
        body: updates,
      })

      // Update local state
      const index = activities.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        activities.value[index] = response.data
      }

      return response.data
    } catch (err) {
      console.error('Failed to update activity:', err)
      error.value = 'Failed to update activity.'
      return null
    } finally {
      loading.value = false
    }
  }

  // Delete an activity
  const deleteActivity = async (id: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await $fetch(`/api/activities/${id}`, {
        method: 'DELETE',
      })

      // Remove from local state
      activities.value = activities.value.filter((a) => a.id !== id)
      return true
    } catch (err) {
      console.error('Failed to delete activity:', err)
      error.value = 'Failed to delete activity.'
      return false
    } finally {
      loading.value = false
    }
  }

  // Get activity statistics
  const getActivityStats = computed(() => {
    const totalTime = activities.value.reduce((sum, activity) => sum + activity.durationMs, 0)
    const activityCount = activities.value.length

    // Group by tags
    const tagStats = activities.value.reduce(
      (acc, activity) => {
        activity.tags?.forEach((tag) => {
          if (!acc[tag]) {
            acc[tag] = { count: 0, totalTime: 0 }
          }
          acc[tag].count++
          acc[tag].totalTime += activity.durationMs
        })
        return acc
      },
      {} as Record<string, { count: number; totalTime: number }>
    )

    // Average focus rating
    const activitiesWithRating = activities.value.filter((a) => a.focusRating !== null)
    const averageFocus =
      activitiesWithRating.length > 0
        ? activitiesWithRating.reduce((sum, a) => sum + (a.focusRating || 0), 0) /
          activitiesWithRating.length
        : null

    return {
      totalTime,
      activityCount,
      tagStats,
      averageFocus,
      longestSession: Math.max(...activities.value.map((a) => a.durationMs), 0),
    }
  })

  // Format duration helper
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Initialize - load today's activities (removed onMounted to fix warning)
  // Components should call getTodaysActivities() explicitly

  return {
    // State (readonly)
    activities: readonly(activities),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    getActivityStats,

    // Actions
    saveActivity,
    getActivitiesForDate,
    getTodaysActivities,
    updateActivity,
    deleteActivity,

    // Utilities
    formatDuration,
  }
}
