import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import TimerSectionMobile from '~/components/TimerSectionMobile.vue'

// Mock timer composable
const mockIsRunning = ref(false)
const mockIsPaused = ref(false)
const mockCurrentActivity = ref('')
const mockFormattedTime = ref('00:00:00')
const mockStartTimer = vi.fn()
const mockPauseTimer = vi.fn()
const mockResumeTimer = vi.fn()
const mockFinishTimer = vi.fn()
const mockResetTimer = vi.fn()

mockNuxtImport('useTimer', () => {
  return () => ({
    isRunning: mockIsRunning,
    isPaused: mockIsPaused,
    currentActivity: mockCurrentActivity,
    formattedTime: mockFormattedTime,
    canStart: ref(true),
    canPause: ref(false),
    canResume: ref(false),
    canFinish: ref(false),
    startTimer: mockStartTimer,
    pauseTimer: mockPauseTimer,
    resumeTimer: mockResumeTimer,
    finishTimer: mockFinishTimer,
    resetTimer: mockResetTimer,
  })
})

// Mock viewport composable for mobile detection
const mockIsMobile = ref(true)
const mockIsTouchDevice = ref(true)

mockNuxtImport('useViewport', () => {
  return () => ({
    isMobile: mockIsMobile,
    isTouchDevice: mockIsTouchDevice,
    screenHeight: ref(800),
    screenWidth: ref(375),
  })
})

// Mock haptic feedback
const mockVibrate = vi.fn()

// Mock input parser
mockNuxtImport('useInputParser', () => {
  return (input: any) => ({
    tags: ref([]),
    priority: ref(null),
    cleanText: ref(''),
  })
})

// Mock auto-complete
mockNuxtImport('useAutoComplete', () => {
  return () => ({
    suggestions: ref([]),
    isLoading: ref(false),
    selectedIndex: ref(-1),
    selectNext: vi.fn(),
    selectPrevious: vi.fn(),
    selectCurrent: vi.fn(),
    selectIndex: vi.fn(),
    performSearch: vi.fn(),
    getInitialSuggestions: vi.fn(),
  })
})

