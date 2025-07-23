import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock the database queries
const mockDb = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn()
}

// Mock all database dependencies at the top level before any imports
vi.mock('better-sqlite3', () => ({
  default: vi.fn(() => ({
    pragma: vi.fn(),
    close: vi.fn()
  }))
}))

vi.mock('drizzle-orm/better-sqlite3', () => ({
  drizzle: vi.fn(() => mockDb)
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value }))
}))

// Now import after mocks are set up
import { calculateNewFocusTime } from '~/server/utils/focusTimeCalculator'
import { 
  formatDuration, 
  createRateLimitError,
  FOCUS_TIME_CONFIG 
} from '~/server/utils/focusTimeUtils'

describe('Focus Time Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock chain
    mockDb.select.mockReturnValue(mockDb)
    mockDb.from.mockReturnValue(mockDb)
    mockDb.where.mockReturnValue(mockDb)
    mockDb.orderBy.mockReturnValue(mockDb)
    mockDb.limit.mockReturnValue(mockDb)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateNewFocusTime', () => {
    it('should allow summary when sufficient focus time and activities provided', async () => {
      // Mock no previous summary
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Deep work', durationMs: 2400000, startTime: '2025-01-22T10:00:00Z', tags: [] }, // 40 min
        { title: 'Code review', durationMs: 1800000, startTime: '2025-01-22T11:00:00Z', tags: [] }, // 30 min  
        { title: 'Planning', durationMs: 1200000, startTime: '2025-01-22T12:00:00Z', tags: [] } // 20 min
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.canRequestSummary).toBe(true)
      expect(result.hasMinimumFocusTime).toBe(true)
      expect(result.hasMinimumActivities).toBe(true)
      expect(result.totalNewFocusTime).toBe(5400000) // 90 minutes total
      expect(result.activityCount).toBe(3)
      expect(result.progressPercent).toBe(100)
      expect(result.remainingTimeNeeded).toBe(0)
    })

    it('should block summary when insufficient focus time', async () => {
      // Mock no previous summary
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Quick task', durationMs: 300000, startTime: '2025-01-22T10:00:00Z', tags: [] } // 5 minutes
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.canRequestSummary).toBe(false)
      expect(result.hasMinimumFocusTime).toBe(false)
      expect(result.hasMinimumActivities).toBe(false)
      expect(result.totalNewFocusTime).toBe(300000) // 5 minutes
      expect(result.activityCount).toBe(1)
      expect(result.progressPercent).toBe(8) // 5 minutes out of 60
      expect(result.remainingTimeNeeded).toBe(3300000) // 55 minutes remaining
    })

    it('should calculate correctly with existing activities since last summary', async () => {
      const lastSummaryDate = new Date('2025-01-22T08:00:00Z')
      
      // Mock existing summary
      mockDb.limit.mockResolvedValueOnce([{
        id: '1',
        generatedAt: lastSummaryDate.toISOString(),
        userId: null
      }])
      
      // Mock existing activities since summary
      const existingActivities = [
        { 
          title: 'Previous work', 
          durationMs: 2400000, // 40 minutes
          startTime: '2025-01-22T09:00:00Z',
          endTime: '2025-01-22T09:40:00Z',
          userId: null
        }
      ]
      mockDb.where.mockResolvedValueOnce(existingActivities)

      const currentActivities = [
        { title: 'Current work', durationMs: 1800000, startTime: '2025-01-22T10:00:00Z', tags: [] } // 30 minutes
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(4200000) // 70 minutes total (40 + 30)
      expect(result.activityCount).toBe(2) // existing + current
      expect(result.hasMinimumFocusTime).toBe(true) // 70 minutes > 60 minutes
      expect(result.hasMinimumActivities).toBe(false) // 2 < 3 required
      expect(result.canRequestSummary).toBe(false) // needs more activities
    })

    it('should handle activities older than last summary', async () => {
      const lastSummaryDate = new Date('2025-01-22T10:00:00Z')
      
      // Mock existing summary
      mockDb.limit.mockResolvedValueOnce([{
        id: '1', 
        generatedAt: lastSummaryDate.toISOString(),
        userId: null
      }])
      
      // Mock activities - some before, some after summary
      const allActivities = [
        {
          title: 'Before summary',
          durationMs: 1800000, // 30 minutes
          startTime: '2025-01-22T09:00:00Z',
          endTime: '2025-01-22T09:30:00Z',
          userId: null
        },
        {
          title: 'After summary', 
          durationMs: 1200000, // 20 minutes
          startTime: '2025-01-22T11:00:00Z',
          endTime: '2025-01-22T11:20:00Z',
          userId: null
        }
      ]
      mockDb.where.mockResolvedValueOnce(allActivities)

      const currentActivities = [
        { title: 'Current', durationMs: 600000, startTime: '2025-01-22T12:00:00Z', tags: [] } // 10 minutes
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      // Should only count activities after last summary (20 + 10 = 30 minutes)
      expect(result.totalNewFocusTime).toBe(1800000) // 30 minutes
      expect(result.activityCount).toBe(2) // after summary + current
      expect(result.hasMinimumFocusTime).toBe(false) // 30 minutes < 60 required
    })

    it('should handle database errors gracefully with fallback', async () => {
      // Mock database error
      mockDb.limit.mockRejectedValueOnce(new Error('Database connection failed'))

      const currentActivities = [
        { title: 'Test', durationMs: 1000000, tags: [] }
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      // Should fallback to allowing request
      expect(result.canRequestSummary).toBe(true)
      expect(result.error).toBe('Calculation failed - allowing request')
      expect(result.hasMinimumFocusTime).toBe(true)
      expect(result.hasMinimumActivities).toBe(true)
    })

    it('should filter out incomplete activities (zero duration)', async () => {
      mockDb.limit.mockResolvedValueOnce([])
      mockDb.where.mockResolvedValueOnce([])

      const currentActivities = [
        { title: 'Complete', durationMs: 3600000, tags: [] }, // 60 minutes
        { title: 'Incomplete', durationMs: 0, tags: [] }, // Should be filtered out
        { title: 'Another complete', durationMs: 1800000, tags: [] }, // 30 minutes
        { title: 'Running', durationMs: 300000, tags: [] } // 5 minutes
      ]

      const result = await calculateNewFocusTime(null, currentActivities)

      expect(result.totalNewFocusTime).toBe(5700000) // 95 minutes (60+30+5)
      expect(result.activityCount).toBe(3) // Only completed activities counted
    })
  })

  describe('formatDuration', () => {
    it('should format zero duration', () => {
      expect(formatDuration(0)).toBe('0 minutes')
      expect(formatDuration(-1000)).toBe('0 minutes')
    })

    it('should format minutes only', () => {
      expect(formatDuration(300000)).toBe('5 minutes') // 5 minutes
      expect(formatDuration(60000)).toBe('1 minutes') // 1 minute
      expect(formatDuration(3540000)).toBe('59 minutes') // 59 minutes
    })

    it('should format hours only', () => {
      expect(formatDuration(3600000)).toBe('1 hour') // 1 hour
      expect(formatDuration(7200000)).toBe('2 hours') // 2 hours
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(3900000)).toBe('1 hour 5 minutes') // 1h 5m
      expect(formatDuration(7740000)).toBe('2 hours 9 minutes') // 2h 9m
      expect(formatDuration(5460000)).toBe('1 hour 31 minutes') // 1h 31m
    })
  })

  describe('createRateLimitError', () => {
    it('should create error for insufficient focus time only', () => {
      const focusAnalysis = {
        canRequestSummary: false,
        hasMinimumFocusTime: false,
        hasMinimumActivities: true,
        timeToNextSummary: '30 minutes',
        progressPercent: 50,
        activityCount: 3,
        requiredActivityCount: 3,
        totalNewFocusTime: 1800000,
        requiredFocusTime: 3600000
      }

      const error = createRateLimitError(focusAnalysis)

      expect(error.statusCode).toBe(429)
      expect(error.statusMessage).toBe('Track more focus time to unlock AI summary')
      expect(error.data.reasons).toEqual(['Track 30 minutes more focus time'])
      expect(error.data.progress.focusTimePercent).toBe(50)
      expect(error.data.progress.activitiesNeeded).toBe(0)
      expect(error.data.current.focusTime).toBe('30 minutes')
      expect(error.data.requirements.minimumFocusTime).toBe('1 hour')
    })

    it('should create error for insufficient activities only', () => {
      const focusAnalysis = {
        canRequestSummary: false,
        hasMinimumFocusTime: true,
        hasMinimumActivities: false,
        timeToNextSummary: '0 minutes',
        progressPercent: 100,
        activityCount: 1,
        requiredActivityCount: 3,
        totalNewFocusTime: 3600000,
        requiredFocusTime: 3600000
      }

      const error = createRateLimitError(focusAnalysis)

      expect(error.data.reasons).toEqual(['Complete 2 more activities'])
      expect(error.data.progress.activitiesNeeded).toBe(2)
      expect(error.data.progress.focusTimePercent).toBe(100)
    })

    it('should create error for both insufficient focus time and activities', () => {
      const focusAnalysis = {
        canRequestSummary: false,
        hasMinimumFocusTime: false,
        hasMinimumActivities: false,
        timeToNextSummary: '45 minutes',
        progressPercent: 25,
        activityCount: 1,
        requiredActivityCount: 3,
        totalNewFocusTime: 900000,
        requiredFocusTime: 3600000
      }

      const error = createRateLimitError(focusAnalysis)

      expect(error.data.reasons).toEqual([
        'Track 45 minutes more focus time',
        'Complete 2 more activities'
      ])
      expect(error.data.progress.focusTimePercent).toBe(25)
      expect(error.data.progress.activitiesNeeded).toBe(2)
    })
  })

  describe('FOCUS_TIME_CONFIG constants', () => {
    it('should have correct configuration values', () => {
      expect(FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS).toBe(60 * 60 * 1000) // 1 hour
      expect(FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT).toBe(3) // 3 activities
    })
  })
})