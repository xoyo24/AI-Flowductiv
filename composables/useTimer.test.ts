import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, getCurrentInstance, nextTick, readonly, ref } from 'vue'

// Mock VueUse composables
const mockPause = vi.fn()
const mockResume = vi.fn()
const mockUseIntervalFn = vi.fn(() => ({
  pause: mockPause,
  resume: mockResume,
}))

// Mock useActivities composable
const mockSaveActivity = vi.fn()
const mockUseActivities = vi.fn(() => ({
  saveActivity: mockSaveActivity,
}))

// Mock getCurrentInstance to simulate non-component context
vi.mocked(getCurrentInstance).mockReturnValue(null)

// Setup global Vue functions for the timer
global.ref = ref
global.readonly = readonly
global.computed = computed
global.onMounted = vi.fn()
global.onUnmounted = vi.fn()

describe('useTimer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    window.localStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const timer = useTimer()

      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.elapsedMs.value).toBe(0)
      expect(timer.currentActivity.value).toBe('')
      expect(timer.formattedTime.value).toBe('00:00')
    })

    it('should have correct computed state for initial values', () => {
      const timer = useTimer()

      expect(timer.canStart.value).toBe(false) // No activity set
      expect(timer.canPause.value).toBe(false)
      expect(timer.canResume.value).toBe(false)
      expect(timer.canFinish.value).toBe(false)
    })
  })

  describe('Time Formatting', () => {
    it('should format time correctly for minutes and seconds', () => {
      const timer = useTimer()

      // Mock elapsedMs to 125000 (2 minutes, 5 seconds)
      timer.startTimer('Test Activity')
      vi.advanceTimersByTime(125000)

      expect(timer.formattedTime.value).toBe('02:05')
    })

    it('should format time correctly with hours', () => {
      const timer = useTimer()

      timer.startTimer('Test Activity')
      vi.advanceTimersByTime(3665000) // 1 hour, 1 minute, 5 seconds

      expect(timer.formattedTime.value).toBe('01:01:05')
    })
  })

  describe('Start Timer', () => {
    it('should start timer with valid activity', () => {
      const timer = useTimer()
      const result = timer.startTimer('Work on project')

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(true)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.currentActivity.value).toBe('Work on project')
      expect(timer.elapsedMs.value).toBe(0)
      expect(mockResume).toHaveBeenCalled()
    })

    it('should not start timer with empty activity', () => {
      const timer = useTimer()
      const result = timer.startTimer('')

      expect(result).toBe(false)
      expect(timer.isRunning.value).toBe(false)
    })

    it('should not start timer with whitespace-only activity', () => {
      const timer = useTimer()
      const result = timer.startTimer('   ')

      expect(result).toBe(false)
      expect(timer.isRunning.value).toBe(false)
    })

    it('should trim activity name', () => {
      const timer = useTimer()
      timer.startTimer('  Work on project  ')

      expect(timer.currentActivity.value).toBe('Work on project')
    })

    it('should reset previous timer state when starting new timer', () => {
      const timer = useTimer()

      // Start first timer
      timer.startTimer('First activity')
      vi.advanceTimersByTime(5000)

      // Start second timer
      timer.startTimer('Second activity')

      expect(timer.currentActivity.value).toBe('Second activity')
      expect(timer.elapsedMs.value).toBe(0)
    })

    it('should save timer state to localStorage', () => {
      const timer = useTimer()
      timer.startTimer('Test activity')

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'flowductiv-timer-state',
        expect.stringContaining('"isRunning":true')
      )
    })
  })

  describe('Pause Timer', () => {
    it('should pause running timer', () => {
      const timer = useTimer()
      timer.startTimer('Work on project')

      const result = timer.pauseTimer()

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(true)
      expect(mockPause).toHaveBeenCalled()
    })

    it('should not pause when timer is not running', () => {
      const timer = useTimer()

      const result = timer.pauseTimer()

      expect(result).toBe(false)
      expect(timer.isPaused.value).toBe(false)
    })
  })

  describe('Resume Timer', () => {
    it('should resume paused timer', () => {
      const timer = useTimer()
      timer.startTimer('Work on project')
      timer.pauseTimer()

      const result = timer.resumeTimer()

      expect(result).toBe(true)
      expect(timer.isRunning.value).toBe(true)
      expect(timer.isPaused.value).toBe(false)
      expect(mockResume).toHaveBeenCalled()
    })

    it('should not resume when timer is not paused', () => {
      const timer = useTimer()

      const result = timer.resumeTimer()

      expect(result).toBe(false)
    })

    it('should not resume when no start time exists', () => {
      const timer = useTimer()
      timer.startTimer('Test')
      // Manually reset startTime to simulate edge case
      timer.resetTimer()

      const result = timer.resumeTimer()

      expect(result).toBe(false)
    })
  })

  describe('Finish Timer', () => {
    it('should finish running timer and save activity', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      timer.startTimer('Work on project #work !2')
      vi.advanceTimersByTime(5000)

      const result = await timer.finishTimer()

      expect(result).toBe(true)
      expect(mockSaveActivity).toHaveBeenCalledWith({
        title: 'Work on project #work !2',
        durationMs: expect.any(Number),
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        tags: ['work'],
        priority: 2,
      })

      // Timer should be reset
      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.currentActivity.value).toBe('')
    })

    it('should finish paused timer and save activity', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      timer.startTimer('Work on project')
      vi.advanceTimersByTime(3000)
      timer.pauseTimer()

      const result = await timer.finishTimer()

      expect(result).toBe(true)
      expect(mockSaveActivity).toHaveBeenCalled()
    })

    it('should not finish when timer is not running or paused', async () => {
      const timer = useTimer()

      const result = await timer.finishTimer()

      expect(result).toBe(false)
      expect(mockSaveActivity).not.toHaveBeenCalled()
    })

    it('should handle save activity failure', async () => {
      const timer = useTimer()
      mockSaveActivity.mockRejectedValue(new Error('Save failed'))

      timer.startTimer('Work on project')

      const result = await timer.finishTimer()

      expect(result).toBe(false)
      // Timer should not be reset on failure
      expect(timer.isRunning.value).toBe(true)
    })

    it('should dispatch activity-saved event on success', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent')

      timer.startTimer('Work on project')
      await timer.finishTimer()

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'activity-saved',
        })
      )
    })
  })

  describe('Reset Timer', () => {
    it('should reset all timer state', () => {
      const timer = useTimer()
      timer.startTimer('Work on project')
      vi.advanceTimersByTime(5000)

      timer.resetTimer()

      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.elapsedMs.value).toBe(0)
      expect(timer.currentActivity.value).toBe('')
      expect(mockPause).toHaveBeenCalled()
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('flowductiv-timer-state')
    })
  })

  describe('Utility Functions', () => {
    it('should extract tags from activity text', () => {
      const timer = useTimer()
      timer.startTimer('Work on project #frontend #react #bug-fix')

      // We can't directly test extractTags, but we can test through finishTimer
      mockSaveActivity.mockResolvedValue(undefined)
      timer.finishTimer()

      expect(mockSaveActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['frontend', 'react', 'bug-fix'],
        })
      )
    })

    it('should extract priority from activity text', () => {
      const timer = useTimer()
      timer.startTimer('Urgent task !1')

      mockSaveActivity.mockResolvedValue(undefined)
      timer.finishTimer()

      expect(mockSaveActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 1,
        })
      )
    })

    it('should handle no priority in text', () => {
      const timer = useTimer()
      timer.startTimer('Regular task')

      mockSaveActivity.mockResolvedValue(undefined)
      timer.finishTimer()

      expect(mockSaveActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: null,
        })
      )
    })
  })

  describe('Computed State', () => {
    it('should update canStart based on conditions', () => {
      const timer = useTimer()

      // Initially false (no activity)
      expect(timer.canStart.value).toBe(false)

      // Set activity but don't start
      timer.startTimer('Test')
      timer.resetTimer()
      // Mock having an activity without timer running
      timer.currentActivity.value = 'Test Activity'

      expect(timer.canStart.value).toBe(true)

      // Start timer
      timer.startTimer('Test Activity')
      expect(timer.canStart.value).toBe(false)
    })

    it('should update canPause based on running state', () => {
      const timer = useTimer()

      expect(timer.canPause.value).toBe(false)

      timer.startTimer('Test')
      expect(timer.canPause.value).toBe(true)

      timer.pauseTimer()
      expect(timer.canPause.value).toBe(false)
    })

    it('should update canResume based on paused state', () => {
      const timer = useTimer()

      expect(timer.canResume.value).toBe(false)

      timer.startTimer('Test')
      expect(timer.canResume.value).toBe(false)

      timer.pauseTimer()
      expect(timer.canResume.value).toBe(true)

      timer.resumeTimer()
      expect(timer.canResume.value).toBe(false)
    })

    it('should update canFinish based on running or paused state', () => {
      const timer = useTimer()

      expect(timer.canFinish.value).toBe(false)

      timer.startTimer('Test')
      expect(timer.canFinish.value).toBe(true)

      timer.pauseTimer()
      expect(timer.canFinish.value).toBe(true)

      timer.resetTimer()
      expect(timer.canFinish.value).toBe(false)
    })
  })

  describe('Local Storage Persistence', () => {
    it('should load timer state from localStorage on initialization', () => {
      const savedState = {
        isRunning: true,
        isPaused: false,
        elapsedMs: 5000,
        currentActivity: 'Saved Activity',
        startTime: new Date().toISOString(),
      }

      window.localStorage.getItem.mockReturnValue(JSON.stringify(savedState))

      const timer = useTimer()

      expect(timer.currentActivity.value).toBe('Saved Activity')
      expect(timer.isRunning.value).toBe(true)
    })

    it('should handle invalid localStorage data gracefully', () => {
      window.localStorage.getItem.mockReturnValue('invalid json')

      const timer = useTimer()

      expect(timer.isRunning.value).toBe(false)
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('flowductiv-timer-state')
    })

    it('should restore paused state correctly', () => {
      const savedState = {
        isRunning: false,
        isPaused: true,
        elapsedMs: 5000,
        currentActivity: 'Paused Activity',
        startTime: new Date().toISOString(),
      }

      window.localStorage.getItem.mockReturnValue(JSON.stringify(savedState))

      const timer = useTimer()

      expect(timer.isPaused.value).toBe(true)
      expect(timer.isRunning.value).toBe(false)
      expect(timer.elapsedMs.value).toBe(5000)
    })
  })
})
