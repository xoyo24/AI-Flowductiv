import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ActivityList from './ActivityList.vue'

describe('ActivityList Component', () => {
  const mockActivities = [
    {
      id: 'activity-1',
      title: 'Work on project #work #typescript',
      durationMs: 3600000, // 1 hour
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T10:00:00Z',
      tags: ['work', 'typescript'],
      priority: 2,
      focusRating: 3,
    },
    {
      id: 'activity-2',
      title: 'Meeting #meeting',
      durationMs: 1800000, // 30 minutes
      startTime: '2024-01-01T14:00:00Z',
      endTime: '2024-01-01T14:30:00Z',
      tags: ['meeting'],
      priority: null,
      focusRating: null,
    },
  ]

  const defaultProps = {
    activities: mockActivities,
    hasMoreActivities: false,
    loading: false,
    emptyMessage: 'No activities found',
    formatDuration: (ms: number) => `${Math.round(ms / 60000)}m`,
    formatRelativeTime: (_time: string) => '2 hours ago',
    formatTimeRange: (_start: string, _end: string) => '9:00 AM - 10:00 AM',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render activity list with focus rating stars', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    expect(wrapper.text()).toContain('Work on project #work #typescript')
    expect(wrapper.text()).toContain('Meeting #meeting')
    expect(wrapper.text()).toContain('Focus:')

    // Should have 10 stars total (5 for each activity)
    const stars = wrapper.findAll('button[data-testid*="star-"]')
    expect(stars).toHaveLength(10)
  })

  it('should display correct filled stars for activity with rating', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    // First activity has rating 3, so first 3 stars should be filled
    for (let i = 1; i <= 3; i++) {
      const star = wrapper.find(`[data-testid="activity-activity-1-star-${i}"]`)
      expect(star.classes()).toContain('text-yellow-400')
    }

    // Last 2 stars should be empty
    for (let i = 4; i <= 5; i++) {
      const star = wrapper.find(`[data-testid="activity-activity-1-star-${i}"]`)
      expect(star.classes()).toContain('text-gray-300')
    }
  })

  it('should display all empty stars for activity without rating', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    // Second activity has no rating, so all stars should be empty
    for (let i = 1; i <= 5; i++) {
      const star = wrapper.find(`[data-testid="activity-activity-2-star-${i}"]`)
      expect(star.classes()).toContain('text-gray-300')
    }
  })

  it('should emit activity-focus-rating when star is clicked', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    const fourthStar = wrapper.find('[data-testid="activity-activity-1-star-4"]')
    await fourthStar.trigger('click')

    expect(wrapper.emitted('activity-focus-rating')).toBeTruthy()
    const emittedEvent = wrapper.emitted('activity-focus-rating')?.[0]
    expect(emittedEvent?.[0]).toEqual(mockActivities[0]) // activity
    expect(emittedEvent?.[1]).toBe(4) // rating
  })

  it('should not trigger activity-click when star is clicked', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    const star = wrapper.find('[data-testid="activity-activity-1-star-2"]')
    await star.trigger('click')

    expect(wrapper.emitted('activity-click')).toBeFalsy()
    expect(wrapper.emitted('activity-focus-rating')).toBeTruthy()
  })

  it('should show hover effects on unrated stars', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    // For activity with rating 3, star 4 and 5 should have hover class
    const fourthStar = wrapper.find('[data-testid="activity-activity-1-star-4"]')
    expect(fourthStar.classes()).toContain('hover:text-yellow-300')

    const fifthStar = wrapper.find('[data-testid="activity-activity-1-star-5"]')
    expect(fifthStar.classes()).toContain('hover:text-yellow-300')
  })

  it('should display tags and priority alongside focus rating', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    // Should show tags
    expect(wrapper.text()).toContain('#work')
    expect(wrapper.text()).toContain('#typescript')
    expect(wrapper.text()).toContain('#meeting')

    // Should show priority
    expect(wrapper.text()).toContain('!2')

    // Should show focus rating interface
    expect(wrapper.text()).toContain('Focus:')
  })

  it('should handle empty activities list', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: {
        ...defaultProps,
        activities: [],
      },
    })

    expect(wrapper.text()).toContain('No activities found')
    expect(wrapper.findAll('[data-testid^="activity-"]')).toHaveLength(0)
  })

  it('should emit other activity events correctly', async () => {
    const wrapper = await mountSuspended(ActivityList, {
      props: defaultProps,
    })

    // Test activity click on main card (not on stars)
    const activityCard = wrapper.find('.activity-card')
    await activityCard.trigger('click')

    expect(wrapper.emitted('activity-click')).toBeTruthy()
  })
})
