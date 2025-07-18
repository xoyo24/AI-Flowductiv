import { describe, expect, it } from 'vitest'
import { ref, watchEffect, nextTick } from 'vue'
import { useInputParser } from '~/composables/useInputParser'

describe('useInputParser', () => {
  describe('reactive parsing', () => {
    it('should parse input reactively as user types', () => {
      const inputRef = ref('Work on #frontend !2')
      const { parsedActivity } = useInputParser(inputRef)
      
      expect(parsedActivity.value.cleanText).toBe('Work on')
      expect(parsedActivity.value.tags).toEqual(['frontend'])
      expect(parsedActivity.value.priority).toBe(2)
      
      // Update input
      inputRef.value = 'Meeting #team !1'
      expect(parsedActivity.value.cleanText).toBe('Meeting')
      expect(parsedActivity.value.tags).toEqual(['team'])
      expect(parsedActivity.value.priority).toBe(1)
    })

    it('should update tags reactively', () => {
      const inputRef = ref('Task')
      const { tags } = useInputParser(inputRef)
      
      expect(tags.value).toEqual([])
      
      inputRef.value = 'Task #work'
      expect(tags.value).toEqual(['work'])
      
      inputRef.value = 'Task #work #urgent'
      expect(tags.value).toEqual(['work', 'urgent'])
    })

    it('should update priority reactively', () => {
      const inputRef = ref('Task')
      const { priority } = useInputParser(inputRef)
      
      expect(priority.value).toBe(null)
      
      inputRef.value = 'Task !2'
      expect(priority.value).toBe(2)
      
      inputRef.value = 'Task !1'
      expect(priority.value).toBe(1)
    })

    it('should update clean text reactively', () => {
      const inputRef = ref('Task #work !2')
      const { cleanText } = useInputParser(inputRef)
      
      expect(cleanText.value).toBe('Task')
      
      inputRef.value = 'New task #urgent !1'
      expect(cleanText.value).toBe('New task')
      
      inputRef.value = 'Plain text'
      expect(cleanText.value).toBe('Plain text')
    })
  })

  describe('computed properties', () => {
    it('should expose complete parsed activity object', () => {
      const inputRef = ref('Meeting #team #urgent !1')
      const { parsedActivity } = useInputParser(inputRef)
      
      expect(parsedActivity.value).toEqual({
        originalText: 'Meeting #team #urgent !1',
        cleanText: 'Meeting',
        tags: ['team', 'urgent'],
        priority: 1
      })
    })
  })

  describe('integration with timer', () => {
    it('should work with existing timer composable', () => {
      const inputRef = ref('Timer task #focus !3')
      const { parsedActivity } = useInputParser(inputRef)
      
      // Verify the format matches what useTimer expects
      expect(parsedActivity.value.tags).toBeInstanceOf(Array)
      expect(typeof parsedActivity.value.priority).toBe('number')
      expect(typeof parsedActivity.value.cleanText).toBe('string')
      expect(typeof parsedActivity.value.originalText).toBe('string')
    })

    it('should provide utilities for activity creation', () => {
      const inputRef = ref('Deep work #coding #focus !2')
      const { createActivityInput } = useInputParser(inputRef)
      
      expect(typeof createActivityInput).toBe('function')
      
      const activityInput = createActivityInput({
        durationMs: 1800000, // 30 minutes
        startTime: new Date(),
        endTime: new Date()
      })
      
      expect(activityInput.title).toBe('Deep work')
      expect(activityInput.tags).toEqual(['coding', 'focus'])
      expect(activityInput.priority).toBe(2)
    })
  })

  describe('performance', () => {
    it('should not cause excessive re-computations', async () => {
      const inputRef = ref('Task #work !2')
      let computationCount = 0
      
      const { parsedActivity } = useInputParser(inputRef)
      
      // Track computations with nextTick to ensure Vue reactivity settles
      watchEffect(() => {
        parsedActivity.value
        computationCount++
      })
      
      // Wait for initial computation to settle
      await nextTick()
      
      // Initial computation should happen
      expect(computationCount).toBeGreaterThan(0)
      
      // Store initial count
      const initialCount = computationCount
      
      // Same value shouldn't trigger recomputation
      inputRef.value = 'Task #work !2'
      await nextTick()
      expect(computationCount).toBe(initialCount)
      
      // Different value should trigger recomputation
      inputRef.value = 'New task #urgent !1'
      await nextTick()
      expect(computationCount).toBeGreaterThan(initialCount)
    })
  })
})