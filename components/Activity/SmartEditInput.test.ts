import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import SmartEditInput from './SmartEditInput.vue'

// Mock composables
mockNuxtImport('useAutoComplete', () => {
  return () => ({
    suggestions: ref([]),
    isLoading: ref(false),
    selectNext: vi.fn(),
    selectPrevious: vi.fn(),
    performSearch: vi.fn(),
    getInitialSuggestions: vi.fn()
  })
})

mockNuxtImport('useInputParser', () => {
  return () => ({
    tags: ref(['test']),
    cleanText: ref('Test Activity')
  })
})

describe('SmartEditInput Component', () => {
  const mockActivity = {
    id: 'test-id',
    title: 'Test Activity #test',
    tags: ['test'],
    focusRating: 3
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render activity edit form with focus rating', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    expect(wrapper.find('[data-testid="edit-unified-input"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Focus Rating')
    expect(wrapper.findAll('[data-testid^="focus-star-"]')).toHaveLength(5)
  })

  it('should display current focus rating with correct stars filled', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    // First 3 stars should be filled (rating = 3)
    for (let i = 1; i <= 3; i++) {
      const star = wrapper.find(`[data-testid="focus-star-${i}"]`)
      expect(star.classes()).toContain('text-yellow-400')
    }

    // Last 2 stars should be empty
    for (let i = 4; i <= 5; i++) {
      const star = wrapper.find(`[data-testid="focus-star-${i}"]`)
      expect(star.classes()).toContain('text-gray-300')
    }
  })

  it('should emit update event when focus rating is changed', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    const fifthStar = wrapper.find('[data-testid="focus-star-5"]')
    await fifthStar.trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    const updateEvents = wrapper.emitted('update') as any[]
    const lastUpdateEvent = updateEvents[updateEvents.length - 1][0]
    expect(lastUpdateEvent.focusRating).toBe(5)
  })

  it('should clear focus rating when clear button is clicked', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    const clearButton = wrapper.find('[data-testid="clear-focus-rating"]')
    expect(clearButton.exists()).toBe(true)
    
    await clearButton.trigger('click')

    expect(wrapper.emitted('update')).toBeTruthy()
    const updateEvents = wrapper.emitted('update') as any[]
    const lastUpdateEvent = updateEvents[updateEvents.length - 1][0]
    expect(lastUpdateEvent.focusRating).toBeNull()
  })

  it('should display focus rating label when rating is set', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    // Should show label for rating 3
    expect(wrapper.text()).toContain('Moderate focus')
  })

  it('should handle activity without focus rating', async () => {
    const activityWithoutRating = {
      ...mockActivity,
      focusRating: null
    }

    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: activityWithoutRating
      }
    })

    // All stars should be empty
    for (let i = 1; i <= 5; i++) {
      const star = wrapper.find(`[data-testid="focus-star-${i}"]`)
      expect(star.classes()).toContain('text-gray-300')
    }

    // Clear button should not be visible
    expect(wrapper.find('[data-testid="clear-focus-rating"]').exists()).toBe(false)
  })

  it('should emit save event when Enter is pressed', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    const input = wrapper.find('[data-testid="edit-unified-input"]')
    await input.trigger('keyup.enter')

    expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('should include focus rating in update emissions', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    // Change the input text to trigger update
    const input = wrapper.find('[data-testid="edit-unified-input"]')
    await input.setValue('New Activity Text')

    expect(wrapper.emitted('update')).toBeTruthy()
    const updateEvent = wrapper.emitted('update')?.[0]?.[0] as any
    expect(updateEvent).toHaveProperty('title')
    expect(updateEvent).toHaveProperty('tags')
    expect(updateEvent).toHaveProperty('focusRating')
    expect(updateEvent.focusRating).toBe(3) // Should preserve original rating
  })
})