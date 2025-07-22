import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import DailySummary from '~/components/DailySummary.vue'

// Sample test data
const sampleActivities = [
  {
    id: '1',
    title: 'Work on project #urgent !2',
    durationMs: 1800000, // 30 minutes
    startTime: new Date('2023-12-01T10:00:00Z'),
    endTime: new Date('2023-12-01T10:30:00Z'),
    tags: ['urgent'],
    priority: 2,
    focusRating: 8,
    energyLevel: 7
  },
  {
    id: '2',
    title: 'Team meeting #work',
    durationMs: 3600000, // 60 minutes
    startTime: new Date('2023-12-01T14:00:00Z'),
    endTime: new Date('2023-12-01T15:00:00Z'),
    tags: ['work'],
    priority: null,
    focusRating: 6,
    energyLevel: 5
  }
]

const sampleSummary = {
  id: 'summary-1',
  content: 'Today was a productive day with focused work on urgent project tasks and effective team collaboration.',
  provider: 'Claude',
  generatedAt: new Date().toISOString()
}

// Mock variables that will be updated per test
let mockActivities = ref([])
let mockGetTodaysActivities = vi.fn()

// Mock fetch for API calls
let mockFetch = vi.fn()

// Mock the useActivities composable at the top level
mockNuxtImport('useActivities', () => {
  return () => ({
    activities: mockActivities,
    getTodaysActivities: mockGetTodaysActivities,
  })
})

// Mock useDebounceFn
mockNuxtImport('useDebounceFn', () => {
  return (fn: Function) => fn
})

describe('DailySummary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all mock values to defaults
    mockActivities.value = []
    mockGetTodaysActivities = vi.fn()
    mockFetch = vi.fn()
    
    // Mock global $fetch
    global.$fetch = mockFetch
  })

  describe('Empty States', () => {
    it('should show empty state when no activities exist', async () => {
      const wrapper = await mountSuspended(DailySummary)
      
      expect(wrapper.find('h2').text()).toContain('Daily Summary')
      expect(wrapper.text()).toContain('Start tracking activities')
      expect(wrapper.text()).toContain('AI insights will appear here')
    })

    it('should show generate button when activities exist but no summary', async () => {
      mockActivities.value = sampleActivities
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      expect(generateButton.exists()).toBe(true)
      expect(generateButton.text()).toContain('Generate AI Summary')
    })
  })

  describe('Loading States', () => {
    it('should display loading spinner and message when generating', async () => {
      mockActivities.value = sampleActivities
      
      // Mock a pending fetch that keeps loading
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
      expect(wrapper.text()).toContain('Generating insights...')
    })

    it('should hide loading state when not loading', async () => {
      const wrapper = await mountSuspended(DailySummary)
      
      expect(wrapper.find('.animate-spin').exists()).toBe(false)
    })
  })

  describe('Error States', () => {
    it('should display error message when generation fails', async () => {
      mockActivities.value = sampleActivities
      mockFetch.mockRejectedValue(new Error('API Error'))
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('Failed to generate AI summary')
      expect(wrapper.text()).toContain('Try again')
    })

    it('should allow user to retry after error', async () => {
      mockActivities.value = sampleActivities
      mockFetch.mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      // Clear any initial calls from mounting
      mockFetch.mockClear()
      
      // First click fails
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Find and click retry button
      const retryButton = wrapper.find('button')
      expect(retryButton.exists()).toBe(true)
      
      await retryButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Summary Display', () => {
    it('should display AI-generated summary content', async () => {
      mockActivities.value = sampleActivities
      mockFetch.mockResolvedValue({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('Today was a productive day')
      expect(wrapper.text()).toContain('urgent project tasks')
      expect(wrapper.text()).toContain('team collaboration')
    })

    it('should display AI provider information', async () => {
      mockActivities.value = sampleActivities
      mockFetch.mockResolvedValue({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('AI Claude')
    })

    it('should format summary content with HTML', async () => {
      const summaryWithFormatting = {
        ...sampleSummary,
        content: 'Line 1\nLine 2\nLine 3'
      }
      
      mockActivities.value = sampleActivities
      mockFetch.mockResolvedValue({ data: summaryWithFormatting })
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      // Should convert newlines to <br> tags
      expect(wrapper.html()).toContain('Line 1<br>Line 2<br>Line 3')
    })
  })

  describe('Focus and Energy Scores', () => {
    it('should display focus score correctly', async () => {
      mockActivities.value = sampleActivities // Average focus: (8+6)/2 = 7
      mockFetch.mockResolvedValue({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('Focus Score')
      expect(wrapper.text()).toContain('7/5')
    })

    it('should display productivity level when available', async () => {
      mockActivities.value = sampleActivities // Total: 90 minutes = 1.5 hours = Low
      mockFetch.mockResolvedValue({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('Productivity')
      expect(wrapper.text()).toContain('Low')
    })

    it('should handle missing scores gracefully', async () => {
      const activitiesNoRatings = sampleActivities.map(a => ({ ...a, focusRating: null }))
      mockActivities.value = activitiesNoRatings
      mockFetch.mockResolvedValue({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('0/5')
    })
  })

  describe('User Interactions', () => {
    it('should trigger summary generation when button clicked', async () => {
      mockActivities.value = sampleActivities
      mockFetch.mockResolvedValue({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/ai/daily-summary', {
        method: 'POST',
        body: expect.objectContaining({
          activities: expect.any(Array)
        })
      })
    })

    it('should allow regenerating summary when one exists', async () => {
      mockActivities.value = sampleActivities
      mockFetch.mockResolvedValue({ data: sampleSummary })
      
      const wrapper = await mountSuspended(DailySummary)
      
      // Clear any initial calls from mounting
      mockFetch.mockClear()
      
      // Generate initial summary
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      // Find and click refresh button
      const refreshButton = wrapper.find('button[class*="text-primary"]')
      expect(refreshButton.exists()).toBe(true)
      
      await refreshButton.trigger('click')
      
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      const wrapper = await mountSuspended(DailySummary)
      
      // Check for heading
      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain('Daily Summary')
    })

    it('should provide meaningful loading state for screen readers', async () => {
      mockActivities.value = sampleActivities
      mockFetch.mockImplementation(() => new Promise(() => {}))
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      await generateButton.trigger('click')
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('Generating insights...')
    })

    it('should have accessible button text', async () => {
      mockActivities.value = sampleActivities
      
      const wrapper = await mountSuspended(DailySummary)
      
      const generateButton = wrapper.find('button')
      expect(generateButton.text()).toContain('Generate AI Summary')
    })
  })
})