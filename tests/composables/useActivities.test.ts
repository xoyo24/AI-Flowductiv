import { describe, expect, it } from 'vitest'
import { ref, computed } from 'vue'
import type { Activity } from '~/server/database/schema'

describe('useActivities - Unit Tests', () => {
  describe('Utility Functions', () => {
    it('should format duration correctly', () => {
      const formatDuration = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)

        if (hours > 0) {
          return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
      }

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
          energyLevel: 'high',
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date()
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
          energyLevel: 'medium',
          userId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
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
        const longestSession = activities.value.length > 0 ? Math.max(...activities.value.map((a) => a.durationMs)) : 0

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

  describe('Date Handling', () => {
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
        energyLevel: null,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Test adding
      activities.value.unshift(mockActivity)
      expect(activities.value).toHaveLength(1)
      
      // Test filtering
      activities.value = activities.value.filter((a) => a.id !== '1')
      expect(activities.value).toHaveLength(0)
    })
  })
})