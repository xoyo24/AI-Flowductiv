import { describe, it, expect } from 'vitest'
import { PromptTemplates } from '~/services/ai/prompts'

describe('PromptTemplates - Unit Tests', () => {
  describe('Daily Summary Prompt', () => {
    it('should generate daily summary prompt with activities', () => {
      const activities = [
        { title: 'Work on project #urgent', durationMs: 3600000, tags: ['urgent'] },
        { title: 'Meeting #work', durationMs: 1800000, tags: ['work'] },
        { title: 'Code review', durationMs: 900000, tags: [] }
      ]

      const prompt = PromptTemplates.dailySummary(activities)

      expect(prompt).toContain('daily productivity summary')
      expect(prompt).toContain('Work on project #urgent #urgent (1h)')
      expect(prompt).toContain('Meeting #work #work (30m)')
      expect(prompt).toContain('Code review (15m)')
      expect(prompt).toContain('Total time: 1h 45m')
    })

    it('should handle activities without tags', () => {
      const activities = [
        { title: 'Simple task', durationMs: 1800000, tags: [] }
      ]

      const prompt = PromptTemplates.dailySummary(activities)

      expect(prompt).toContain('Simple task (30m)')
      expect(prompt).toContain('Total time: 30m')
    })

    it('should format durations correctly', () => {
      const activities = [
        { title: 'Short task', durationMs: 300000, tags: [] }, // 5 minutes
        { title: 'Hour task', durationMs: 3600000, tags: [] }, // 1 hour
        { title: 'Long task', durationMs: 5400000, tags: [] } // 1 hour 30 minutes
      ]

      const prompt = PromptTemplates.dailySummary(activities)

      expect(prompt).toContain('Short task (5m)')
      expect(prompt).toContain('Hour task (1h)')
      expect(prompt).toContain('Long task (1h 30m)')
    })

    it('should include analysis instructions', () => {
      const activities = [
        { title: 'Test task', durationMs: 1800000, tags: ['test'] }
      ]

      const prompt = PromptTemplates.dailySummary(activities)

      expect(prompt).toContain('Productivity patterns')
      expect(prompt).toContain('time distribution')
      expect(prompt).toContain('achievements and insights')
      expect(prompt).toContain('improvement and optimization')
    })

    it('should group activities by tags', () => {
      const activities = [
        { title: 'Task 1 #work', durationMs: 1800000, tags: ['work'] },
        { title: 'Task 2 #work', durationMs: 1800000, tags: ['work'] },
        { title: 'Task 3 #personal', durationMs: 900000, tags: ['personal'] }
      ]

      const prompt = PromptTemplates.dailySummary(activities)

      expect(prompt).toContain('Work: 1h')
      expect(prompt).toContain('Personal: 15m')
    })
  })

  describe('Activity Enhancement Prompt', () => {
    it('should generate enhancement suggestions prompt', () => {
      const activity = {
        title: 'work on project',
        durationMs: 1800000,
        tags: []
      }

      const prompt = PromptTemplates.enhanceActivity(activity)

      expect(prompt).toContain('enhance this activity')
      expect(prompt).toContain('work on project')
      expect(prompt).toContain('30m')
      expect(prompt).toContain('Relevant tags')
      expect(prompt).toContain('priority level')
    })
  })

  describe('Utility Functions', () => {
    it('should format duration in human readable format', () => {
      expect(PromptTemplates.formatDuration(300000)).toBe('5m')
      expect(PromptTemplates.formatDuration(3600000)).toBe('1h')
      expect(PromptTemplates.formatDuration(5400000)).toBe('1h 30m')
      expect(PromptTemplates.formatDuration(7800000)).toBe('2h 10m')
    })

    it('should calculate total duration', () => {
      const activities = [
        { durationMs: 1800000 },
        { durationMs: 3600000 },
        { durationMs: 900000 }
      ]

      const total = PromptTemplates.getTotalDuration(activities)
      expect(total).toBe(6300000) // 1h 45m
    })

    it('should group activities by tags', () => {
      const activities = [
        { title: 'Task 1', durationMs: 1800000, tags: ['work'] },
        { title: 'Task 2', durationMs: 900000, tags: ['work'] },
        { title: 'Task 3', durationMs: 1200000, tags: ['personal'] }
      ]

      const grouped = PromptTemplates.groupByTags(activities)
      
      expect(grouped.work).toBe(2700000) // 45m
      expect(grouped.personal).toBe(1200000) // 20m
    })
  })
})