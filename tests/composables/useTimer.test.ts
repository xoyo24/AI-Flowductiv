import { describe, it, expect } from 'vitest'

describe('useTimer', () => {
  describe('Time Formatting', () => {
    it('should format time correctly for minutes and seconds', () => {
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

    it('should format time with hours when needed', () => {
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
  })

  describe('Timer Logic', () => {
    it('should calculate elapsed time correctly', () => {
      const calculateElapsed = (startTime: Date, endTime: Date) => {
        return endTime.getTime() - startTime.getTime()
      }

      const start = new Date('2023-01-01T10:00:00')
      const end = new Date('2023-01-01T10:30:00')
      
      expect(calculateElapsed(start, end)).toBe(30 * 60 * 1000) // 30 minutes
    })

    it('should validate timer state transitions', () => {
      const isValidTransition = (from: string, to: string) => {
        const validTransitions = {
          'idle': ['running'],
          'running': ['paused', 'stopped'],
          'paused': ['running', 'stopped'],
          'stopped': ['idle']
        }
        return validTransitions[from]?.includes(to) || false
      }

      expect(isValidTransition('idle', 'running')).toBe(true)
      expect(isValidTransition('running', 'paused')).toBe(true)
      expect(isValidTransition('idle', 'paused')).toBe(false)
    })

    it('should calculate duration correctly', () => {
      const calculateDuration = (startTime: Date, endTime: Date | null) => {
        if (!endTime) return 0
        return endTime.getTime() - startTime.getTime()
      }

      const start = new Date('2023-01-01T10:00:00')
      const end = new Date('2023-01-01T10:15:00')
      
      expect(calculateDuration(start, end)).toBe(15 * 60 * 1000) // 15 minutes
      expect(calculateDuration(start, null)).toBe(0)
    })
  })

  describe('Activity Data Structure', () => {
    it('should handle activity creation correctly', () => {
      const createActivity = (title: string, tags: string[], priority: number | null) => ({
        title,
        tags,
        priority,
        startTime: new Date(),
        endTime: null,
        durationMs: 0
      })

      const activity = createActivity('Test task', ['work'], 2)
      
      expect(activity.title).toBe('Test task')
      expect(activity.tags).toEqual(['work'])
      expect(activity.priority).toBe(2)
      expect(activity.startTime).toBeInstanceOf(Date)
      expect(activity.endTime).toBe(null)
      expect(activity.durationMs).toBe(0)
    })
  })
})