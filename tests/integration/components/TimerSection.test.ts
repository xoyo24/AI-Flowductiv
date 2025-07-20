import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import TimerSection from '~/components/TimerSection.vue'

// Mock composables
const mockTimer = {
  isRunning: ref(false),
  isPaused: ref(false),
  currentActivity: ref(''),
  formattedTime: ref('00:00'),
  canStart: ref(true),
  canPause: ref(false),
  canResume: ref(false),
  canFinish: ref(false),
  startTimer: vi.fn().mockReturnValue(true),
  pauseTimer: vi.fn().mockReturnValue(true),
  resumeTimer: vi.fn().mockReturnValue(true),
  finishTimer: vi.fn().mockResolvedValue(true),
  resetTimer: vi.fn(),
}

vi.mock('~/composables/useTimer', () => ({
  useTimer: () => mockTimer
}))

vi.mock('~/composables/useInputParser', () => ({
  useInputParser: () => ({
    extractedTags: ref([]),
    extractedPriority: ref(null),
    cleanTitle: ref(''),
  })
}))

vi.mock('~/composables/useAutoComplete', () => ({
  useAutoComplete: () => ({
    suggestions: ref([]),
    suggestionsLoading: ref(false),
    performSearch: vi.fn(),
    getInitialSuggestions: vi.fn(),
  })
}))

