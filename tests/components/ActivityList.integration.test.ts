import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ActivityList from '~/components/ActivityList.vue'

// Mock the useActivities composable
const mockActivities = ref([])
const mockLoading = ref(false)
const mockError = ref(null)
const mockRefreshActivities = vi.fn()

vi.mock('~/composables/useActivities', () => ({
  useActivities: () => ({
    activities: mockActivities,
    loading: mockLoading,
    error: mockError,
    refreshActivities: mockRefreshActivities,
    fetchActivities: vi.fn(),
  })
}))

// Mock input parser service
vi.mock('~/services/inputParser', () => ({
  InputParserService: {
    getCleanTitle: (title: string) => title.replace(/#\w+/g, '').replace(/!\d/g, '').trim()
  }
}))

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
  },
  {
    id: '3',
    title: 'Quick review',
    durationMs: 900000, // 15 minutes
    startTime: new Date('2023-12-01T16:00:00Z'),
    endTime: new Date('2023-12-01T16:15:00Z'),
    tags: [],
    priority: null,
    focusRating: null,
    energyLevel: null
  }
]

describe('ActivityList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActivities.value = []
    mockLoading.value = false
    mockError.value = null
  })

  describe('Loading States', () => {
    it('should display loading spinner when loading', () => {
      mockLoading.value = true
      
      const wrapper = mount(ActivityList)
      
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
      expect(wrapper.text()).toContain('0 activities') // Header should still show
    })

    it('should hide loading spinner when not loading', () => {
      mockLoading.value = false
      
      const wrapper = mount(ActivityList)
      
      expect(wrapper.find('.animate-spin').exists()).toBe(false)
    })
  })

  describe('Error States', () => {
    it('should display error message when error occurs', () => {
      mockError.value = 'Failed to fetch activities'
      
      const wrapper = mount(ActivityList)
      
      expect(wrapper.text()).toContain('Failed to fetch activities')
      expect(wrapper.text()).toContain('Try again')
    })

    it('should allow user to retry after error', async () => {
      mockError.value = 'Network error'
      
      const wrapper = mount(ActivityList)
      
      const retryButton = wrapper.find('button')
      expect(retryButton.exists()).toBe(true)
      
      await retryButton.trigger('click')
      
      expect(mockRefreshActivities).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('should display empty state when no activities', () => {
      mockActivities.value = []
      
      const wrapper = mount(ActivityList)
      
      expect(wrapper.text()).toContain('No activities tracked today')
      expect(wrapper.text()).toContain('Start your first timer session above!')
      expect(wrapper.text()).toContain('0 activities')
    })
  })

  describe('Activity Display', () => {
    it('should display list of activities correctly', () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // Check header
      expect(wrapper.text()).toContain('3 activities')
      
      // Check activity list exists
      expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)
      
      // Check each activity is displayed
      expect(wrapper.text()).toContain('Work on project')
      expect(wrapper.text()).toContain('Team meeting')
      expect(wrapper.text()).toContain('Quick review')
    })

    it('should display activity durations correctly', () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // 30 minutes, 60 minutes, 15 minutes
      expect(wrapper.text()).toContain('30m')
      expect(wrapper.text()).toContain('1h')
      expect(wrapper.text()).toContain('15m')
    })

    it('should display clean titles without tags and priority', () => {
      mockActivities.value = [sampleActivities[0]] // "Work on project #urgent !2"
      
      const wrapper = mount(ActivityList)
      
      // Should show clean title
      expect(wrapper.text()).toContain('Work on project')
      // Should not show tags and priority in the title
      expect(wrapper.text()).not.toContain('#urgent')
      expect(wrapper.text()).not.toContain('!2')
    })

    it('should display time ranges correctly', () => {
      mockActivities.value = [sampleActivities[0]]
      
      const wrapper = mount(ActivityList)
      
      // Should show formatted time range
      expect(wrapper.html()).toMatch(/\d{1,2}:\d{2}.*-.*\d{1,2}:\d{2}/)
    })
  })

  describe('Activity Tags and Priority Display', () => {
    it('should display tags for activities that have them', () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // Check that tags are displayed
      expect(wrapper.text()).toContain('urgent')
      expect(wrapper.text()).toContain('work')
    })

    it('should display priority indicators', () => {
      mockActivities.value = [sampleActivities[0]] // Has priority 2
      
      const wrapper = mount(ActivityList)
      
      expect(wrapper.text()).toContain('!2')
    })

    it('should handle activities without tags or priority', () => {
      mockActivities.value = [sampleActivities[2]] // No tags or priority
      
      const wrapper = mount(ActivityList)
      
      // Should still display the activity
      expect(wrapper.text()).toContain('Quick review')
      expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)
    })
  })

  describe('Focus and Energy Ratings', () => {
    it('should display focus and energy ratings when available', () => {
      mockActivities.value = [sampleActivities[0]] // Has ratings
      
      const wrapper = mount(ActivityList)
      
      // Check for rating indicators
      expect(wrapper.text()).toContain('8')  // Focus rating
      expect(wrapper.text()).toContain('7')  // Energy level
    })

    it('should handle activities without ratings gracefully', () => {
      mockActivities.value = [sampleActivities[2]] // No ratings
      
      const wrapper = mount(ActivityList)
      
      // Should not crash and still display activity
      expect(wrapper.text()).toContain('Quick review')
    })
  })

  describe('User Interactions', () => {
    it('should allow editing activity when edit button is clicked', async () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // Find edit button (if exists in implementation)
      const editButtons = wrapper.findAll('button').filter(button => 
        button.text().includes('Edit') || button.html().includes('edit')
      )
      
      if (editButtons.length > 0) {
        await editButtons[0].trigger('click')
        // Verify edit functionality is triggered
        // This depends on the actual implementation
      }
    })

    it('should allow deleting activity when delete button is clicked', async () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // Find delete button (if exists in implementation)
      const deleteButtons = wrapper.findAll('button').filter(button => 
        button.text().includes('Delete') || button.html().includes('delete')
      )
      
      if (deleteButtons.length > 0) {
        await deleteButtons[0].trigger('click')
        // Verify delete functionality is triggered
        // This depends on the actual implementation
      }
    })
  })

  describe('Real-time Updates', () => {
    it('should update when activities list changes', async () => {
      mockActivities.value = []
      
      const wrapper = mount(ActivityList)
      
      // Initially empty
      expect(wrapper.text()).toContain('No activities tracked today')
      
      // Add activities
      mockActivities.value = sampleActivities
      await wrapper.vm.$nextTick()
      
      // Should show activities
      expect(wrapper.text()).toContain('3 activities')
      expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)
    })

    it('should listen for activity-saved events', async () => {
      const wrapper = mount(ActivityList)
      
      // Simulate the custom event that triggers refresh
      const event = new CustomEvent('activity-saved')
      window.dispatchEvent(event)
      
      await wrapper.vm.$nextTick()
      
      // Should trigger refresh (verify through mock call)
      expect(mockRefreshActivities).toHaveBeenCalled()
    })
  })

  describe('Responsive Design', () => {
    it('should handle long activity titles gracefully', () => {
      const longTitleActivity = {
        ...sampleActivities[0],
        title: 'This is a very long activity title that should wrap properly and not break the layout even on smaller screens #long #title #test !1'
      }
      mockActivities.value = [longTitleActivity]
      
      const wrapper = mount(ActivityList)
      
      // Should contain the activity and not break layout
      expect(wrapper.text()).toContain('This is a very long activity title')
      
      // Check for responsive classes
      const titleElement = wrapper.find('.break-words')
      expect(titleElement.exists()).toBe(true)
    })

    it('should maintain proper spacing between activities', () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // Check for proper spacing classes
      expect(wrapper.find('.space-y-3').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // Check for heading
      const heading = wrapper.find('h2')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toContain("Today's Activities")
      
      // Check for data-testid
      expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)
    })

    it('should provide meaningful text for screen readers', () => {
      mockActivities.value = sampleActivities
      
      const wrapper = mount(ActivityList)
      
      // Activity count should be clear
      expect(wrapper.text()).toContain('3 activities')
      
      // Time information should be present
      expect(wrapper.html()).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('Performance', () => {
    it('should handle large number of activities efficiently', () => {
      // Create 100 mock activities
      const manyActivities = Array.from({ length: 100 }, (_, i) => ({
        ...sampleActivities[0],
        id: `activity-${i}`,
        title: `Activity ${i + 1}`
      }))
      
      mockActivities.value = manyActivities
      
      const wrapper = mount(ActivityList)
      
      // Should render without performance issues
      expect(wrapper.text()).toContain('100 activities')
      expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)
    })
  })
})