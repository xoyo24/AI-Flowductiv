import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { calculateNewFocusTime } from '~/server/utils/focusTimeCalculator'
import { 
  formatDuration, 
  FOCUS_TIME_CONFIG 
} from '~/server/utils/focusTimeUtils'

// Mock database with more complex scenarios
const mockDb = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn()
}

vi.mock('~/server/database', () => ({
  db: mockDb,
  activities: {},
  aiSummaries: {}
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value }))
}))

vi.mock('better-sqlite3', () => ({
  default: vi.fn()
}))

describe('Rate Limiting Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockDb.select.mockReturnValue(mockDb)
    mockDb.from.mockReturnValue(mockDb)
    mockDb.where.mockReturnValue(mockDb)
    mockDb.orderBy.mockReturnValue(mockDb)
    mockDb.limit.mockReturnValue(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Boundary Conditions', () => {
    it('should handle exactly minimum focus time and activities', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Task 1', durationMs: 1200000, startTime: '2025-01-22T10:00:00Z', tags: [] }, // 20 min
        { title: 'Task 2', durationMs: 1200000, startTime: '2025-01-22T10:30:00Z', tags: [] }, // 20 min  
        { title: 'Task 3', durationMs: 2400000, startTime: '2025-01-22T11:00:00Z', tags: [] }  // 40 min
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(4800000) // Exactly 80 minutes
      expect(result.activityCount).toBe(3) // Exactly minimum activities
      expect(result.hasMinimumFocusTime).toBe(true) // 80 > 60 minutes
      expect(result.hasMinimumActivities).toBe(true) // 3 >= 3
      expect(result.canRequestSummary).toBe(true)
      expect(result.progressPercent).toBe(100)
      expect(result.remainingTimeNeeded).toBe(0)
    })

    it('should handle one millisecond short of minimum', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Task 1', durationMs: 1199999, startTime: '2025-01-22T10:00:00Z', tags: [] }, // 19m 59s 999ms
        { title: 'Task 2', durationMs: 1200000, startTime: '2025-01-22T10:30:00Z', tags: [] }, // 20 min
        { title: 'Task 3', durationMs: 2400000, startTime: '2025-01-22T11:00:00Z', tags: [] }  // 40 min
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(4799999) // 1ms short of 80 minutes
      expect(result.hasMinimumFocusTime).toBe(true) // Still > 60 minutes minimum
      expect(result.canRequestSummary).toBe(true)
    })

    it('should handle exactly minimum focus time but one activity short', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Long task 1', durationMs: 1800000, startTime: '2025-01-22T10:00:00Z', tags: [] }, // 30 min
        { title: 'Long task 2', durationMs: 1800000, startTime: '2025-01-22T11:00:00Z', tags: [] }  // 30 min
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(3600000) // Exactly 60 minutes
      expect(result.activityCount).toBe(2) // One short of minimum
      expect(result.hasMinimumFocusTime).toBe(true)
      expect(result.hasMinimumActivities).toBe(false)
      expect(result.canRequestSummary).toBe(false)
    })
  })

  describe('Time Zone and Date Handling', () => {
    it('should handle activities spanning midnight', async () => {
      const lastSummaryDate = new Date('2025-01-22T23:00:00Z')
      
      mockDb.limit.mockResolvedValueOnce([{
        id: '1',
        generatedAt: lastSummaryDate.toISOString(),
        userId: null
      }])
      
      const existingActivities = [
        {
          title: 'Late night work',
          durationMs: 1800000, // 30 minutes
          startTime: '2025-01-22T23:30:00Z',
          endTime: '2025-01-23T00:00:00Z', // Spans midnight
          userId: null
        },
        {
          title: 'Early morning work',
          durationMs: 1800000, // 30 minutes
          startTime: '2025-01-23T00:30:00Z',
          endTime: '2025-01-23T01:00:00Z',
          userId: null
        }
      ]
      mockDb.where.mockResolvedValueOnce(existingActivities)

      const currentActivities = [
        { title: 'Morning task', durationMs: 1800000, startTime: '2025-01-23T09:00:00Z', tags: [] }
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(5400000) // 90 minutes total
      expect(result.activityCount).toBe(3) // All activities counted
      expect(result.canRequestSummary).toBe(true)
    })

    it('should handle different time zones in activity timestamps', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'UTC task', durationMs: 1800000, startTime: '2025-01-22T10:00:00Z', tags: [] },
        { title: 'EST task', durationMs: 1800000, startTime: '2025-01-22T05:00:00-05:00', tags: [] }, // Same as 10:00 UTC
        { title: 'PST task', durationMs: 1800000, startTime: '2025-01-22T02:00:00-08:00', tags: [] }  // Same as 10:00 UTC
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(5400000) // 90 minutes
      expect(result.activityCount).toBe(3)
      expect(result.canRequestSummary).toBe(true)
    })
  })

  describe('Data Integrity Edge Cases', () => {
    it('should handle missing endTime in activities', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      
      const existingActivities = [
        {
          title: 'Task with missing endTime',
          durationMs: 1800000,
          startTime: '2025-01-22T10:00:00Z',
          endTime: null, // Missing endTime - should use startTime
          userId: null
        }
      ]
      mockDb.where.mockResolvedValueOnce(existingActivities)

      const currentActivities = [
        { title: 'Current', durationMs: 1800000, startTime: '2025-01-22T11:00:00Z', tags: [] }
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      // Should still work, using startTime when endTime is missing
      expect(result.totalNewFocusTime).toBe(3600000) // 60 minutes
      expect(result.activityCount).toBe(2)
      expect(result.canRequestSummary).toBe(false) // Need one more activity
    })

    it('should handle activities with negative duration', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Valid task', durationMs: 2400000, startTime: '2025-01-22T10:00:00Z', tags: [] },
        { title: 'Negative task', durationMs: -600000, startTime: '2025-01-22T11:00:00Z', tags: [] }, // Should be filtered
        { title: 'Another valid', durationMs: 1800000, startTime: '2025-01-22T12:00:00Z', tags: [] },
        { title: 'Zero task', durationMs: 0, startTime: '2025-01-22T13:00:00Z', tags: [] } // Should be filtered
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      // Should only count positive duration activities
      expect(result.totalNewFocusTime).toBe(4200000) // 70 minutes (40 + 30)
      expect(result.activityCount).toBe(2) // Only valid activities counted
      expect(result.canRequestSummary).toBe(false) // Need one more activity
    })

    it('should handle extremely large duration values', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Massive task', durationMs: Number.MAX_SAFE_INTEGER, startTime: '2025-01-22T10:00:00Z', tags: [] },
        { title: 'Normal task', durationMs: 1800000, startTime: '2025-01-22T11:00:00Z', tags: [] },
        { title: 'Another normal', durationMs: 1200000, startTime: '2025-01-22T12:00:00Z', tags: [] }
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      // Should handle large numbers without overflow
      expect(result.totalNewFocusTime).toBeGreaterThan(FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS)
      expect(result.activityCount).toBe(3)
      expect(result.canRequestSummary).toBe(true)
      expect(result.progressPercent).toBe(100) // Capped at 100%
    })
  })

  describe('Database Edge Cases', () => {
    it('should handle empty database responses', async () => {
      // Empty summary history
      mockDb.limit.mockResolvedValueOnce([])
      // Empty activity history
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'First ever task', durationMs: 4200000, startTime: '2025-01-22T10:00:00Z', tags: [] }, // 70 min
        { title: 'Second task', durationMs: 1800000, startTime: '2025-01-22T11:30:00Z', tags: [] }, // 30 min
        { title: 'Third task', durationMs: 600000, startTime: '2025-01-22T12:30:00Z', tags: [] } // 10 min
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(6600000) // 110 minutes
      expect(result.activityCount).toBe(3)
      expect(result.canRequestSummary).toBe(true)
      expect(result.lastSummaryDate).toEqual(new Date(0)) // Beginning of time
    })

    it('should handle null/undefined values in database responses', async () => {
      mockDb.limit.mockResolvedValueOnce([{
        id: '1',
        generatedAt: '2025-01-22T10:00:00Z',
        userId: null
      }])

      const existingActivities = [
        {
          title: null, // Null title
          durationMs: 1800000,
          startTime: '2025-01-22T11:00:00Z',
          endTime: '2025-01-22T11:30:00Z',
          userId: null
        },
        {
          title: 'Valid task',
          durationMs: null, // Null duration
          startTime: '2025-01-22T12:00:00Z',
          endTime: '2025-01-22T12:30:00Z',
          userId: null
        }
      ]
      mockDb.where.mockResolvedValueOnce(existingActivities)

      const currentActivities = [
        { title: 'Current task', durationMs: 3600000, startTime: '2025-01-22T13:00:00Z', tags: [] }
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      // Should handle null values gracefully (treat null duration as 0)
      expect(result.totalNewFocusTime).toBe(5400000) // 90 minutes (30 from first existing + 60 from current)
      expect(result.activityCount).toBe(2) // Only activities with valid duration
    })

    it('should handle database connection timeouts', async () => {
      // Mock database timeout
      mockDb.limit.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database timeout')), 100)
        })
      })

      const currentActivities = [
        { title: 'Test task', durationMs: 1800000, tags: [] }
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      // Should fallback gracefully
      expect(result.canRequestSummary).toBe(true)
      expect(result.error).toBe('Calculation failed - allowing request')
    })
  })

  describe('Memory and Performance Edge Cases', () => {
    it('should handle large number of activities efficiently', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      
      // Create 1000 existing activities
      const manyExistingActivities = Array.from({ length: 1000 }, (_, i) => ({
        title: `Activity ${i}`,
        durationMs: 60000, // 1 minute each
        startTime: new Date(Date.now() - (1000 - i) * 60000).toISOString(),
        endTime: new Date(Date.now() - (1000 - i - 1) * 60000).toISOString(),
        userId: null
      }))
      mockDb.where.mockResolvedValueOnce(manyExistingActivities)

      const currentActivities = [
        { title: 'Current', durationMs: 1800000, startTime: '2025-01-22T10:00:00Z', tags: [] }
      ]

      const startTime = Date.now()
      const result = await calculateNewFocusTime(null, currentActivities)
      const endTime = Date.now()

      // Should complete reasonably quickly (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000)
      
      // Should handle large dataset correctly
      expect(result.totalNewFocusTime).toBe(61800000) // 1000 minutes + 30 minutes
      expect(result.activityCount).toBe(1001)
      expect(result.canRequestSummary).toBe(true)
    })
  })

  describe('formatDuration edge cases', () => {
    it('should handle maximum safe integer duration', () => {
      const result = formatDuration(Number.MAX_SAFE_INTEGER)
      expect(result).toMatch(/hours?/)
      expect(result).not.toBe('0 minutes')
    })

    it('should handle floating point durations', () => {
      expect(formatDuration(1500.5)).toBe('0 minutes') // Rounds down
      expect(formatDuration(60500.7)).toBe('1 minutes') // Rounds down to 1 minute
    })

    it('should handle very small positive durations', () => {
      expect(formatDuration(1)).toBe('0 minutes') // Less than 1 minute
      expect(formatDuration(59999)).toBe('0 minutes') // 59.999 seconds
    })
  })
})