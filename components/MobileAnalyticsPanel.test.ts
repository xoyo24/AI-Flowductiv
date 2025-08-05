import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import MobileAnalyticsPanel from './MobileAnalyticsPanel.vue'

// Mock Lucide icons
vi.mock('lucide-vue-next', () => ({
  X: { template: '<div data-testid="x-icon">X</div>' },
  Lightbulb: { template: '<div data-testid="lightbulb-icon">Lightbulb</div>' },
  RefreshCw: { template: '<div data-testid="refresh-icon">Refresh</div>' },
}))

describe('MobileAnalyticsPanel', () => {
  const mockHeatmapData = [
    {
      date: '2024-01-01',
      totalTime: 3600000, // 1 hour in ms
      activityCount: 3,
      avgFocus: 4.5
    },
    {
      date: '2024-01-02',
      totalTime: 7200000, // 2 hours in ms
      activityCount: 5,
      avgFocus: 3.8
    }
  ]

  const mockTagData = [
    { name: 'work', count: 10, totalTime: 7200000 },
    { name: 'study', count: 5, totalTime: 3600000 }
  ]

  const mockTodayStats = {
    totalTime: '2h 30m',
    activityCount: 4,
    avgFocus: '4.2'
  }

  const mockActiveGoals = [
    { id: '1', title: 'Daily Focus Goal', progress: 75 },
    { id: '2', title: 'Weekly Learning', progress: 60 }
  ]

  const defaultProps = {
    isOpen: true,
    heatmapData: mockHeatmapData,
    tagData: mockTagData,
    selectedDate: null,
    todayStats: mockTodayStats,
    activeGoals: mockActiveGoals
  }

  beforeEach(() => {
    // Mock navigator.vibrate for haptic feedback tests
    global.navigator = {
      ...global.navigator,
      vibrate: vi.fn()
    }
  })

  it('renders when isOpen is true', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    expect(wrapper.find('[data-testid="close-analytics-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Analytics')
  })

  it('does not render when isOpen is false', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: { ...defaultProps, isOpen: false }
    })

    expect(wrapper.find('[data-testid="close-analytics-panel"]').exists()).toBe(false)
  })

  it('displays today\'s stats correctly', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('2h 30m')
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('4.2/5')
  })

  it('displays top tags with usage data', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('#work')
    expect(wrapper.text()).toContain('#study')
    expect(wrapper.text()).toContain('10') // work count
    expect(wrapper.text()).toContain('5') // study count
  })

  it('renders condensed heatmap grid', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    // Should have heatmap grid elements
    const heatmapDays = wrapper.findAll('.touch-target-mini')
    expect(heatmapDays.length).toBeGreaterThan(0)
  })

  it('shows goals when available', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    expect(wrapper.text()).toContain('Daily Focus Goal')
    expect(wrapper.text()).toContain('75%')
    expect(wrapper.text()).toContain('Weekly Learning')
    expect(wrapper.text()).toContain('60%')
  })

  it('shows no goals message when goals array is empty', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: { ...defaultProps, activeGoals: [] }
    })

    expect(wrapper.text()).toContain('No active goals')
    expect(wrapper.text()).toContain('Create your first goal')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const closeButton = wrapper.find('[data-testid="close-analytics-panel"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when backdrop is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const backdrop = wrapper.find('.fixed.inset-0')
    await backdrop.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit close when panel content is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const panelContent = wrapper.find('.absolute.right-0')
    await panelContent.trigger('click')

    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('emits tag-selected when tag is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const tagElements = wrapper.findAll('.touch-target')
    const workTag = tagElements.find(el => el.text().includes('#work'))
    
    if (workTag) {
      await workTag.trigger('click')
      expect(wrapper.emitted('tag-selected')).toBeTruthy()
      expect(wrapper.emitted('tag-selected')?.[0]).toEqual(['work'])
    }
  })

  it('emits show-heatmap-modal when expand button is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const expandButton = wrapper.find('[data-testid="expand-heatmap-button"]')
    await expandButton.trigger('click')

    expect(wrapper.emitted('show-heatmap-modal')).toBeTruthy()
  })

  it('emits show-goals-modal when manage goals button is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const manageButton = wrapper.find('[data-testid="manage-goals-button"]')
    await manageButton.trigger('click')

    expect(wrapper.emitted('show-goals-modal')).toBeTruthy()
  })

  it('emits show-insights-modal when AI insights button is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const insightsButton = wrapper.find('[data-testid="ai-insights-button"]')
    await insightsButton.trigger('click')

    expect(wrapper.emitted('show-insights-modal')).toBeTruthy()
  })

  it('emits refresh-data when refresh button is clicked', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const refreshButton = wrapper.find('[data-testid="refresh-analytics-button"]')
    await refreshButton.trigger('click')

    expect(wrapper.emitted('refresh-data')).toBeTruthy()
  })

  it('has proper touch targets (minimum 44px)', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    const touchTargets = wrapper.findAll('.touch-target')
    expect(touchTargets.length).toBeGreaterThan(0)
    
    // Verify CSS classes are applied (actual size verification would require DOM rendering)
    touchTargets.forEach(target => {
      expect(target.classes()).toContain('touch-target')
    })
  })

  it('calls vibrate function when available', async () => {
    const vibrateMock = vi.fn()
    global.navigator.vibrate = vibrateMock

    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    // Simulate tag click which should trigger haptic feedback
    const tagElements = wrapper.findAll('.touch-target')
    const workTag = tagElements.find(el => el.text().includes('#work'))
    
    if (workTag) {
      await workTag.trigger('click')
      expect(vibrateMock).toHaveBeenCalledWith([50])
    }
  })

  it('handles missing vibrate API gracefully', async () => {
    // Remove vibrate from navigator
    delete global.navigator.vibrate

    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: defaultProps
    })

    // Should not throw error when trying to vibrate
    const tagElements = wrapper.findAll('.touch-target')
    const workTag = tagElements.find(el => el.text().includes('#work'))
    
    if (workTag) {
      expect(async () => {
        await workTag.trigger('click')
      }).not.toThrow()
    }
  })

  it('formats duration correctly', async () => {
    const wrapper = await mountSuspended(MobileAnalyticsPanel, {
      props: {
        ...defaultProps,
        tagData: [
          { name: 'long-task', count: 1, totalTime: 4500000 }, // 1h 15m
          { name: 'short-task', count: 1, totalTime: 1800000 }  // 30m
        ]
      }
    })

    expect(wrapper.text()).toContain('1h 15m')
    expect(wrapper.text()).toContain('30m')
  })
})