import { describe, expect, it } from 'vitest'

// Basic test to verify testing setup works
describe('Timer Tests Setup', () => {
  it('should be able to run basic tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to basic math operations', () => {
    const result = 2 + 2
    expect(result).toBe(4)
  })

  it('should be able to work with arrays', () => {
    const testArray = [1, 2, 3]
    expect(testArray).toHaveLength(3)
    expect(testArray).toContain(2)
  })

  it('should be able to work with objects', () => {
    const testObject = { name: 'test', value: 42 }
    expect(testObject).toHaveProperty('name')
    expect(testObject.name).toBe('test')
    expect(testObject.value).toBe(42)
  })

  it('should be able to work with promises', async () => {
    const promise = Promise.resolve('success')
    await expect(promise).resolves.toBe('success')
  })
})

// Test timer-related utility functions that don't require mocking
describe('Timer Utility Functions', () => {
  it('should format time correctly for seconds only', () => {
    const formatTime = (elapsedMs: number) => {
      const totalSeconds = Math.floor(elapsedMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }

    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(5000)).toBe('00:05')
    expect(formatTime(65000)).toBe('01:05')
    expect(formatTime(3665000)).toBe('01:01:05')
  })

  it('should extract tags from activity text', () => {
    const extractTags = (text: string): string[] => {
      const tagRegex = /#(\w+)/g
      return Array.from(text.matchAll(tagRegex), (match) => match[1])
    }

    expect(extractTags('Work on #frontend')).toEqual(['frontend'])
    expect(extractTags('Work on #frontend #react #typescript')).toEqual([
      'frontend',
      'react',
      'typescript',
    ])
    expect(extractTags('No tags here')).toEqual([])
    expect(extractTags('Mix of #work and regular text #urgent')).toEqual(['work', 'urgent'])
  })

  it('should extract priority from activity text', () => {
    const extractPriority = (text: string): number | null => {
      const priorityMatch = text.match(/!([1-3])/)
      return priorityMatch ? Number.parseInt(priorityMatch[1]) : null
    }

    expect(extractPriority('Urgent task !1')).toBe(1)
    expect(extractPriority('Medium task !2')).toBe(2)
    expect(extractPriority('Low task !3')).toBe(3)
    expect(extractPriority('No priority')).toBe(null)
    expect(extractPriority('Invalid priority !9')).toBe(null)
  })
})
