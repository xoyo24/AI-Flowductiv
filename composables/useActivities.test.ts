import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useActivities } from '~/composables/useActivities'
import type { Activity } from '~/server/database/schema'

// Simple mocking approach - use the global $fetch mock from setup.ts
const mockFetch = vi.fn()

// Set up $fetch globally for this test
globalThis.$fetch = mockFetch

describe('useActivities - Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe('Activity Management', () => {
    it('should save activity and update reactive state', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValue({
        data: { id: 'test-1', title: 'Test Activity', durationMs: 1800000 },
      })

      const { saveActivity, activities, loading, error } = useActivities()

      const activityInput = {
        title: 'Test Activity',
        description: 'Test description',
        durationMs: 1800000,
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T10:30:00Z'),
        tags: ['test', 'integration'],
        priority: 2,
        focusRating: 4,
      }

      const result = await saveActivity(activityInput)

      // Verify API was called correctly
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', {
        method: 'POST',
        body: expect.objectContaining({
          title: 'Test Activity',
          durationMs: 1800000,
        }),
      })

      // Test composable behavior
      expect(result).toBeTruthy()
      expect(result?.title).toBe('Test Activity')

      // Test Vue reactivity - activity should be added to local state
      expect(activities.value).toHaveLength(1)
      expect(activities.value[0].title).toBe('Test Activity')

      // Test state management
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
    })

    it('should get activities and update reactive state', async () => {
      // Mock GET response with sample activities
      mockFetch.mockResolvedValue({
        data: [{ id: 'existing-1', title: 'Existing Activity', durationMs: 900000 }],
      })

      const { getActivitiesForDate, activities, loading, error } = useActivities()

      // Test API call and reactive state update using getActivitiesForDate
      const today = new Date()
      const todaysActivities = await getActivitiesForDate(today)

      expect(Array.isArray(todaysActivities)).toBe(true)
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', {
        query: { date: expect.any(String) },
      })

      // Test date-specific fetch
      const dateActivities = await getActivitiesForDate(new Date('2023-01-01'))
      expect(Array.isArray(dateActivities)).toBe(true)
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockFetch.mockRejectedValue(new Error('Network error'))

      const { saveActivity, error, loading } = useActivities()

      const result = await saveActivity({
        title: 'Test Activity',
        durationMs: 1800000,
        startTime: new Date(),
        endTime: new Date(),
      })

      // Test error handling
      expect(result).toBe(null)
      expect(error.value).toBeTruthy()
      expect(loading.value).toBe(false)
    })

    it('should update and delete activities successfully', async () => {
      const { updateActivity, deleteActivity, loading, error } = useActivities()

      // Mock update response
      mockFetch.mockResolvedValueOnce({
        data: { id: 'test-id', title: 'Updated Activity', durationMs: 1800000 },
      })

      // Test update
      const updateResult = await updateActivity('test-id', { title: 'Updated Title' })
      expect(updateResult).toBeTruthy()
      expect(updateResult?.title).toBe('Updated Activity')

      // Verify API call
      expect(mockFetch).toHaveBeenCalledWith('/api/activities/test-id', {
        method: 'PATCH',
        body: { title: 'Updated Title' },
      })

      // Mock delete response
      mockFetch.mockResolvedValueOnce({ message: 'Activity deleted successfully' })

      // Test delete
      const deleteResult = await deleteActivity('test-id')
      expect(deleteResult).toBe(true)

      // Verify delete API call
      expect(mockFetch).toHaveBeenCalledWith('/api/activities/test-id', {
        method: 'DELETE',
      })

      // State should be clean
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
    })
  })

  describe('Component API Surface', () => {
    it('should provide complete reactive API', () => {
      const {
        activities,
        loading,
        error,
        getActivityStats,
        saveActivity,
        getActivitiesForDate,
        getTodaysActivities,
        updateActivity,
        deleteActivity,
        formatDuration,
      } = useActivities()

      // Verify all properties exist and are reactive
      expect(activities.value).toBeInstanceOf(Array)
      expect(typeof loading.value).toBe('boolean')
      expect(error.value === null || typeof error.value === 'string').toBe(true)
      expect(getActivityStats.value).toHaveProperty('totalTime')

      // Verify all methods exist
      expect(typeof saveActivity).toBe('function')
      expect(typeof getActivitiesForDate).toBe('function')
      expect(typeof updateActivity).toBe('function')
      expect(typeof deleteActivity).toBe('function')
      expect(typeof formatDuration).toBe('function')
    })
  })

  describe('Utility Functions (Pure Logic)', () => {
    it('should format duration correctly', () => {
      const { formatDuration } = useActivities()

      expect(formatDuration(30000)).toBe('0m')
      expect(formatDuration(60000)).toBe('1m')
      expect(formatDuration(3600000)).toBe('1h 0m')
      expect(formatDuration(3900000)).toBe('1h 5m')
      expect(formatDuration(7200000)).toBe('2h 0m')
    })
  })

  describe('Activity Stats Logic', () => {
    it('should calculate activity stats correctly', () => {
      const mockActivities: Activity[] = [
        {
          id: '1',
          title: 'Work',
          description: null,
          durationMs: 1800000, // 30 minutes
          startTime: new Date('2023-01-01T10:00:00Z'),
          endTime: new Date('2023-01-01T10:30:00Z'),
          tags: ['work', 'coding'],
          priority: 2,
          focusRating: 4,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Meeting',
          description: null,
          durationMs: 3600000, // 60 minutes
          startTime: new Date('2023-01-01T11:00:00Z'),
          endTime: new Date('2023-01-01T12:00:00Z'),
          tags: ['work', 'meeting'],
          priority: 1,
          focusRating: 3,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const activities = ref(mockActivities)

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

      const stats = getActivityStats.value

      expect(stats.totalTime).toBe(5400000) // 90 minutes total
      expect(stats.activityCount).toBe(2)
      expect(stats.tagStats.work.count).toBe(2)
      expect(stats.tagStats.coding.count).toBe(1)
      expect(stats.tagStats.meeting.count).toBe(1)
      expect(stats.averageFocus).toBe(3.5)
      expect(stats.longestSession).toBe(3600000)
    })

    it('should handle empty activities array', () => {
      const activities = ref<Activity[]>([])

      const getActivityStats = computed(() => {
        const totalTime = activities.value.reduce((sum, activity) => sum + activity.durationMs, 0)
        const activityCount = activities.value.length
        const tagStats = {}
        const averageFocus = null
        const longestSession =
          activities.value.length > 0 ? Math.max(...activities.value.map((a) => a.durationMs)) : 0

        return {
          totalTime,
          activityCount,
          tagStats,
          averageFocus,
          longestSession,
        }
      })

      const stats = getActivityStats.value

      expect(stats.totalTime).toBe(0)
      expect(stats.activityCount).toBe(0)
      expect(stats.tagStats).toEqual({})
      expect(stats.averageFocus).toBe(null)
      expect(stats.longestSession).toBe(0) // Should be 0 for empty array
    })
  })

  describe('Date Handling Logic', () => {
    it('should format dates correctly for API calls', () => {
      const testDate = new Date('2023-12-25T15:30:00Z')
      const dateStr = testDate.toISOString().split('T')[0]

      expect(dateStr).toBe('2023-12-25')
    })

    it('should handle timezone conversions', () => {
      const date = new Date('2023-06-15T10:30:00Z')
      const isoString = date.toISOString()

      expect(isoString).toBe('2023-06-15T10:30:00.000Z')
    })
  })

  describe('Reactive State Logic', () => {
    it('should handle state initialization', () => {
      const activities = ref<Activity[]>([])
      const loading = ref(false)
      const error = ref<string | null>(null)

      expect(activities.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBe(null)
    })

    it('should handle array operations', () => {
      const activities = ref<Activity[]>([])

      const mockActivity: Activity = {
        id: '1',
        title: 'Test',
        description: null,
        durationMs: 1000,
        startTime: new Date(),
        endTime: new Date(),
        tags: [],
        priority: null,
        focusRating: null,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Test adding
      activities.value.unshift(mockActivity)
      expect(activities.value).toHaveLength(1)

      // Test filtering
      activities.value = activities.value.filter((a) => a.id !== '1')
      expect(activities.value).toHaveLength(0)
    })
  })

  describe('Heatmap Date Filtering', () => {
    it('should filter activities by specific date when date range filter is set', async () => {
      // Mock activities data
      const mockActivities = [
        {
          id: '1',
          title: 'Activity 1',
          description: null,
          durationMs: 1800000, // 30 minutes
          startTime: new Date('2025-01-15T09:30:00Z'),
          endTime: new Date('2025-01-15T10:00:00Z'),
          tags: ['work'],
          priority: null,
          focusRating: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Activity 2',
          description: null,
          durationMs: 3600000, // 1 hour
          startTime: new Date('2025-01-16T13:00:00Z'),
          endTime: new Date('2025-01-16T14:00:00Z'),
          tags: ['personal'],
          priority: null,
          focusRating: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'Activity 3',
          description: null,
          durationMs: 2700000, // 45 minutes
          startTime: new Date('2025-01-15T15:15:00Z'),
          endTime: new Date('2025-01-15T16:00:00Z'),
          tags: ['work'],
          priority: null,
          focusRating: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Mock the fetch response
      mockFetch.mockResolvedValueOnce({ data: mockActivities })

      const { getActivities, filteredActivities, setDateRangeFilter } = useActivities()

      // Load activities
      await getActivities(1, 10)

      // Apply date filter for 2025-01-15 (UTC)
      const startOfDay = new Date('2025-01-15T00:00:00.000Z')
      const endOfDay = new Date('2025-01-15T23:59:59.999Z')

      setDateRangeFilter(startOfDay, endOfDay)

      // Should only show activities from 2025-01-15
      expect(filteredActivities.value).toHaveLength(2)
      expect(filteredActivities.value[0].id).toBe('1')
      expect(filteredActivities.value[1].id).toBe('3')
    })

    it('should clear date range filter and show all activities', async () => {
      // Mock activities data
      const mockActivities = [
        {
          id: '1',
          title: 'Activity 1',
          description: null,
          durationMs: 1800000,
          startTime: new Date('2025-01-15T10:00:00Z'),
          endTime: new Date('2025-01-15T10:30:00Z'),
          tags: [],
          priority: null,
          focusRating: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Activity 2',
          description: null,
          durationMs: 3600000,
          startTime: new Date('2025-01-16T13:00:00Z'),
          endTime: new Date('2025-01-16T14:00:00Z'),
          tags: [],
          priority: null,
          focusRating: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockFetch.mockResolvedValueOnce({ data: mockActivities })

      const { getActivities, filteredActivities, setDateRangeFilter, clearDateRangeFilter } =
        useActivities()

      await getActivities(1, 10)

      // Apply and then clear date filter
      const startOfDay = new Date('2025-01-15T00:00:00.000Z')
      const endOfDay = new Date('2025-01-15T23:59:59.999Z')

      setDateRangeFilter(startOfDay, endOfDay)
      expect(filteredActivities.value).toHaveLength(1)

      clearDateRangeFilter()
      expect(filteredActivities.value).toHaveLength(2)
    })

    it('should update filter metadata when date filter is applied', async () => {
      const mockActivities = [
        {
          id: '1',
          title: 'Activity 1',
          description: null,
          durationMs: 1800000,
          startTime: new Date('2025-01-15T10:00:00Z'),
          endTime: new Date('2025-01-15T10:30:00Z'),
          tags: [],
          priority: null,
          focusRating: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Activity 2',
          description: null,
          durationMs: 3600000,
          startTime: new Date('2025-01-16T13:00:00Z'),
          endTime: new Date('2025-01-16T14:00:00Z'),
          tags: [],
          priority: null,
          focusRating: null,
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockFetch.mockResolvedValueOnce({ data: mockActivities })

      const { getActivities, filterMetadata, setDateRangeFilter } = useActivities()

      await getActivities(1, 10)

      // Apply date filter
      const startOfDay = new Date('2025-01-15T00:00:00.000Z')
      const endOfDay = new Date('2025-01-15T23:59:59.999Z')

      setDateRangeFilter(startOfDay, endOfDay)

      const metadata = filterMetadata.value
      expect(metadata.hasActiveFilters).toBe(true)
      expect(metadata.totalActivities).toBe(2)
      expect(metadata.filteredCount).toBe(1)
      expect(metadata.hiddenCount).toBe(1)
    })
  })
})
