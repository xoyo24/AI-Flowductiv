import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useTimer } from '~/composables/useTimer'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock useActivities
vi.mock('~/composables/useActivities', () => ({
  useActivities: () => ({
    saveActivity: vi.fn().mockResolvedValue({ success: true })
  })
}))

// Mock dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
})

describe('useTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Timer State Management', () => {
    it('should initialize with correct default state', () => {
      const timer = useTimer()

      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.elapsedMs.value).toBe(0)
      expect(timer.currentActivity.value).toBe('')
      expect(timer.formattedTime.value).toBe('00:00')
    })

    it('should correctly determine when timer can start', () => {
      const timer = useTimer()

      // Cannot start without activity
      expect(timer.canStart.value).toBe(false)

      // Set activity but timer is not started yet
      timer.startTimer('Work on project')
      expect(timer.canStart.value).toBe(false) // Now running, so can't start again
    })

    it('should format time correctly for user display', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')

      // Mock elapsed time
      timer.elapsedMs.value = 0
      expect(timer.formattedTime.value).toBe('00:00')

      timer.elapsedMs.value = 30000 // 30 seconds
      expect(timer.formattedTime.value).toBe('00:30')

      timer.elapsedMs.value = 90000 // 1 minute 30 seconds
      expect(timer.formattedTime.value).toBe('01:30')

      timer.elapsedMs.value = 3665000 // 1 hour 1 minute 5 seconds
      expect(timer.formattedTime.value).toBe('01:01:05')
    })
  })

  describe('Timer Operations', () => {
    it('should start timer with valid activity', () => {
      const timer = useTimer()
      const result = timer.startTimer('Work on project #urgent')

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(true)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.currentActivity.value).toBe('Work on project #urgent')
      expect(timer.elapsedMs.value).toBe(0)
    })

    it('should not start timer with empty activity', () => {
      const timer = useTimer()
      const result = timer.startTimer('')

      expect(result).toBe(false)
      expect(timer.isRunning.value).toBe(false)
    })

    it('should pause running timer correctly', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')

      const result = timer.pauseTimer()

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(true)
      expect(timer.canResume.value).toBe(true)
    })

    it('should not pause timer that is not running', () => {
      const timer = useTimer()
      const result = timer.pauseTimer()

      expect(result).toBe(false)
      expect(timer.isPaused.value).toBe(false)
    })

    it('should resume paused timer correctly', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')
      timer.pauseTimer()

      const result = timer.resumeTimer()

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(true)
      expect(timer.isPaused.value).toBe(false)
    })

    it('should not resume timer that is not paused', () => {
      const timer = useTimer()
      const result = timer.resumeTimer()

      expect(result).toBe(false)
    })

    it('should finish running timer and save activity', async () => {
      const timer = useTimer()
      timer.startTimer('Work on project #urgent !2')

      // Advance time to simulate elapsed time
      vi.advanceTimersByTime(5000)

      const result = await timer.finishTimer()

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.currentActivity.value).toBe('')
      expect(timer.elapsedMs.value).toBe(0)
    })

    it('should finish paused timer and save activity', async () => {
      const timer = useTimer()
      timer.startTimer('Test activity')
      timer.pauseTimer()

      const result = await timer.finishTimer()

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
    })

    it('should not finish timer that is not running or paused', async () => {
      const timer = useTimer()
      const result = await timer.finishTimer()

      expect(result).toBe(false)
    })

    it('should reset timer to initial state', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')
      
      timer.resetTimer()

      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.elapsedMs.value).toBe(0)
      expect(timer.currentActivity.value).toBe('')
    })
  })

  describe('Timer State Persistence', () => {
    it('should save timer state to localStorage when starting', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'flowductiv-timer-state',
        expect.stringContaining('Test activity')
      )
    })

    it('should save timer state when pausing', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')
      vi.clearAllMocks()

      timer.pauseTimer()

      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('should clear timer state when resetting', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')

      timer.resetTimer()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('flowductiv-timer-state')
    })
  })

  describe('Button State Logic', () => {
    it('should correctly determine button availability states', () => {
      const timer = useTimer()

      // Initial state - only start should be unavailable (no activity)
      expect(timer.canStart.value).toBe(false)
      expect(timer.canPause.value).toBe(false)
      expect(timer.canResume.value).toBe(false)
      expect(timer.canFinish.value).toBe(false)

      // After starting timer
      timer.startTimer('Test activity')
      expect(timer.canStart.value).toBe(false) // Can't start again
      expect(timer.canPause.value).toBe(true)
      expect(timer.canResume.value).toBe(false)
      expect(timer.canFinish.value).toBe(true)

      // After pausing timer
      timer.pauseTimer()
      expect(timer.canStart.value).toBe(false)
      expect(timer.canPause.value).toBe(false)
      expect(timer.canResume.value).toBe(true)
      expect(timer.canFinish.value).toBe(true)
    })
  })

  describe('Timer Accuracy', () => {
    it('should update elapsed time correctly while running', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')

      // Initial elapsed time should be 0
      expect(timer.elapsedMs.value).toBe(0)

      // Advance timer by 1 second and trigger the interval
      vi.advanceTimersByTime(1000)

      // The elapsed time should be updated (within reasonable margin)
      expect(timer.elapsedMs.value).toBeGreaterThan(0)
    })

    it('should not update elapsed time when paused', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')
      timer.pauseTimer()

      const elapsedBeforePause = timer.elapsedMs.value

      // Advance time while paused
      vi.advanceTimersByTime(2000)

      // Elapsed time should not change while paused
      expect(timer.elapsedMs.value).toBe(elapsedBeforePause)
    })
  })

  describe('Activity Parsing Integration', () => {
    it('should handle activity with tags and priority', async () => {
      const { saveActivity } = await import('~/composables/useActivities')
      const mockSaveActivity = vi.mocked(saveActivity)

      const timer = useTimer()
      timer.startTimer('Work on project #urgent #work !2')
      
      await timer.finishTimer()

      expect(mockSaveActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Work on project #urgent #work !2',
          tags: expect.arrayContaining(['urgent', 'work']),
          priority: 2,
          durationMs: expect.any(Number),
          startTime: expect.any(Date),
          endTime: expect.any(Date),
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle save activity failure gracefully', async () => {
      const { useActivities } = await import('~/composables/useActivities')
      const mockUseActivities = vi.mocked(useActivities)
      mockUseActivities.mockReturnValue({
        saveActivity: vi.fn().mockRejectedValue(new Error('Database error'))
      })

      const timer = useTimer()
      timer.startTimer('Test activity')

      const result = await timer.finishTimer()

      expect(result).toBe(false)
      // Timer should remain in its current state on save failure
      expect(timer.isRunning.value).toBe(true)
    })
  })
})