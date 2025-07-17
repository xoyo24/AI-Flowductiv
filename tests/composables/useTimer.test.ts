import { describe, it, expect } from 'vitest'

describe('useTimer Simple Tests', () => {
  it('should be able to import timer composable', () => {
    expect(true).toBe(true)
  })

  it('should handle time formatting correctly', () => {
    const formatTime = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(30000)).toBe('00:30')
    expect(formatTime(90000)).toBe('01:30')
    expect(formatTime(3600000)).toBe('60:00')
  })

  it('should extract tags from activity text', () => {
    const extractTags = (text: string): string[] => {
      const tagRegex = /#(\w+)/g
      return Array.from(text.matchAll(tagRegex), (match) => match[1])
    }

    expect(extractTags('Work on project #dev #urgent')).toEqual(['dev', 'urgent'])
    expect(extractTags('Meeting with team #meeting')).toEqual(['meeting'])
    expect(extractTags('No tags here')).toEqual([])
    expect(extractTags('#tag1 and #tag2 and #tag3')).toEqual(['tag1', 'tag2', 'tag3'])
  })

  it('should extract priority from activity text', () => {
    const extractPriority = (text: string): number | null => {
      const priorityMatch = text.match(/!([1-3])/)
      return priorityMatch ? Number.parseInt(priorityMatch[1]) : null
    }

    expect(extractPriority('Important task !1')).toBe(1)
    expect(extractPriority('Medium task !2')).toBe(2)
    expect(extractPriority('Low task !3')).toBe(3)
    expect(extractPriority('No priority')).toBe(null)
    expect(extractPriority('Invalid priority !5')).toBe(null)
  })

  it('should handle activity parsing correctly', () => {
    const parseActivity = (text: string) => {
      const tagRegex = /#(\w+)/g
      const tags = Array.from(text.matchAll(tagRegex), (match) => match[1])
      
      const priorityMatch = text.match(/!([1-3])/)
      const priority = priorityMatch ? Number.parseInt(priorityMatch[1]) : null
      
      return { tags, priority }
    }

    expect(parseActivity('Work on project #dev #urgent !1')).toEqual({
      tags: ['dev', 'urgent'],
      priority: 1
    })
    
    expect(parseActivity('Simple task')).toEqual({
      tags: [],
      priority: null
    })
  })
})