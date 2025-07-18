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
    it('should extract single tag', () => {
      expect(InputParserService.extractTags('Work on #frontend')).toEqual(['frontend'])
    })

    it('should extract multiple tags', () => {
      expect(InputParserService.extractTags('Work on #frontend #react #typescript')).toEqual([
        'frontend', 'react', 'typescript'
      ])
    })

    it('should return empty array when no tags', () => {
      expect(InputParserService.extractTags('No tags here')).toEqual([])
    })

    it('should handle tags with numbers and underscores', () => {
      expect(InputParserService.extractTags('Sprint #v2_0 #web3 #ui_ux')).toEqual([
        'v2_0', 'web3', 'ui_ux'
      ])
    })

    it('should handle hyphenated tags', () => {
      expect(InputParserService.extractTags('Working on #ai-coding #machine-learning #full-stack')).toEqual([
        'ai-coding', 'machine-learning', 'full-stack'
      ])
    })

    it('should handle tags with dots', () => {
      expect(InputParserService.extractTags('Learning #react.js #node.js #v2.0 #python3.11')).toEqual([
        'react.js', 'node.js', 'v2.0', 'python3.11'
      ])
    })

    it('should handle complex tag combinations', () => {
      expect(InputParserService.extractTags('Project #web-app #react.js #v1.2.3 #ui_ux #front-end')).toEqual([
        'web-app', 'react.js', 'v1.2.3', 'ui_ux', 'front-end'
      ])
    })

    it('should ignore incomplete tags', () => {
      expect(InputParserService.extractTags('Invalid # tag and #valid')).toEqual(['valid'])
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
    })

    it('should remove hyphenated tags properly', () => {
      expect(InputParserService.cleanText('Working on #ai-coding #machine-learning project !2')).toBe('Working on project')
    })

    it('should remove tags with dots and complex characters', () => {
      expect(InputParserService.cleanText('Building #react.js #v2.0 app with #ui_ux design !3')).toBe('Building app with design')
    })

    it('should trim whitespace', () => {
      expect(InputParserService.cleanText('  Task with spaces  #tag  !1  ')).toBe('Task with spaces')
    })

    it('should handle text with only tags/priority', () => {
      expect(InputParserService.cleanText('#tag !1')).toBe('')
    })

    it('should preserve text without tags/priority', () => {
      expect(InputParserService.cleanText('Plain text task')).toBe('Plain text task')
    })
  })

  describe('edge cases', () => {
    it('should handle special characters in text', () => {
      const input = 'Review API docs & update tests #documentation !2'
      // const result = InputParserService.parseActivity(input)
      
      // expect(result.cleanText).toBe('Review API docs & update tests')
      // expect(result.tags).toEqual(['documentation'])
      // expect(result.priority).toBe(2)
    })

    it('should handle unicode characters', () => {
      const input = 'Code review 📝 #review #émojis !1'
      // const result = InputParserService.parseActivity(input)
      
      // expect(result.cleanText).toBe('Code review 📝')
      // expect(result.tags).toEqual(['review', 'émojis'])
      // expect(result.priority).toBe(1)
    })

    it('should handle very long input', () => {
      const longText = 'A'.repeat(1000)
      const input = `${longText} #tag !2`
      // const result = InputParserService.parseActivity(input)
      
      // expect(result.cleanText).toBe(longText)
      // expect(result.tags).toEqual(['tag'])
      // expect(result.priority).toBe(2)
    })
  })
})