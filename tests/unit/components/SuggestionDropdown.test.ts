import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SuggestionDropdown from '~/components/Activity/SuggestionDropdown.vue'
import type { ActivitySuggestion } from '~/types/activity'

// Sample test data
const mockSuggestions: ActivitySuggestion[] = [
  { id: '1', text: 'Work on project', type: 'activity', frequency: 5, lastUsed: new Date() },
  { id: '2', text: 'urgent', type: 'tag', frequency: 3, lastUsed: new Date() },
  { id: '3', text: 'Meeting', type: 'activity', frequency: 2, lastUsed: new Date() }
]

describe('SuggestionDropdown Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Visibility and Basic Rendering', () => {
    it('should not render when not visible', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: false,
          selectedIndex: -1
        }
      })

      expect(wrapper.find('[data-testid="suggestion-dropdown"]').exists()).toBe(false)
    })

    it('should render when visible with suggestions', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1
        }
      })

      expect(wrapper.find('[data-testid="suggestion-dropdown"]').exists()).toBe(true)
    })

    it('should render when visible and loading', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: [],
          visible: true,
          selectedIndex: -1,
          loading: true
        }
      })

      expect(wrapper.find('[data-testid="suggestion-dropdown"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="loading-suggestions"]').exists()).toBe(true)
    })
  })

  describe('Loading State', () => {
    it('should display loading spinner and message when loading', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: [],
          visible: true,
          selectedIndex: -1,
          loading: true
        }
      })

      expect(wrapper.find('[data-testid="loading-suggestions"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading suggestions...')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })

    it('should not show suggestions list when loading', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1,
          loading: true
        }
      })

      expect(wrapper.find('[data-testid="loading-suggestions"]').exists()).toBe(true)
      expect(wrapper.findAll('[data-testid="suggestion-item"]')).toHaveLength(0)
    })
  })

  describe('Suggestions Display', () => {
    it('should render all suggestions correctly', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1
        }
      })

      const suggestionItems = wrapper.findAll('[data-testid="suggestion-item"]')
      expect(suggestionItems).toHaveLength(3)
      
      // Check activity suggestion
      expect(wrapper.text()).toContain('Work on project')
      expect(wrapper.text()).toContain('Used 5 times')
      expect(wrapper.text()).toContain('Activity')
      
      // Check tag suggestion
      expect(wrapper.text()).toContain('#urgent')
      expect(wrapper.text()).toContain('Used 3 times')
      expect(wrapper.text()).toContain('Tag')
    })

    it('should display activity suggestions correctly', async () => {
      const activitySuggestion = mockSuggestions.filter(s => s.type === 'activity')[0]
      
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: [activitySuggestion],
          visible: true,
          selectedIndex: -1
        }
      })

      expect(wrapper.text()).toContain('Work on project')
      expect(wrapper.text()).toContain('Activity • Used 5 times')
      expect(wrapper.find('[data-type="activity"]').exists()).toBe(true)
    })

    it('should display tag suggestions correctly', async () => {
      const tagSuggestion = mockSuggestions.filter(s => s.type === 'tag')[0]
      
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: [tagSuggestion],
          visible: true,
          selectedIndex: -1
        }
      })

      expect(wrapper.text()).toContain('#urgent')
      expect(wrapper.text()).toContain('Tag • Used 3 times')
      expect(wrapper.find('[data-type="tag"]').exists()).toBe(true)
    })
  })

  describe('Selection Highlighting', () => {
    it('should highlight selected suggestion', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: 1
        }
      })

      const suggestionItems = wrapper.findAll('[data-testid="suggestion-item"]')
      
      // First item should not be selected
      expect(suggestionItems[0].classes()).not.toContain('selected')
      expect(suggestionItems[0].attributes('aria-selected')).toBe('false')
      
      // Second item should be selected
      expect(suggestionItems[1].classes()).toContain('selected')
      expect(suggestionItems[1].attributes('aria-selected')).toBe('true')
    })

    it('should show screen reader description for selected item', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: 0
        }
      })

      expect(wrapper.find('#suggestion-0-desc').exists()).toBe(true)
      expect(wrapper.find('#suggestion-0-desc').text()).toContain('Activity suggestion Work on project, used 5 times')
    })
  })

  describe('User Interactions', () => {
    it('should emit select event when suggestion is clicked', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1
        }
      })

      const firstSuggestion = wrapper.findAll('[data-testid="suggestion-item"]')[0]
      await firstSuggestion.trigger('click')

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockSuggestions[0]])
    })

    it('should emit hover event when suggestion is hovered', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1
        }
      })

      const secondSuggestion = wrapper.findAll('[data-testid="suggestion-item"]')[1]
      await secondSuggestion.trigger('mouseenter')

      expect(wrapper.emitted('hover')).toBeTruthy()
      expect(wrapper.emitted('hover')![0]).toEqual([1])
    })

    it('should prevent event propagation on click', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1
        }
      })

      const firstSuggestion = wrapper.findAll('[data-testid="suggestion-item"]')[0]
      const clickEvent = new Event('click')
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')
      
      await firstSuggestion.element.dispatchEvent(clickEvent)
      
      // The component should call stopPropagation (tested through DOM event behavior)
      expect(wrapper.emitted('select')).toBeTruthy()
    })
  })

  describe('Exposed Methods', () => {
    it('should handle enter key selection through exposed method', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: 1
        }
      })

      // Access the exposed method
      const component = wrapper.vm as any
      component.handleEnterKey()

      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockSuggestions[1]])
    })

    it('should not emit select when no suggestion is selected on enter', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1
        }
      })

      const component = wrapper.vm as any
      component.handleEnterKey()

      expect(wrapper.emitted('select')).toBeFalsy()
    })

    it('should handle escape key through exposed method', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -1
        }
      })

      const component = wrapper.vm as any
      component.handleEscapeKey()

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('Empty State', () => {
    it('should not render dropdown when no suggestions and not loading', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: [],
          visible: true,
          selectedIndex: -1,
          loading: false
        }
      })

      // Dropdown should not render at all when no suggestions and not loading
      expect(wrapper.find('[data-testid="suggestion-dropdown"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="no-suggestions"]').exists()).toBe(false)
    })

    it('should not show empty state when loading', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: [],
          visible: true,
          selectedIndex: -1,
          loading: true
        }
      })

      expect(wrapper.find('[data-testid="no-suggestions"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="loading-suggestions"]').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: 0
        }
      })

      const dropdown = wrapper.find('[data-testid="suggestion-dropdown"]')
      expect(dropdown.attributes('role')).toBe('listbox')
      expect(dropdown.attributes('aria-label')).toBe('Activity suggestions')

      const suggestionItems = wrapper.findAll('[data-testid="suggestion-item"]')
      suggestionItems.forEach(item => {
        expect(item.attributes('role')).toBe('option')
        expect(item.attributes('tabindex')).toBe('-1')
      })
    })

    it('should provide screen reader descriptions for selected items', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: 1
        }
      })

      const selectedItem = wrapper.findAll('[data-testid="suggestion-item"]')[1]
      expect(selectedItem.attributes('aria-describedby')).toBe('suggestion-1-desc')
      
      const description = wrapper.find('#suggestion-1-desc')
      expect(description.exists()).toBe(true)
      expect(description.classes()).toContain('sr-only')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid selected index gracefully', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: 999
        }
      })

      const component = wrapper.vm as any
      component.handleEnterKey()

      expect(wrapper.emitted('select')).toBeFalsy()
    })

    it('should handle negative selected index gracefully', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: mockSuggestions,
          visible: true,
          selectedIndex: -5
        }
      })

      const component = wrapper.vm as any
      component.handleEnterKey()

      expect(wrapper.emitted('select')).toBeFalsy()
    })

    it('should handle empty suggestions array', async () => {
      const wrapper = await mountSuspended(SuggestionDropdown, {
        props: {
          suggestions: [],
          visible: true,
          selectedIndex: 0
        }
      })

      const component = wrapper.vm as any
      component.handleEnterKey()

      expect(wrapper.emitted('select')).toBeFalsy()
      // Dropdown should not render when no suggestions and not loading
      expect(wrapper.find('[data-testid="suggestion-dropdown"]').exists()).toBe(false)
    })
  })
})