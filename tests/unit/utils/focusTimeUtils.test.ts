import { describe, it, expect } from 'vitest'
import { formatDuration, createRateLimitError, FOCUS_TIME_CONFIG } from '~/server/utils/focusTimeUtils'

describe('Focus Time Utilities', () => {
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

    it('should handle edge cases', () => {
      expect(formatDuration(Number.MAX_SAFE_INTEGER)).toMatch(/hours?/)
      expect(formatDuration(1500.5)).toBe('0 minutes') // Rounds down
      expect(formatDuration(60500.7)).toBe('1 minutes') // Rounds down to 1 minute
      expect(formatDuration(1)).toBe('0 minutes') // Less than 1 minute
      expect(formatDuration(59999)).toBe('0 minutes') // 59.999 seconds
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
      expect(error.data.requirements.minimumActivities).toBe(3)
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
      expect(error.data.current.activities).toBe(1)
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
      expect(error.data.current.focusTime).toBe('15 minutes') // 900000ms = 15 minutes
      expect(error.data.current.activities).toBe(1)
    })

    it('should handle zero activity count', () => {
      const focusAnalysis = {
        canRequestSummary: false,
        hasMinimumFocusTime: false,
        hasMinimumActivities: false,
        timeToNextSummary: '60 minutes',
        progressPercent: 0,
        activityCount: 0,
        requiredActivityCount: 3,
        totalNewFocusTime: 0,
        requiredFocusTime: 3600000
      }

      const error = createRateLimitError(focusAnalysis)

      expect(error.data.progress.activitiesNeeded).toBe(3)
      expect(error.data.current.activities).toBe(0)
      expect(error.data.current.focusTime).toBe('0 minutes')
    })

    it('should handle edge case with maximum values', () => {
      const focusAnalysis = {
        canRequestSummary: false,
        hasMinimumFocusTime: false,
        hasMinimumActivities: false,
        timeToNextSummary: '1 hour 30 minutes',
        progressPercent: 99,
        activityCount: 50,
        requiredActivityCount: 3,
        totalNewFocusTime: Number.MAX_SAFE_INTEGER,
        requiredFocusTime: 3600000
      }

      const error = createRateLimitError(focusAnalysis)

      expect(error.data.progress.activitiesNeeded).toBe(0) // Math.max(0, 3 - 50)
      expect(error.data.current.activities).toBe(50)
      expect(error.data.reasons).not.toContain('Complete 2 more activities') // Should not suggest more activities
    })
  })

  describe('FOCUS_TIME_CONFIG constants', () => {
    it('should have correct configuration values', () => {
      expect(FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS).toBe(60 * 60 * 1000) // 1 hour
      expect(FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT).toBe(3) // 3 activities
    })

    it('should have reasonable minimum values', () => {
      // Ensure configuration makes sense for productivity app
      expect(FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS).toBeGreaterThan(0)
      expect(FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS).toBeLessThan(24 * 60 * 60 * 1000) // Less than 24 hours
      expect(FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT).toBeGreaterThan(0)
      expect(FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT).toBeLessThan(100) // Reasonable upper bound
    })
  })

  describe('Rate Limiting Logic Validation', () => {
    it('should validate that 1 hour is the correct minimum for meaningful insights', () => {
      const oneHourMs = 60 * 60 * 1000
      expect(FOCUS_TIME_CONFIG.MIN_FOCUS_TIME_MS).toBe(oneHourMs)
      
      // Verify that this provides meaningful granularity
      expect(formatDuration(oneHourMs)).toBe('1 hour')
      expect(formatDuration(oneHourMs - 1)).toBe('59 minutes')
      expect(formatDuration(oneHourMs + 1800000)).toBe('1 hour 30 minutes') // +30 minutes
    })

    it('should validate that 3 activities is reasonable for insight generation', () => {
      expect(FOCUS_TIME_CONFIG.MIN_ACTIVITY_COUNT).toBe(3)
      
      // This ensures we have enough data points for meaningful analysis
      // but is not too restrictive for users
    })
  })

  describe('Error Message Clarity', () => {
    it('should provide clear, actionable feedback to users', () => {
      const focusAnalysis = {
        canRequestSummary: false,
        hasMinimumFocusTime: false,
        hasMinimumActivities: false,
        timeToNextSummary: '42 minutes',
        progressPercent: 30,
        activityCount: 1,
        requiredActivityCount: 3,
        totalNewFocusTime: 1080000, // 18 minutes
        requiredFocusTime: 3600000
      }

      const error = createRateLimitError(focusAnalysis)

      // Check that error messages are user-friendly
      expect(error.data.reasons[0]).toMatch(/Track \d+ minutes more focus time/)
      expect(error.data.reasons[1]).toMatch(/Complete \d+ more activities/)
      
      // Check that requirements are clearly stated
      expect(error.data.requirements.minimumFocusTime).toBe('1 hour')
      expect(error.data.requirements.minimumActivities).toBe(3)
      
      // Check that current progress is shown
      expect(error.data.current.focusTime).toBe('18 minutes')
      expect(error.data.current.activities).toBe(1)
    })
  })
})