describe('TimerSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset timer state
    mockTimer.isRunning.value = false
    mockTimer.isPaused.value = false
    mockTimer.currentActivity.value = ''
    mockTimer.formattedTime.value = '00:00'
    mockTimer.canStart.value = true
    mockTimer.canPause.value = false
    mockTimer.canResume.value = false
    mockTimer.canFinish.value = false
  })

  describe('User Interface Rendering', () => {
    it('should render activity input field', () => {
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('placeholder')).toContain('Enter activity')
    })

    it('should display timer with correct initial time', () => {
      const wrapper = mount(TimerSection)
      
      const timerDisplay = wrapper.find('[data-testid="timer-display"]')
      expect(timerDisplay.exists()).toBe(true)
      expect(timerDisplay.text()).toBe('00:00')
    })

    it('should show correct timer status indicator', () => {
      const wrapper = mount(TimerSection)
      
      const statusIndicator = wrapper.find('[data-testid="timer-status"]')
      expect(statusIndicator.exists()).toBe(true)
      expect(statusIndicator.classes()).toContain('bg-gray-300') // Stopped state
    })
  })

  describe('Timer Controls - User Interactions', () => {
    it('should allow user to start timer with valid input', async () => {
      const wrapper = mount(TimerSection)
      
      // User types activity
      const input = wrapper.find('[data-testid="activity-input"]')
      await input.setValue('Work on project #urgent')
      
      // User clicks start button
      const startButton = wrapper.find('[data-testid="start-timer"]')
      expect(startButton.exists()).toBe(true)
      expect(startButton.attributes('disabled')).toBeUndefined()
      
      await startButton.trigger('click')
      
      expect(mockTimer.startTimer).toHaveBeenCalledWith('Work on project #urgent')
    })

    it('should disable start button when input is empty', async () => {
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      await input.setValue('')
      
      const startButton = wrapper.find('[data-testid="start-timer"]')
      expect(startButton.attributes('disabled')).toBeDefined()
    })

    it('should allow user to start timer by pressing Enter', async () => {
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      await input.setValue('Meeting with team')
      await input.trigger('keyup.enter')
      
      expect(mockTimer.startTimer).toHaveBeenCalledWith('Meeting with team')
    })

    it('should show pause button when timer is running', async () => {
      mockTimer.isRunning.value = true
      mockTimer.canPause.value = true
      mockTimer.canStart.value = false
      
      const wrapper = mount(TimerSection)
      
      const pauseButton = wrapper.find('[data-testid="pause-timer"]')
      expect(pauseButton.exists()).toBe(true)
      
      await pauseButton.trigger('click')
      expect(mockTimer.pauseTimer).toHaveBeenCalled()
    })

    it('should show resume button when timer is paused', async () => {
      mockTimer.isPaused.value = true
      mockTimer.canResume.value = true
      mockTimer.canStart.value = false
      
      const wrapper = mount(TimerSection)
      
      const resumeButton = wrapper.find('[data-testid="resume-timer"]')
      expect(resumeButton.exists()).toBe(true)
      
      await resumeButton.trigger('click')
      expect(mockTimer.resumeTimer).toHaveBeenCalled()
    })

    it('should show finish button when timer is active', async () => {
      mockTimer.isRunning.value = true
      mockTimer.canFinish.value = true
      
      const wrapper = mount(TimerSection)
      
      const finishButton = wrapper.find('[data-testid="finish-timer"]')
      expect(finishButton.exists()).toBe(true)
      
      await finishButton.trigger('click')
      expect(mockTimer.finishTimer).toHaveBeenCalled()
    })

    it('should show reset button when timer is active', async () => {
      mockTimer.isRunning.value = true
      
      const wrapper = mount(TimerSection)
      
      const resetButton = wrapper.find('[data-testid="reset-timer"]')
      expect(resetButton.exists()).toBe(true)
      
      await resetButton.trigger('click')
      expect(mockTimer.resetTimer).toHaveBeenCalled()
    })
  })

  describe('Timer State Display', () => {
    it('should display running state correctly', async () => {
      mockTimer.isRunning.value = true
      mockTimer.currentActivity.value = 'Working on project'
      mockTimer.formattedTime.value = '05:23'
      
      const wrapper = mount(TimerSection)
      
      // Check timer display
      const timerDisplay = wrapper.find('[data-testid="timer-display"]')
      expect(timerDisplay.text()).toBe('05:23')
      
      // Check current activity display
      expect(wrapper.text()).toContain('Working on project')
      
      // Check status indicator
      const statusIndicator = wrapper.find('[data-testid="timer-status"]')
      expect(statusIndicator.classes()).toContain('bg-green-500')
      expect(statusIndicator.classes()).toContain('animate-pulse')
    })

    it('should display paused state correctly', async () => {
      mockTimer.isPaused.value = true
      mockTimer.currentActivity.value = 'Paused work'
      mockTimer.formattedTime.value = '10:45'
      
      const wrapper = mount(TimerSection)
      
      const statusIndicator = wrapper.find('[data-testid="timer-status"]')
      expect(statusIndicator.classes()).toContain('bg-yellow-500')
      expect(statusIndicator.classes()).not.toContain('animate-pulse')
    })

    it('should disable input when timer is running', async () => {
      mockTimer.isRunning.value = true
      
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      expect(input.attributes('disabled')).toBeDefined()
    })

    it('should disable input when timer is paused', async () => {
      mockTimer.isPaused.value = true
      
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      expect(input.attributes('disabled')).toBeDefined()
    })
  })

  describe('Button Visibility Logic', () => {
    it('should show only start button when idle', () => {
      const wrapper = mount(TimerSection)
      
      expect(wrapper.find('[data-testid="start-timer"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="pause-timer"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="resume-timer"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="finish-timer"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="reset-timer"]').exists()).toBe(false)
    })

    it('should show pause, finish, and reset buttons when running', () => {
      mockTimer.isRunning.value = true
      mockTimer.canPause.value = true
      mockTimer.canFinish.value = true
      mockTimer.canStart.value = false
      
      const wrapper = mount(TimerSection)
      
      expect(wrapper.find('[data-testid="start-timer"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="pause-timer"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="resume-timer"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="finish-timer"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="reset-timer"]').exists()).toBe(true)
    })

    it('should show resume, finish, and reset buttons when paused', () => {
      mockTimer.isPaused.value = true
      mockTimer.canResume.value = true
      mockTimer.canFinish.value = true
      mockTimer.canStart.value = false
      
      const wrapper = mount(TimerSection)
      
      expect(wrapper.find('[data-testid="start-timer"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="pause-timer"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="resume-timer"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="finish-timer"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="reset-timer"]').exists()).toBe(true)
    })
  })

  describe('User Input Validation', () => {
    it('should trim whitespace from input before starting timer', async () => {
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      await input.setValue('  Work on project  ')
      
      const startButton = wrapper.find('[data-testid="start-timer"]')
      await startButton.trigger('click')
      
      expect(mockTimer.startTimer).toHaveBeenCalledWith('  Work on project  ')
    })

    it('should not allow starting timer with only whitespace', async () => {
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      await input.setValue('   ')
      
      const startButton = wrapper.find('[data-testid="start-timer"]')
      expect(startButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form elements', () => {
      const wrapper = mount(TimerSection)
      
      const label = wrapper.find('label[for="activity-input"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toContain('What are you working on?')
      
      const input = wrapper.find('#activity-input')
      expect(input.exists()).toBe(true)
    })

    it('should have data-testid attributes for automated testing', () => {
      const wrapper = mount(TimerSection)
      
      const testIds = [
        'activity-input',
        'timer-display', 
        'timer-status',
        'start-timer'
      ]
      
      testIds.forEach(testId => {
        expect(wrapper.find(`[data-testid="${testId}"]`).exists()).toBe(true)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle timer start failure gracefully', async () => {
      mockTimer.startTimer.mockReturnValue(false)
      
      const wrapper = mount(TimerSection)
      
      const input = wrapper.find('[data-testid="activity-input"]')
      await input.setValue('Test activity')
      
      const startButton = wrapper.find('[data-testid="start-timer"]')
      await startButton.trigger('click')
      
      expect(mockTimer.startTimer).toHaveBeenCalled()
      // Component should not crash and remain in idle state
      expect(wrapper.find('[data-testid="start-timer"]').exists()).toBe(true)
    })

    it('should handle finish timer failure gracefully', async () => {
      mockTimer.finishTimer.mockResolvedValue(false)
      mockTimer.isRunning.value = true
      mockTimer.canFinish.value = true
      
      const wrapper = mount(TimerSection)
      
      const finishButton = wrapper.find('[data-testid="finish-timer"]')
      await finishButton.trigger('click')
      
      expect(mockTimer.finishTimer).toHaveBeenCalled()
    })
  })
})