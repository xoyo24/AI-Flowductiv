import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import FocusRatingModal from './FocusRatingModal.vue'

// Mock the useActivities composable
mockNuxtImport('useActivities', () => {
  return () => ({
    updateActivity: vi.fn()
  })
})

describe('FocusRatingModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render modal with activity title', async () => {
    const activity = {
      id: 'test-id',
      title: 'Learning TypeScript',
      focusRating: null
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: true,
        activity
      }
    })

    expect(wrapper.find('[data-testid="focus-rating-modal"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Learning TypeScript')
  })

  it('should render 5 star rating buttons', async () => {
    const activity = {
      id: 'test-id',
      title: 'Test Activity',
      focusRating: null
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: true,
        activity
      }
    })

    const starButtons = wrapper.findAll('[data-testid="star-button"]')
    expect(starButtons).toHaveLength(5)
  })

  it('should highlight stars when rating is set', async () => {
    const activity = {
      id: 'test-id',
      title: 'Test Activity',
      focusRating: 3
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: true,
        activity
      }
    })

    const starButtons = wrapper.findAll('[data-testid="star-button"]')
    
    // First 3 stars should be filled
    for (let i = 0; i < 3; i++) {
      expect(starButtons[i].classes()).toContain('text-yellow-400')
    }
    
    // Last 2 stars should be empty
    for (let i = 3; i < 5; i++) {
      expect(starButtons[i].classes()).toContain('text-gray-300')
    }
  })

  it('should emit rating-changed when star is clicked', async () => {
    const activity = {
      id: 'test-id',
      title: 'Test Activity',
      focusRating: null
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: true,
        activity
      }
    })

    const thirdStar = wrapper.findAll('[data-testid="star-button"]')[2]
    await thirdStar.trigger('click')

    expect(wrapper.emitted('rating-changed')).toBeTruthy()
    expect(wrapper.emitted('rating-changed')[0]).toEqual([3])
  })

  it('should emit close when cancel button is clicked', async () => {
    const activity = {
      id: 'test-id',
      title: 'Test Activity',
      focusRating: null
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: true,
        activity
      }
    })

    await wrapper.find('[data-testid="cancel-button"]').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit save when save button is clicked with rating', async () => {
    const activity = {
      id: 'test-id',
      title: 'Test Activity',
      focusRating: null
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: true,
        activity
      }
    })

    // Set a rating first
    await wrapper.findAll('[data-testid="star-button"]')[3].trigger('click')
    
    // Then save
    await wrapper.find('[data-testid="save-button"]').trigger('click')

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0]).toEqual([4])
  })

  it('should not render when isOpen is false', async () => {
    const activity = {
      id: 'test-id',
      title: 'Test Activity',
      focusRating: null
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: false,
        activity
      }
    })

    expect(wrapper.find('[data-testid="focus-rating-modal"]').exists()).toBe(false)
  })

  it('should show skip option for quick dismissal', async () => {
    const activity = {
      id: 'test-id',
      title: 'Test Activity',
      focusRating: null
    }

    const wrapper = await mountSuspended(FocusRatingModal, {
      props: {
        isOpen: true,
        activity
      }
    })

    const skipButton = wrapper.find('[data-testid="skip-button"]')
    expect(skipButton.exists()).toBe(true)
    
    await skipButton.trigger('click')
    expect(wrapper.emitted('skip')).toBeTruthy()
  })
})