describe('TimerSectionMobile Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock states
    mockIsRunning.value = false
    mockIsPaused.value = false
    mockCurrentActivity.value = ''
    mockFormattedTime.value = '00:00:00'
    mockIsMobile.value = true
    mockIsTouchDevice.value = true

    // Mock Web Vibration API
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true,
      configurable: true,
    })
  })

  describe('Mobile-First Design', () => {
    it('should render mobile-optimized layout', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      // Should have mobile-specific container classes
      expect(wrapper.find('[data-testid="mobile-timer-container"]').exists()).toBe(true)

      // Should use full viewport height
      const container = wrapper.find('[data-testid="mobile-timer-container"]')
      expect(container.classes()).toContain('min-h-screen')
    })

    it('should have 44px minimum touch targets', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      // Main action button should meet touch target requirements
      const startButton = wrapper.find('[data-testid="mobile-start-button"]')
      expect(startButton.exists()).toBe(true)

      // Check that button has appropriate size classes for 44px minimum
      const buttonClasses = startButton.classes().join(' ')
      expect(buttonClasses).toMatch(/h-12|h-14|py-3|py-4/)
    })

    it('should prevent iOS zoom on input focus', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const input = wrapper.find('[data-testid="mobile-activity-input"]')
      expect(input.exists()).toBe(true)

      // Should have font-size >= 16px to prevent iOS zoom
      const inputClasses = input.classes().join(' ')
      expect(inputClasses).toMatch(/text-base|text-lg|text-xl/)
    })
  })

  describe('Progressive Disclosure', () => {
    it('should show minimal interface when timer is stopped', async () => {
      mockIsRunning.value = false
      mockIsPaused.value = false

      const wrapper = await mountSuspended(TimerSectionMobile)

      // Should show activity input and start button
      expect(wrapper.find('[data-testid="mobile-activity-input"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mobile-start-button"]').exists()).toBe(true)

      // Should not show advanced controls
      expect(wrapper.find('[data-testid="mobile-pause-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="mobile-reset-button"]').exists()).toBe(false)
    })

    it('should show timer controls when running', async () => {
      mockIsRunning.value = true
      mockCurrentActivity.value = 'Testing'

      const wrapper = await mountSuspended(TimerSectionMobile)

      // Should show timer display prominently
      expect(wrapper.find('[data-testid="mobile-timer-display"]').exists()).toBe(true)

      // Should show pause and reset buttons
      expect(wrapper.find('[data-testid="mobile-pause-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mobile-reset-button"]').exists()).toBe(true)

      // Activity input should be hidden or minimized when running
      expect(wrapper.find('[data-testid="mobile-activity-input"]').exists()).toBe(false)
    })

    it('should show finish controls when paused', async () => {
      mockIsPaused.value = true
      mockCurrentActivity.value = 'Testing'

      const wrapper = await mountSuspended(TimerSectionMobile)

      // Should show resume and finish buttons
      expect(wrapper.find('[data-testid="mobile-resume-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="mobile-finish-button"]').exists()).toBe(true)
    })
  })

  describe('Haptic Feedback', () => {
    it('should provide haptic feedback on timer start', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const input = wrapper.find('[data-testid="mobile-activity-input"]')
      await input.setValue('Test activity')

      const startButton = wrapper.find('[data-testid="mobile-start-button"]')
      await startButton.trigger('click')

      expect(mockVibrate).toHaveBeenCalledWith([100])
    })

    it('should provide haptic feedback on timer pause', async () => {
      mockIsRunning.value = true

      const wrapper = await mountSuspended(TimerSectionMobile)

      const pauseButton = wrapper.find('[data-testid="mobile-pause-button"]')
      await pauseButton.trigger('click')

      expect(mockVibrate).toHaveBeenCalledWith([50, 50])
    })

    it('should provide haptic feedback on timer finish', async () => {
      mockIsPaused.value = true

      const wrapper = await mountSuspended(TimerSectionMobile)

      const finishButton = wrapper.find('[data-testid="mobile-finish-button"]')
      await finishButton.trigger('click')

      expect(mockVibrate).toHaveBeenCalledWith([200])
    })

    it('should not attempt haptic feedback if vibration API unavailable', async () => {
      // Remove vibration API
      delete (navigator as any).vibrate

      const wrapper = await mountSuspended(TimerSectionMobile)

      const input = wrapper.find('[data-testid="mobile-activity-input"]')
      await input.setValue('Test activity')

      const startButton = wrapper.find('[data-testid="mobile-start-button"]')
      await startButton.trigger('click')

      // Should not throw error when vibration is unavailable
      expect(wrapper.vm).toBeTruthy()
    })
  })

  describe('Touch Interactions', () => {
    it('should handle touch events for timer controls', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const input = wrapper.find('[data-testid="mobile-activity-input"]')
      await input.setValue('Test activity')

      const startButton = wrapper.find('[data-testid="mobile-start-button"]')
      await startButton.trigger('touchstart')
      await startButton.trigger('touchend')

      expect(mockStartTimer).toHaveBeenCalledWith('Test activity')
    })

    it('should provide immediate visual feedback on touch', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const startButton = wrapper.find('[data-testid="mobile-start-button"]')

      // Should have active states for touch feedback
      const buttonClasses = startButton.classes().join(' ')
      expect(buttonClasses).toMatch(/active:|hover:/)
    })
  })

  describe('Safe Area Optimization', () => {
    it('should respect iOS safe areas', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const container = wrapper.find('[data-testid="mobile-timer-container"]')

      // Should use safe area padding
      const containerClasses = container.classes().join(' ')
      expect(containerClasses).toMatch(/pt-safe|pb-safe|px-safe/)
    })

    it('should adjust layout for different screen sizes', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      // Should be responsive to different mobile screen sizes
      const container = wrapper.find('[data-testid="mobile-timer-container"]')
      expect(container.classes()).toContain('w-full')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for mobile controls', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const startButton = wrapper.find('[data-testid="mobile-start-button"]')
      expect(startButton.attributes('aria-label')).toBeDefined()
    })

    it('should support screen reader navigation', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      // Timer display should be announced to screen readers
      const timerDisplay = wrapper.find('[data-testid="mobile-timer-display"]')
      expect(timerDisplay.attributes('aria-live')).toBe('polite')
    })
  })

  describe('Input Handling', () => {
    it('should start timer when activity is entered and start button clicked', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const input = wrapper.find('[data-testid="mobile-activity-input"]')
      await input.setValue('Mobile testing')

      const startButton = wrapper.find('[data-testid="mobile-start-button"]')
      await startButton.trigger('click')

      expect(mockStartTimer).toHaveBeenCalledWith('Mobile testing')
    })

    it('should disable start button when no activity entered', async () => {
      const wrapper = await mountSuspended(TimerSectionMobile)

      const startButton = wrapper.find('[data-testid="mobile-start-button"]')
      expect(startButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Timer Display', () => {
    it('should display formatted time prominently when running', async () => {
      mockIsRunning.value = true
      mockFormattedTime.value = '01:23:45'

      const wrapper = await mountSuspended(TimerSectionMobile)

      const timerDisplay = wrapper.find('[data-testid="mobile-timer-display"]')
      expect(timerDisplay.text()).toContain('01:23:45')

      // Should use large text for mobile visibility
      const displayClasses = timerDisplay.classes().join(' ')
      expect(displayClasses).toMatch(/text-4xl|text-5xl|text-6xl/)
    })

    it('should show current activity when timer is running', async () => {
      mockIsRunning.value = true
      mockCurrentActivity.value = 'Mobile development'

      const wrapper = await mountSuspended(TimerSectionMobile)

      expect(wrapper.text()).toContain('Mobile development')
    })
  })
})
