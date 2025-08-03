import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useInsights } from './useInsights'

// Mock useActivities composable
vi.mock('./useActivities', () => ({
  useActivities: () => ({
    getActivities: vi.fn(),
    getActivitiesForDate: vi.fn(),
    getActivityStats: ref({
      totalTime: 0,
      activityCount: 0,
      tagStats: {},
      averageFocus: null
    })
  })
}))

describe('useInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AI Insights Generation', () => {
    it('should generate peak hours insights from activity data', async () => {
      const { generatePeakHoursInsight, insights } = useInsights()

      // Mock activity data showing 9-11 AM peak productivity  
      const mockActivities = [
        { id: '1', startTime: '2025-08-03T09:00:00Z', endTime: '2025-08-03T10:00:00Z', durationMs: 3600000, focusRating: 5, tags: [] }, // 9 AM, 1 hour, high focus
        { id: '2', startTime: '2025-08-03T10:00:00Z', endTime: '2025-08-03T11:00:00Z', durationMs: 3600000, focusRating: 4, tags: [] }, // 10 AM, 1 hour, good focus
        { id: '3', startTime: '2025-08-03T14:00:00Z', endTime: '2025-08-03T14:30:00Z', durationMs: 1800000, focusRating: 2, tags: [] }, // 2 PM, 30 min, low focus
      ]

      await generatePeakHoursInsight(mockActivities)

      expect(insights.value.peakHours).toBeDefined()
      expect(insights.value.peakHours.timeRange).toBe('5 PM-7 PM')
      expect(insights.value.peakHours.confidence).toBeGreaterThan(0.3)
      expect(insights.value.peakHours.recommendation).toContain('scheduling important tasks')
    })

    it('should identify focus rating patterns and trends', async () => {
      const { generateFocusPatternInsight, insights } = useInsights()

      // Mock activity data showing declining focus pattern
      const mockActivities = [
        { id: '1', focusRating: 5, endTime: '2025-08-01T10:00:00Z', startTime: '2025-08-01T09:00:00Z', durationMs: 3600000, tags: [] },
        { id: '2', focusRating: 4, endTime: '2025-08-02T10:00:00Z', startTime: '2025-08-02T09:00:00Z', durationMs: 3600000, tags: [] },
        { id: '3', focusRating: 3, endTime: '2025-08-03T10:00:00Z', startTime: '2025-08-03T09:00:00Z', durationMs: 3600000, tags: [] },
      ]

      await generateFocusPatternInsight(mockActivities)

      expect(insights.value.focusPattern).toBeDefined()
      expect(insights.value.focusPattern.trend).toBe('declining')
      expect(insights.value.focusPattern.suggestion).toContain('Consider taking breaks')
    })

    it('should generate tag combination insights for optimal productivity', async () => {
      const { generateTagInsights, insights } = useInsights()

      // Mock activity data showing high-focus tag combinations
      const mockActivities = [
        { id: '1', tags: ['coding', 'morning'], focusRating: 5, durationMs: 7200000, startTime: '2025-08-03T09:00:00Z', endTime: '2025-08-03T11:00:00Z' },
        { id: '2', tags: ['coding', 'morning'], focusRating: 4, durationMs: 5400000, startTime: '2025-08-03T10:00:00Z', endTime: '2025-08-03T11:30:00Z' },
        { id: '3', tags: ['meetings'], focusRating: 2, durationMs: 1800000, startTime: '2025-08-03T14:00:00Z', endTime: '2025-08-03T14:30:00Z' },
      ]

      await generateTagInsights(mockActivities)

      expect(insights.value.tagCombinations).toBeDefined()
      expect(insights.value.tagCombinations.bestCombination).toEqual(['coding', 'morning'])
      expect(insights.value.tagCombinations.averageFocus).toBeGreaterThan(4)
      expect(insights.value.tagCombinations.recommendation).toContain('coding + morning')
    })

    it('should provide actionable recommendations based on activity patterns', async () => {
      const { generateActionableRecommendations, insights } = useInsights()

      const mockActivities = [
        { id: '1', startTime: '2025-08-03T09:00:00Z', endTime: '2025-08-03T09:30:00Z', durationMs: 1800000, focusRating: 2, tags: [] }, // Short, low focus
        { id: '2', startTime: '2025-08-03T10:30:00Z', endTime: '2025-08-03T12:30:00Z', durationMs: 7200000, focusRating: 5, tags: [] }, // Long, high focus
      ]

      await generateActionableRecommendations(mockActivities)

      expect(insights.value.recommendations).toBeDefined()
      expect(insights.value.recommendations.length).toBeGreaterThan(0)
      expect(insights.value.recommendations[0]).toMatchObject({
        type: expect.any(String),
        message: expect.any(String),
        confidence: expect.any(Number)
      })
    })
  })

  describe('Insight Confidence Scoring', () => {
    it('should calculate confidence scores based on data quality', () => {
      const { calculateConfidence } = useInsights()

      // High confidence: lots of data, clear patterns
      const highConfidenceScore = calculateConfidence(50, 0.8) // 50 data points, 80% pattern strength
      expect(highConfidenceScore).toBeGreaterThan(0.8)

      // Low confidence: little data, weak patterns  
      const lowConfidenceScore = calculateConfidence(5, 0.3) // 5 data points, 30% pattern strength
      expect(lowConfidenceScore).toBeLessThan(0.5)
    })
  })

  describe('Data Requirements', () => {
    it('should require minimum data threshold for reliable insights', () => {
      const { hasEnoughDataForInsights } = useInsights()

      // Not enough data
      expect(hasEnoughDataForInsights([])).toBe(false)
      expect(hasEnoughDataForInsights([{ id: '1' }])).toBe(false)

      // Enough data for basic insights
      const sufficientData = Array.from({ length: 5 }, (_, i) => ({ 
        id: `${i}`, 
        startTime: '2025-08-03T09:00:00Z', 
        endTime: '2025-08-03T10:00:00Z', 
        durationMs: 3600000, 
        tags: [] 
      }))
      expect(hasEnoughDataForInsights(sufficientData)).toBe(true)
    })
  })
})