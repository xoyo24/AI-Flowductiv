import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ActivityList from '~/components/ActivityList.vue'

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
    energyLevel: 7,
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
    energyLevel: 5,
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
    energyLevel: null,
  },
]

// Mock variables that will be updated per test
const mockActivities = ref([])
const mockLoading = ref(false)
const mockError = ref(null)
const mockGetActivityStats = ref({ totalTime: 0, activityCount: 0, longestSession: 0 })
let mockGetTodaysActivities = vi.fn()
let mockDeleteActivity = vi.fn()
let mockFormatDuration = vi.fn(() => '0m')

// Mock the useActivities composable at the top level
mockNuxtImport('useActivities', () => {
  return () => ({
    activities: mockActivities,
    loading: mockLoading,
    error: mockError,
    getActivityStats: mockGetActivityStats,
    getTodaysActivities: mockGetTodaysActivities,
    deleteActivity: mockDeleteActivity,
    formatDuration: mockFormatDuration,
  })
})

describe('ActivityList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset all mock values to defaults
    mockActivities.value = []
    mockLoading.value = false
    mockError.value = null
    mockGetActivityStats.value = { totalTime: 0, activityCount: 0, longestSession: 0 }
    mockGetTodaysActivities = vi.fn()
    mockDeleteActivity = vi.fn()
    mockFormatDuration = vi.fn(() => '0m')
  })

  it('should render basic structure with empty state', async () => {
    const wrapper = await mountSuspended(ActivityList)

    expect(wrapper.find('h2').text()).toContain("Today's Activities")
    expect(wrapper.text()).toContain('0 activities')
    expect(wrapper.text()).toContain('No activities tracked today')
    expect(wrapper.text()).toContain('Start your first timer session above!')
  })

  it('should display loading state', async () => {
    // Set loading state
    mockLoading.value = true

    const wrapper = await mountSuspended(ActivityList)

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.text()).toContain('0 activities')
  })

  it('should display error state', async () => {
    // Set error state
    mockError.value = 'Failed to fetch activities'
    mockGetTodaysActivities = vi.fn()

    const wrapper = await mountSuspended(ActivityList)

    expect(wrapper.text()).toContain('Failed to fetch activities')
    expect(wrapper.text()).toContain('Try again')

    // Test retry functionality
    const retryButton = wrapper.find('button')
    expect(retryButton.exists()).toBe(true)

    await retryButton.trigger('click')
    expect(mockGetTodaysActivities).toHaveBeenCalled()
  })

  it('should display activities when they exist', async () => {
    // Set activities data
    mockActivities.value = sampleActivities
    mockGetActivityStats.value = { totalTime: 7200000, activityCount: 3, longestSession: 3600000 }
    mockFormatDuration = vi.fn(() => '30m')

    const wrapper = await mountSuspended(ActivityList)

    // Check header shows correct count
    expect(wrapper.text()).toContain('3 activities')

    // Check activity list exists
    expect(wrapper.find('[data-testid="activity-list"]').exists()).toBe(true)

    // Check some activity content is displayed
    expect(wrapper.text()).toContain('Work on project')
    expect(wrapper.text()).toContain('Team meeting')
    expect(wrapper.text()).toContain('Quick review')

    // Check tags are displayed
    expect(wrapper.text()).toContain('#urgent')
    expect(wrapper.text()).toContain('#work')

    // Check priority indicators
    expect(wrapper.text()).toContain('!2')
  })

  it('should display focus ratings when available', async () => {
    // Set activity with focus rating
    mockActivities.value = [sampleActivities[0]] // Has focus rating 8
    mockGetActivityStats.value = { totalTime: 1800000, activityCount: 1, longestSession: 1800000 }
    mockFormatDuration = vi.fn(() => '30m')

    const wrapper = await mountSuspended(ActivityList)

    // Check for focus rating display
    expect(wrapper.text()).toContain('Focus:')
    // Should have 5 rating dots
    const focusDots = wrapper.findAll('.w-3.h-3.rounded-full')
    expect(focusDots.length).toBe(5)
  })

  it('should show edit modal when edit button is clicked', async () => {
    // Set activities data
    mockActivities.value = sampleActivities
    mockGetActivityStats.value = { totalTime: 7200000, activityCount: 3, longestSession: 3600000 }
    mockFormatDuration = vi.fn(() => '30m')

    const wrapper = await mountSuspended(ActivityList)

    // Find first edit button
    const editButton = wrapper.find('button[title="Edit activity"]')
    expect(editButton.exists()).toBe(true)

    await editButton.trigger('click')

    // Should show edit modal
    expect(wrapper.text()).toContain('Edit Activity')
  })

  it('should show delete confirmation when delete button is clicked', async () => {
    // Set activities data
    mockActivities.value = sampleActivities
    mockDeleteActivity = vi.fn()
    mockGetActivityStats.value = { totalTime: 7200000, activityCount: 3, longestSession: 3600000 }
    mockFormatDuration = vi.fn(() => '30m')

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = await mountSuspended(ActivityList)

    // Find first delete button
    const deleteButton = wrapper.find('button[title="Delete activity"]')
    expect(deleteButton.exists()).toBe(true)

    await deleteButton.trigger('click')

    // Should call confirm and deleteActivity
    expect(confirmSpy).toHaveBeenCalled()
    expect(mockDeleteActivity).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('should display activity statistics when activities exist', async () => {
    // Set activities and stats data
    mockActivities.value = sampleActivities
    mockGetActivityStats.value = {
      totalTime: 7200000, // 2 hours
      activityCount: 3,
      longestSession: 3600000, // 1 hour
    }
    mockFormatDuration = vi.fn(() => '2h')

    const wrapper = await mountSuspended(ActivityList)

    // Should show stats section
    expect(wrapper.text()).toContain('Total Time')
    expect(wrapper.text()).toContain('Sessions')
    expect(wrapper.text()).toContain('Longest')
  })
})
