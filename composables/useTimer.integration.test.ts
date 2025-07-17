import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, readonly, ref } from 'vue'
import { useActivities } from './useActivities'
import { useTimer } from './useTimer'

// Mock the activities composable
vi.mock('./useActivities')

// Mock VueUse composables
const mockInterval = vi.fn()
const mockPause = vi.fn()
const mockResume = vi.fn()
vi.mock('@vueuse/core', () => ({
  useIntervalFn: vi.fn((callback, interval, options) => {
    mockInterval.mockImplementation(callback)
    return {
      pause: mockPause,
      resume: mockResume,
    }
  }),
}))

// Mock getCurrentInstance to simulate non-component context
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    getCurrentInstance: vi.fn(() => null),
  }
})

// Setup global Vue functions for the timer
global.ref = ref
global.readonly = readonly
global.computed = computed
global.onMounted = vi.fn()
global.onUnmounted = vi.fn()

describe('useTimer Integration Tests', () => {
  const mockSaveActivity = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    window.localStorage.getItem.mockReturnValue(null)

    // Mock useActivities to return our mock save function
    vi.mocked(useActivities).mockReturnValue({
      saveActivity: mockSaveActivity,
    } as any)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Complete Timer Workflow', () => {
    it('should handle full timer lifecycle: start -> pause -> resume -> finish', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      // Start timer
      const startResult = timer.startTimer('Complete workflow test #integration !1')
      expect(startResult).toBe(true)
      expect(timer.isRunning.value).toBe(true)
      expect(timer.canPause.value).toBe(true)
      expect(timer.canFinish.value).toBe(true)

      // Simulate time passing
      vi.advanceTimersByTime(5000)
      mockInterval() // Manually trigger interval
      expect(timer.elapsedMs.value).toBeGreaterThan(0)

      // Pause timer
      const pauseResult = timer.pauseTimer()
      expect(pauseResult).toBe(true)
      expect(timer.isPaused.value).toBe(true)
      expect(timer.canResume.value).toBe(true)
      expect(timer.canFinish.value).toBe(true)

      // Simulate time passing while paused
      const elapsedAtPause = timer.elapsedMs.value
      vi.advanceTimersByTime(3000)

      // Resume timer
      const resumeResult = timer.resumeTimer()
      expect(resumeResult).toBe(true)
      expect(timer.isRunning.value).toBe(true)
      expect(timer.isPaused.value).toBe(false)

      // Simulate more time passing
      vi.advanceTimersByTime(2000)
      mockInterval() // Manually trigger interval

      // Finish timer
      const finishResult = await timer.finishTimer()
      expect(finishResult).toBe(true)

      // Verify activity was saved with correct data
      expect(mockSaveActivity).toHaveBeenCalledWith({
        title: 'Complete workflow test #integration !1',
        durationMs: expect.any(Number),
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        tags: ['integration'],
        priority: 1,
      })

      // Verify timer is reset
      expect(timer.isRunning.value).toBe(false)
      expect(timer.isPaused.value).toBe(false)
      expect(timer.currentActivity.value).toBe('')
      expect(timer.elapsedMs.value).toBe(0)
    })

    it('should handle timer start -> finish without pause', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      // Start timer
      timer.startTimer('Direct finish test #quick')

      // Simulate time passing
      vi.advanceTimersByTime(3000)
      mockInterval()

      // Finish directly
      const finishResult = await timer.finishTimer()
      expect(finishResult).toBe(true)

      // Verify activity was saved
      expect(mockSaveActivity).toHaveBeenCalledWith({
        title: 'Direct finish test #quick',
        durationMs: expect.any(Number),
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        tags: ['quick'],
        priority: null,
      })
    })

    it('should handle timer start -> pause -> finish', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      // Start and immediately pause
      timer.startTimer('Pause then finish test')
      vi.advanceTimersByTime(2000)
      mockInterval()

      timer.pauseTimer()
      const pausedElapsed = timer.elapsedMs.value

      // Finish while paused
      const finishResult = await timer.finishTimer()
      expect(finishResult).toBe(true)

      // Verify activity was saved with paused elapsed time
      expect(mockSaveActivity).toHaveBeenCalledWith({
        title: 'Pause then finish test',
        durationMs: pausedElapsed,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        tags: [],
        priority: null,
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle save activity failure and maintain timer state', async () => {
      const timer = useTimer()
      mockSaveActivity.mockRejectedValue(new Error('Database error'))

      // Start timer
      timer.startTimer('Error handling test')
      vi.advanceTimersByTime(1000)

      // Attempt to finish (should fail)
      const finishResult = await timer.finishTimer()
      expect(finishResult).toBe(false)

      // Timer should still be running (not reset)
      expect(timer.isRunning.value).toBe(true)
      expect(timer.currentActivity.value).toBe('Error handling test')
    })

    it('should handle multiple quick operations gracefully', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      // Rapid operations
      timer.startTimer('Test 1')
      timer.pauseTimer()
      timer.resumeTimer()
      timer.resetTimer()

      timer.startTimer('Test 2')
      const finishResult = await timer.finishTimer()

      expect(finishResult).toBe(true)
      expect(mockSaveActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test 2',
        })
      )
    })
  })

  describe('Persistence Integration', () => {
    it('should maintain state across timer recreation', () => {
      // First timer instance
      const timer1 = useTimer()
      timer1.startTimer('Persistent test')
      vi.advanceTimersByTime(5000)

      // Verify state was saved
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'flowductiv-timer-state',
        expect.stringContaining('"isRunning":true')
      )

      // Mock localStorage to return the saved state
      const savedState = {
        isRunning: true,
        isPaused: false,
        elapsedMs: 5000,
        currentActivity: 'Persistent test',
        startTime: new Date().toISOString(),
      }
      window.localStorage.getItem.mockReturnValue(JSON.stringify(savedState))

      // Second timer instance (simulating page reload)
      const timer2 = useTimer()

      // Should restore state
      expect(timer2.currentActivity.value).toBe('Persistent test')
      expect(timer2.isRunning.value).toBe(true)
    })

    it('should handle persistence with pause/resume cycle', () => {
      const timer = useTimer()

      // Start, pause, save state
      timer.startTimer('Persistence with pause')
      vi.advanceTimersByTime(3000)
      timer.pauseTimer()

      // Mock the saved paused state
      const savedState = {
        isRunning: false,
        isPaused: true,
        elapsedMs: 3000,
        currentActivity: 'Persistence with pause',
        startTime: new Date().toISOString(),
      }
      window.localStorage.getItem.mockReturnValue(JSON.stringify(savedState))

      // New timer instance
      const timer2 = useTimer()

      // Should restore paused state
      expect(timer2.isPaused.value).toBe(true)
      expect(timer2.isRunning.value).toBe(false)
      expect(timer2.elapsedMs.value).toBe(3000)
      expect(timer2.canResume.value).toBe(true)
    })
  })

  describe('Event System Integration', () => {
    it('should dispatch activity-saved event on successful finish', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      const eventSpy = vi.spyOn(window, 'dispatchEvent')

      timer.startTimer('Event test')
      await timer.finishTimer()

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'activity-saved',
        })
      )
    })

    it('should not dispatch event on failed finish', async () => {
      const timer = useTimer()
      mockSaveActivity.mockRejectedValue(new Error('Save failed'))

      const eventSpy = vi.spyOn(window, 'dispatchEvent')

      timer.startTimer('Failed event test')
      await timer.finishTimer()

      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  describe('Time Calculation Integration', () => {
    it('should calculate duration correctly with pause/resume', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      const startTime = Date.now()
      vi.setSystemTime(startTime)

      timer.startTimer('Duration test')

      // Run for 2 seconds
      vi.advanceTimersByTime(2000)
      mockInterval()

      // Pause for 1 second
      timer.pauseTimer()
      vi.advanceTimersByTime(1000)

      // Resume and run for 1 more second
      timer.resumeTimer()
      vi.advanceTimersByTime(1000)
      mockInterval()

      await timer.finishTimer()

      // Should have saved with ~3 seconds duration (2 + 1, excluding pause)
      const callArgs = mockSaveActivity.mock.calls[0][0]
      expect(callArgs.durationMs).toBeGreaterThan(2800)
      expect(callArgs.durationMs).toBeLessThan(3200)
    })
  })

  describe('Tag and Priority Extraction Integration', () => {
    it('should extract multiple tags and priority correctly', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      timer.startTimer('Work on #frontend #react #typescript project !2')
      await timer.finishTimer()

      expect(mockSaveActivity).toHaveBeenCalledWith({
        title: 'Work on #frontend #react #typescript project !2',
        durationMs: expect.any(Number),
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        tags: ['frontend', 'react', 'typescript'],
        priority: 2,
      })
    })

    it('should handle activities with no tags or priority', async () => {
      const timer = useTimer()
      mockSaveActivity.mockResolvedValue(undefined)

      timer.startTimer('Simple activity description')
      await timer.finishTimer()

      expect(mockSaveActivity).toHaveBeenCalledWith({
        title: 'Simple activity description',
        durationMs: expect.any(Number),
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        tags: [],
        priority: null,
      })
    })
  })
})
