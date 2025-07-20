import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ActivityList from '~/components/ActivityList.vue'

describe('ActivityList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render basic structure', () => {
    const wrapper = mount(ActivityList, {
      global: {
        mocks: {
          useActivities: () => ({
            activities: ref([]),
            loading: ref(false),
            error: ref(null),
            getActivityStats: ref({ totalTime: 0, activityCount: 0, longestSession: 0 }),
            getTodaysActivities: vi.fn(),
            deleteActivity: vi.fn(),
            formatDuration: vi.fn(() => '0m'),
          })
        }
      }
    })
    
    expect(wrapper.find('h2').text()).toContain("Today's Activities")
    expect(wrapper.text()).toContain('0 activities')
  })

  it('should display loading state', () => {
    const wrapper = mount(ActivityList, {
      global: {
        mocks: {
          useActivities: () => ({
            activities: ref([]),
            loading: ref(true),
            error: ref(null),
            getActivityStats: ref({ totalTime: 0, activityCount: 0, longestSession: 0 }),
            getTodaysActivities: vi.fn(),
            deleteActivity: vi.fn(),
            formatDuration: vi.fn(() => '0m'),
          })
        }
      }
    })
    
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('should display empty state', () => {
    const wrapper = mount(ActivityList, {
      global: {
        mocks: {
          useActivities: () => ({
            activities: ref([]),
            loading: ref(false),
            error: ref(null),
            getActivityStats: ref({ totalTime: 0, activityCount: 0, longestSession: 0 }),
            getTodaysActivities: vi.fn(),
            deleteActivity: vi.fn(),
            formatDuration: vi.fn(() => '0m'),
          })
        }
      }
    })
    
    expect(wrapper.text()).toContain('No activities tracked today')
    expect(wrapper.text()).toContain('Start your first timer session above!')
  })

  it('should display error state', () => {
    const wrapper = mount(ActivityList, {
      global: {
        mocks: {
          useActivities: () => ({
            activities: ref([]),
            loading: ref(false),
            error: ref('Failed to fetch activities'),
            getActivityStats: ref({ totalTime: 0, activityCount: 0, longestSession: 0 }),
            getTodaysActivities: vi.fn(),
            deleteActivity: vi.fn(),
            formatDuration: vi.fn(() => '0m'),
          })
        }
      }
    })
    
    expect(wrapper.text()).toContain('Failed to fetch activities')
    expect(wrapper.text()).toContain('Try again')
  })

  it('should display activities when they exist', () => {
    const sampleActivities = [
      {
        id: '1',
        title: 'Work on project #urgent !2',
        durationMs: 1800000,
        startTime: new Date('2023-12-01T10:00:00Z'),
        endTime: new Date('2023-12-01T10:30:00Z'),
        tags: ['urgent'],
        priority: 2,
        focusRating: 8,
        energyLevel: 7
      }
    ]

    const wrapper = mount(ActivityList, {
      global: {
        mocks: {
          useActivities: () => ({
            activities: ref(sampleActivities),
            loading: ref(false),
            error: ref(null),
            getActivityStats: ref({ totalTime: 1800000, activityCount: 1, longestSession: 1800000 }),
            getTodaysActivities: vi.fn(),
            deleteActivity: vi.fn(),
            formatDuration: vi.fn(() => '30m'),
          })
        }
      }
    })
    
    expect(wrapper.text()).toContain('1 activities')
    expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Work on project')
  })
})