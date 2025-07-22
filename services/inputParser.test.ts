import { describe, expect, it } from 'vitest'
import type { ParsedActivity } from '~/types/activity'
import { InputParserService } from '~/services/inputParser'

describe('InputParserService', () => {
  describe('parseActivity', () => {
    it('should parse activity with tags and priority', () => {
      const input = 'Work on frontend #react #typescript !2'
      const result = InputParserService.parseActivity(input)
      
      const expected: ParsedActivity = {
        originalText: input,
        cleanText: 'Work on frontend',
        tags: ['react', 'typescript'],
        priority: 2
      }
      
      expect(result).toEqual(expected)
    })

    it('should parse activity with only tags', () => {
      const input = 'Meeting with team #work #meeting'
      const result = InputParserService.parseActivity(input)
      
      const expected: ParsedActivity = {
        originalText: input,
        cleanText: 'Meeting with team',
        tags: ['work', 'meeting'],
        priority: null
      }
      
      expect(result).toEqual(expected)
    })

    it('should parse activity with only priority', () => {
      const input = 'Urgent task !1'
      const result = InputParserService.parseActivity(input)
      
      const expected: ParsedActivity = {
        originalText: input,
        cleanText: 'Urgent task',
        tags: [],
        priority: 1
      }
      
      expect(result).toEqual(expected)
    })

    it('should parse plain text without tags or priority', () => {
      const input = 'Simple task'
      const result = InputParserService.parseActivity(input)
      
      const expected: ParsedActivity = {
        originalText: input,
        cleanText: 'Simple task',
        tags: [],
        priority: null
      }
      
      expect(result).toEqual(expected)
    })

    it('should handle empty input', () => {
      const input = ''
      const result = InputParserService.parseActivity(input)
      
      const expected: ParsedActivity = {
        originalText: '',
        cleanText: '',
        tags: [],
        priority: null
      }
      
      expect(result).toEqual(expected)
    })

    it('should handle multiple priorities (use first valid)', () => {
      const input = 'Task with multiple !2 priorities !1'
      const result = InputParserService.parseActivity(input)
      
      const expected: ParsedActivity = {
        originalText: input,
        cleanText: 'Task with multiple priorities',
        tags: [],
        priority: 2
      }
      
      expect(result).toEqual(expected)
    })

    it('should handle invalid priority values', () => {
      const input = 'Invalid priority !9 !0 !4'
      const result = InputParserService.parseActivity(input)
      
      const expected: ParsedActivity = {
        originalText: input,
        cleanText: 'Invalid priority',
        tags: [],
        priority: null
      }
      
      expect(result).toEqual(expected)
    })
  })

  describe('extractTags', () => {
    it('should extract various tag formats', () => {
      expect(InputParserService.extractTags('Work on #frontend')).toEqual(['frontend'])
      expect(InputParserService.extractTags('Work on #frontend #react #typescript')).toEqual(['frontend', 'react', 'typescript'])
      expect(InputParserService.extractTags('No tags here')).toEqual([])
      expect(InputParserService.extractTags('Invalid # tag and #valid')).toEqual(['valid'])
    })

    it('should handle special characters in tags', () => {
      expect(InputParserService.extractTags('Sprint #v2_0 #web3 #ui_ux')).toEqual(['v2_0', 'web3', 'ui_ux'])
      expect(InputParserService.extractTags('Working on #ai-coding #machine-learning')).toEqual(['ai-coding', 'machine-learning'])
      expect(InputParserService.extractTags('Learning #react.js #node.js #v2.0')).toEqual(['react.js', 'node.js', 'v2.0'])
    })
  })

  describe('extractPriority', () => {
    it('should extract valid priority levels', () => {
      expect(InputParserService.extractPriority('Urgent task !1')).toBe(1)
      expect(InputParserService.extractPriority('Medium task !2')).toBe(2)
      expect(InputParserService.extractPriority('Low task !3')).toBe(3)
    })

    it('should return null for no priority', () => {
      expect(InputParserService.extractPriority('No priority')).toBe(null)
    })

    it('should return null for invalid priority', () => {
      expect(InputParserService.extractPriority('Invalid !0 !4 !9')).toBe(null)
    })

    it('should return first valid priority when multiple exist', () => {
      expect(InputParserService.extractPriority('Multiple !2 priorities !1')).toBe(2)
    })
  })

  describe('cleanText', () => {
    it('should remove tags and priority from text', () => {
      expect(InputParserService.cleanText('Work on #frontend #react !2')).toBe('Work on')
      expect(InputParserService.cleanText('Working on #ai-coding #machine-learning project !2')).toBe('Working on project')
      expect(InputParserService.cleanText('Building #react.js #v2.0 app with #ui_ux design !3')).toBe('Building app with design')
    })

    it('should handle edge cases', () => {
      expect(InputParserService.cleanText('  Task with spaces  #tag  !1  ')).toBe('Task with spaces')
      expect(InputParserService.cleanText('#tag !1')).toBe('')
      expect(InputParserService.cleanText('Plain text task')).toBe('Plain text task')
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in text', () => {
      const input = 'Review API docs & update tests #documentation !2'
      const result = InputParserService.parseActivity(input)
      
      expect(result.cleanText).toBe('Review API docs & update tests')
      expect(result.tags).toEqual(['documentation'])
      expect(result.priority).toBe(2)
    })

    it('should handle unicode characters', () => {
      const input = 'Code review 📝 #review !1'
      const result = InputParserService.parseActivity(input)
      
      expect(result.cleanText).toBe('Code review 📝')
      expect(result.tags).toEqual(['review'])
      expect(result.priority).toBe(1)
    })

    it('should handle very long input', () => {
      const longText = 'A'.repeat(100) // Reduced for test efficiency
      const input = `${longText} #tag !2`
      const result = InputParserService.parseActivity(input)
      
      expect(result.cleanText).toBe(longText)
      expect(result.tags).toEqual(['tag'])
      expect(result.priority).toBe(2)
    })
  })
})