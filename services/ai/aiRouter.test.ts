import { describe, expect, it } from 'vitest'
import { AIRouter } from '~/services/ai/aiRouter'
import { PromptTemplates } from '~/services/ai/prompts'

describe('AI Router Integration', () => {
  describe('Prompt Generation', () => {
    it('should generate valid daily summary prompts', () => {
      const activities = [
        { title: 'Work on project #urgent', durationMs: 3600000, tags: ['urgent'] },
        { title: 'Team meeting #work', durationMs: 1800000, tags: ['work'] },
      ]

      const prompt = PromptTemplates.dailySummary(activities)

      expect(prompt).toContain('daily productivity summary')
      expect(prompt).toContain('Work on project #urgent #urgent (1h)')
      expect(prompt).toContain('Team meeting #work #work (30m)')
      expect(prompt).toContain('Total time: 1h 30m')
    })
  })

  describe('Router Configuration', () => {
    it('should have claude as default provider', () => {
      const router = new AIRouter()
      expect(router.getProvider()).toBe('claude')
    })

    it('should allow provider switching', () => {
      const router = new AIRouter()
      router.setProvider('openai')
      expect(router.getProvider()).toBe('openai')
    })

    it('should track usage stats', () => {
      const router = new AIRouter()
      const stats = router.getUsageStats()
      expect(stats.totalTokens).toBe(0)
      expect(stats.requestCount).toBe(0)
      expect(stats.providers).toEqual({})
    })
  })
})
