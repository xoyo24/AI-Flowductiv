import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { $fetch } from '@nuxt/test-utils/runtime'

// Mock AI router to avoid real API calls
const mockGenerateDailySummary = vi.fn().mockResolvedValue({
  content: 'Mock AI summary for testing',
  provider: 'mock-claude',
  usage: {
    input_tokens: 100,
    output_tokens: 200
  }
})

vi.mock('~/services/ai/aiRouter', () => ({
  AIRouter: vi.fn().mockImplementation(() => ({
    generateDailySummary: mockGenerateDailySummary
  }))
}))

describe('AI Summary Rate Limiting Integration', () => {
  const API_URL = '/api/ai/daily-summary'

  beforeEach(async () => {
    // Clear any existing summaries or activities for clean tests
    // Note: In a real app, you might want to use a test database
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockGenerateDailySummary.mockClear()
  })

  describe('Application-Level Rate Limiting', () => {
    it('should reject request with insufficient focus time', async () => {
      const activities = [
        {
          title: 'Quick task',
          durationMs: 300000, // 5 minutes
          startTime: '2025-01-22T10:00:00Z',
          endTime: '2025-01-22T10:05:00Z',
          tags: []
        }
      ]

      try {
        await $fetch(API_URL, {
          method: 'POST',
          body: { activities }
        })
        expect.fail('Should have thrown rate limit error')
      } catch (error: any) {
        expect(error.status || error.statusCode).toBe(429)
        expect(error.statusMessage).toBe('Track more focus time to unlock AI summary')
        expect(error.data.reasons).toContain('Track 55 minutes more focus time')
        expect(error.data.reasons).toContain('Complete 2 more activities')
        expect(error.data.progress.focusTimePercent).toBe(8) // 5 minutes out of 60
        expect(error.data.progress.activitiesNeeded).toBe(2)
        expect(error.data.requirements.minimumFocusTime).toBe('1 hour')
        expect(error.data.requirements.minimumActivities).toBe(3)
      }
    })

    it('should reject request with sufficient time but insufficient activities', async () => {
      const activities = [
        {
          title: 'Long task',
          durationMs: 4200000, // 70 minutes
          startTime: '2025-01-22T10:00:00Z',
          endTime: '2025-01-22T11:10:00Z',
          tags: ['development']
        }
      ]

      try {
        await $fetch(API_URL, {
          method: 'POST',
          body: { activities }
        })
        expect.fail('Should have thrown rate limit error')
      } catch (error: any) {
        expect(error.status || error.statusCode).toBe(429)
        expect(error.data.reasons).toContain('Complete 2 more activities')
        expect(error.data.progress.focusTimePercent).toBe(100)
        expect(error.data.progress.activitiesNeeded).toBe(2)
        expect(error.data.current.activities).toBe(1)
      }
    })

    it('should allow request with sufficient focus time and activities', async () => {
      const activities = [
        {
          title: 'Deep work session',
          durationMs: 2400000, // 40 minutes
          startTime: '2025-01-22T10:00:00Z',
          endTime: '2025-01-22T10:40:00Z',
          tags: ['development']
        },
        {
          title: 'Code review',
          durationMs: 1200000, // 20 minutes
          startTime: '2025-01-22T11:00:00Z',
          endTime: '2025-01-22T11:20:00Z',
          tags: ['review']
        },
        {
          title: 'Planning session',
          durationMs: 1800000, // 30 minutes
          startTime: '2025-01-22T14:00:00Z',
          endTime: '2025-01-22T14:30:00Z',
          tags: ['planning']
        }
      ]

      const response = await $fetch(API_URL, {
        method: 'POST',
        body: { activities }
      })

      expect(response.message).toBe('Summary generated successfully')
      expect(response.data).toBeDefined()
      expect(response.data.content).toBe('Mock AI summary for testing')
      expect(response.data.provider).toBe('mock-claude')
      expect(response.usage.provider).toBe('mock-claude')
      expect(response.usage.tokens).toBe(300) // 100 + 200 from mock
    })

    it('should reject subsequent request shortly after successful summary', async () => {
      // First, make a successful request
      const firstActivities = [
        {
          title: 'Session 1',
          durationMs: 2400000, // 40 minutes
          startTime: '2025-01-22T10:00:00Z',
          endTime: '2025-01-22T10:40:00Z',
          tags: ['work']
        },
        {
          title: 'Session 2', 
          durationMs: 1800000, // 30 minutes
          startTime: '2025-01-22T11:00:00Z',
          endTime: '2025-01-22T11:30:00Z',
          tags: ['work']
        },
        {
          title: 'Session 3',
          durationMs: 1200000, // 20 minutes
          startTime: '2025-01-22T12:00:00Z',
          endTime: '2025-01-22T12:20:00Z',
          tags: ['work']
        }
      ]

      const firstResponse = await $fetch(API_URL, {
        method: 'POST',
        body: { activities: firstActivities }
      })
      expect(firstResponse.message).toBe('Summary generated successfully')

      // Now try a second request with minimal new activity
      const secondActivities = [
        {
          title: 'Quick follow-up',
          durationMs: 600000, // 10 minutes
          startTime: '2025-01-22T13:00:00Z',
          endTime: '2025-01-22T13:10:00Z',
          tags: []
        }
      ]

      try {
        await $fetch(API_URL, {
          method: 'POST',
          body: { activities: secondActivities }
        })
        expect.fail('Should have thrown rate limit error')
      } catch (error: any) {
        expect(error.status || error.statusCode).toBe(429)
        expect(error.data.reasons).toContain('Track 50 minutes more focus time')
        expect(error.data.reasons).toContain('Complete 2 more activities')
        expect(error.data.current.focusTime).toBe('10 minutes')
        expect(error.data.current.activities).toBe(1)
      }
    })
  })

  describe('Input Validation', () => {
    it('should reject request without activities', async () => {
      try {
        await $fetch(API_URL, {
          method: 'POST',
          body: {}
        })
        expect.fail('Should have thrown validation error')
      } catch (error: any) {
        expect(error.status || error.statusCode).toBe(400)
        expect(error.statusMessage).toBe('Activities array is required')
      }
    })

    it('should reject request with empty activities array', async () => {
      try {
        await $fetch(API_URL, {
          method: 'POST',
          body: { activities: [] }
        })
        expect.fail('Should have thrown validation error')
      } catch (error: any) {
        expect(error.status || error.statusCode).toBe(400)
        expect(error.statusMessage).toBe('No activities to summarize')
      }
    })

    it('should reject request with invalid activities format', async () => {
      try {
        await $fetch(API_URL, {
          method: 'POST',
          body: { activities: 'not an array' }
        })
        expect.fail('Should have thrown validation error')
      } catch (error: any) {
        expect(error.status || error.statusCode).toBe(400)
        expect(error.statusMessage).toBe('Activities array is required')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle activities with zero duration gracefully', async () => {
      const activities = [
        {
          title: 'Complete task',
          durationMs: 3600000, // 60 minutes
          startTime: '2025-01-22T10:00:00Z',
          endTime: '2025-01-22T11:00:00Z',
          tags: []
        },
        {
          title: 'Incomplete task',
          durationMs: 0, // Should be filtered out
          startTime: '2025-01-22T11:00:00Z',
          endTime: '2025-01-22T11:00:00Z',
          tags: []
        },
        {
          title: 'Another complete task',
          durationMs: 1800000, // 30 minutes
          startTime: '2025-01-22T12:00:00Z',
          endTime: '2025-01-22T12:30:00Z',
          tags: []
        },
        {
          title: 'Third complete task',
          durationMs: 600000, // 10 minutes
          startTime: '2025-01-22T13:00:00Z',
          endTime: '2025-01-22T13:10:00Z',
          tags: []
        }
      ]

      const response = await $fetch(API_URL, {
        method: 'POST',
        body: { activities }
      })

      // Should succeed with 100 minutes total (60+30+10), 3 valid activities
      expect(response.message).toBe('Summary generated successfully')
      expect(response.data).toBeDefined()
    })

    it('should handle very long activity durations', async () => {
      const activities = [
        {
          title: 'All-day work session',
          durationMs: 28800000, // 8 hours
          startTime: '2025-01-22T09:00:00Z',
          endTime: '2025-01-22T17:00:00Z',
          tags: ['marathon']
        },
        {
          title: 'Short break task',
          durationMs: 300000, // 5 minutes
          startTime: '2025-01-22T17:30:00Z',
          endTime: '2025-01-22T17:35:00Z',
          tags: []
        },
        {
          title: 'Wrap-up',
          durationMs: 900000, // 15 minutes
          startTime: '2025-01-22T18:00:00Z',
          endTime: '2025-01-22T18:15:00Z',
          tags: []
        }
      ]

      const response = await $fetch(API_URL, {
        method: 'POST',
        body: { activities }
      })

      // Should succeed - way more than required time and activities
      expect(response.message).toBe('Summary generated successfully')
      expect(response.data).toBeDefined()
    })
  })

  describe('Analytics Logging', () => {
    it('should log focus time analytics on requests', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log')
      
      const activities = [
        {
          title: 'Test session',
          durationMs: 1800000, // 30 minutes
          startTime: '2025-01-22T10:00:00Z',
          endTime: '2025-01-22T10:30:00Z',
          tags: []
        }
      ]

      try {
        await $fetch(API_URL, {
          method: 'POST',
          body: { activities }
        })
      } catch (error) {
        // Expected to fail due to insufficient focus time
      }

      // Verify analytics were logged
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '📊 Focus Time Analytics:',
        expect.objectContaining({
          totalFocusTime: 30, // 30 minutes
          activityCount: 1,
          progressPercent: expect.any(Number),
          canRequest: false,
          timeRemaining: expect.any(String)
        })
      )

      consoleLogSpy.mockRestore()
    })
  })
})