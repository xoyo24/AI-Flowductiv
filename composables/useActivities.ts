import { computed, readonly, ref } from 'vue'
import type { Activity } from '~/server/database/schema'

export interface ActivityInput {
  title: string
  description?: string
  durationMs: number
  startTime: Date
  endTime: Date
  tags?: string[]
  priority?: number | null
  focusRating?: number | null
}

export interface HeatmapDay {
  date: string // YYYY-MM-DD format
  count: number
  totalTime: number
  productivityScore: number // 0-1 based on time and activity count
}

// Filter types for the universal filter system
export interface ActivityFilters {
  tags?: string[]
  dateRange?: { start: Date; end: Date }
  priority?: number[]
  focusRating?: number[]
  minDuration?: number
  maxDuration?: number
}

// Global singleton state - shared across all useActivities() calls
const activities = ref<Activity[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Universal filter state - shared across all useActivities() calls
const activeFilters = ref<ActivityFilters>({})
const filterCount = ref(0)

export const useActivities = () => {

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

  // Get activities with pagination
  const getActivities = async (page = 1, limit = 10): Promise<Activity[]> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ data: Activity[] }>('/api/activities', {
        query: { page, limit },
      })

      // If it's page 1, replace activities, otherwise append
      if (page === 1) {
        activities.value = response.data
      } else {
        activities.value.push(...response.data)
      }

      return response.data
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      error.value = 'Failed to load activities.'
      return []
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

  // Format relative time helper
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return diffMins <= 1 ? 'just now' : `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      })
    }
  }

  // Get heatmap data for the last 12 weeks (84 days)
  const getHeatmapData = async (): Promise<HeatmapDay[]> => {
    loading.value = true
    error.value = null

    try {
      // Generate 84 days (12 weeks) from today going back
      const today = new Date()
      const twelveWeeksAgo = new Date(today)
      twelveWeeksAgo.setDate(today.getDate() - 83) // Start from 83 days ago to include today

      const promises: Promise<Activity[]>[] = []
      const dates: string[] = []

      // Generate all dates for the past 84 days (12 weeks)
      for (let i = 0; i < 84; i++) {
        const currentDate = new Date(twelveWeeksAgo)
        currentDate.setDate(twelveWeeksAgo.getDate() + i)
        const dateStr = currentDate.toISOString().split('T')[0]
        dates.push(dateStr)
        promises.push(getActivitiesForDate(currentDate))
      }

      // Fetch all activities for all dates
      const allDayActivities = await Promise.all(promises)

      // Process each day's data
      const heatmapData: HeatmapDay[] = dates.map((date, index) => {
        const dayActivities = allDayActivities[index]
        const count = dayActivities.length
        const totalTime = dayActivities.reduce((sum, activity) => sum + activity.durationMs, 0)

        // Calculate productivity score (0-1) based on time and activity count
        // 8 hours (28800000ms) of productive time = 1.0 score
        // Bonus for having multiple focused sessions
        const timeScore = Math.min(totalTime / (8 * 60 * 60 * 1000), 1)
        const activityBonus = count > 0 ? Math.min(count / 10, 0.2) : 0 // Up to 20% bonus for multiple activities
        const productivityScore = Math.min(timeScore + activityBonus, 1)

        return {
          date,
          count,
          totalTime,
          productivityScore,
        }
      })

      return heatmapData
    } catch (err) {
      console.error('Failed to fetch heatmap data:', err)
      error.value = 'Failed to load heatmap data.'
      return []
    } finally {
      loading.value = false
    }
  }

  // Universal filtering system
  const filteredActivities = computed(() => {
    let filtered = [...activities.value]
    
    // Apply tag filters (AND logic - activity must have ALL selected tags)
    if (activeFilters.value.tags && activeFilters.value.tags.length > 0) {
      filtered = filtered.filter(activity => {
        if (!activity.tags || activity.tags.length === 0) return false
        return activeFilters.value.tags!.every(tag => activity.tags!.includes(tag))
      })
    }
    
    // Apply date range filter
    if (activeFilters.value.dateRange) {
      const { start, end } = activeFilters.value.dateRange
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.endTime)
        return activityDate >= start && activityDate <= end
      })
    }
    
    // Apply priority filter
    if (activeFilters.value.priority && activeFilters.value.priority.length > 0) {
      filtered = filtered.filter(activity => 
        activity.priority !== null && 
        activeFilters.value.priority!.includes(activity.priority)
      )
    }
    
    // Apply focus rating filter
    if (activeFilters.value.focusRating && activeFilters.value.focusRating.length > 0) {
      filtered = filtered.filter(activity => 
        activity.focusRating !== null && 
        activeFilters.value.focusRating!.includes(activity.focusRating)
      )
    }
    
    
    // Apply duration filters
    if (activeFilters.value.minDuration !== undefined) {
      filtered = filtered.filter(activity => activity.durationMs >= activeFilters.value.minDuration!)
    }
    
    if (activeFilters.value.maxDuration !== undefined) {
      filtered = filtered.filter(activity => activity.durationMs <= activeFilters.value.maxDuration!)
    }
    
    return filtered
  })
  
  // Filter metadata
  const filterMetadata = computed(() => {
    const totalActivities = activities.value.length
    const filteredCount = filteredActivities.value.length
    const hasActiveFilters = Object.values(activeFilters.value).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter !== undefined
    )
    
    return {
      totalActivities,
      filteredCount,
      hasActiveFilters,
      hiddenCount: totalActivities - filteredCount
    }
  })
  
  // Filter actions
  const addTagFilter = (tag: string) => {
    if (!activeFilters.value.tags) {
      activeFilters.value.tags = []
    }
    if (!activeFilters.value.tags.includes(tag)) {
      activeFilters.value.tags.push(tag)
      updateFilterCount()
    }
  }
  
  const removeTagFilter = (tag: string) => {
    if (activeFilters.value.tags) {
      activeFilters.value.tags = activeFilters.value.tags.filter(t => t !== tag)
      if (activeFilters.value.tags.length === 0) {
        delete activeFilters.value.tags
      }
      updateFilterCount()
    }
  }
  
  const setDateRangeFilter = (start: Date, end: Date) => {
    activeFilters.value.dateRange = { start, end }
    updateFilterCount()
  }
  
  const clearDateRangeFilter = () => {
    delete activeFilters.value.dateRange
    updateFilterCount()
  }
  
  const clearAllFilters = () => {
    activeFilters.value = {}
    updateFilterCount()
  }

  // Advanced filter actions
  const setPriorityFilter = (priorities: number[]) => {
    if (priorities.length > 0) {
      activeFilters.value.priority = priorities
    } else {
      delete activeFilters.value.priority
    }
    updateFilterCount()
  }

  const setFocusRatingFilter = (ratings: number[]) => {
    if (ratings.length > 0) {
      activeFilters.value.focusRating = ratings
    } else {
      delete activeFilters.value.focusRating
    }
    updateFilterCount()
  }


  const setDurationRangeFilter = (minDuration?: number, maxDuration?: number) => {
    // Always set both values (including undefined to clear them)
    if (minDuration !== undefined) {
      activeFilters.value.minDuration = minDuration
    } else {
      delete activeFilters.value.minDuration
    }
    
    if (maxDuration !== undefined) {
      activeFilters.value.maxDuration = maxDuration
    } else {
      delete activeFilters.value.maxDuration
    }
    
    updateFilterCount()
  }

  const clearDurationRangeFilter = () => {
    delete activeFilters.value.minDuration
    delete activeFilters.value.maxDuration
    updateFilterCount()
  }
  
  const updateFilterCount = () => {
    filterCount.value = Object.values(activeFilters.value).reduce((count, filter) => {
      if (Array.isArray(filter)) return count + filter.length
      return filter !== undefined ? count + 1 : count
    }, 0)
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
    
    // Filtering system
    filteredActivities: readonly(filteredActivities),
    activeFilters: readonly(activeFilters),
    filterMetadata: readonly(filterMetadata),
    filterCount: readonly(filterCount),

    // Actions
    saveActivity,
    getActivities,
    getActivitiesForDate,
    updateActivity,
    deleteActivity,
    getHeatmapData,
    
    // Filter actions
    addTagFilter,
    removeTagFilter,
    setDateRangeFilter,
    clearDateRangeFilter,
    clearAllFilters,
    
    // Advanced filter actions
    setPriorityFilter,
    setFocusRatingFilter,
    setDurationRangeFilter,
    clearDurationRangeFilter,

    // Utilities
    formatDuration,
    formatRelativeTime,
  }
}
