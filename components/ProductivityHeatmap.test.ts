import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import ProductivityHeatmap from './ProductivityHeatmap.vue'
import type { Activity } from '~/server/database/schema'

// Mock the useActivities composable
const mockGetHeatmapData = vi.fn()
const mockActivities = ref<Activity[]>([])

mockNuxtImport('useActivities', () => {
  return () => ({
    activities: mockActivities,
    getHeatmapData: mockGetHeatmapData,
    formatDuration: (ms: number) => `${Math.round(ms / 60000)}m`
  })
})

describe('ProductivityHeatmap Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActivities.value = []
  })

  describe('Initial Render', () => {
    it('should render component title', async () => {
      const wrapper = await mountSuspended(ProductivityHeatmap)
      expect(wrapper.find('[data-testid="heatmap-title"]').text()).toBe('Productivity Heatmap')
    })

    it('should show empty state when no data available', async () => {
      mockGetHeatmapData.mockResolvedValue([])
      const wrapper = await mountSuspended(ProductivityHeatmap)
      
      expect(wrapper.find('[data-testid="heatmap-empty-state"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="heatmap-empty-state"]').text()).toContain('No activity data yet')
    })

    it('should display heatmap grid when data is available', async () => {
      const mockHeatmapData = [
        { date: '2024-01-01', count: 5, totalTime: 18000000, productivityScore: 0.8 },
        { date: '2024-01-02', count: 3, totalTime: 10800000, productivityScore: 0.6 }
      ]
      mockGetHeatmapData.mockResolvedValue(mockHeatmapData)
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="heatmap-grid"]').exists()).toBe(true)
      expect(wrapper.findAll('[data-testid^="heatmap-day-"]')).toHaveLength(365)
    })
  })

  describe('365-Day Grid', () => {
    it('should generate 365 days starting from one year ago', async () => {
      const mockHeatmapData = [
        { date: '2024-01-01', count: 1, totalTime: 3600000, productivityScore: 0.3 }
      ]
      mockGetHeatmapData.mockResolvedValue(mockHeatmapData)
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      await wrapper.vm.$nextTick()
      
      const dayElements = wrapper.findAll('[data-testid^="heatmap-day-"]')
      expect(dayElements).toHaveLength(365)
      
      // Verify first day is approximately one year ago
      const firstDay = dayElements[0]
      const dateAttr = firstDay.attributes('data-date')
      const firstDate = new Date(dateAttr!)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      expect(Math.abs(firstDate.getTime() - oneYearAgo.getTime())).toBeLessThan(7 * 24 * 60 * 60 * 1000) // Within a week
    })

    it('should arrange days in weeks (7 columns)', async () => {
      const wrapper = await mountSuspended(ProductivityHeatmap)
      const gridContainer = wrapper.find('[data-testid="heatmap-grid"]')
      
      expect(gridContainer.classes()).toContain('grid-cols-[repeat(53,_minmax(0,_1fr))]')
    })

    it('should apply correct intensity classes based on productivity score', async () => {
      const mockHeatmapData = [
        { date: '2024-01-01', count: 1, totalTime: 1800000, productivityScore: 0.2 }, // Low
        { date: '2024-01-02', count: 3, totalTime: 7200000, productivityScore: 0.5 }, // Medium  
        { date: '2024-01-03', count: 6, totalTime: 14400000, productivityScore: 0.8 }, // High - exactly 0.8 to trigger opacity-80
        { date: '2024-01-04', count: 8, totalTime: 21600000, productivityScore: 1.0 }  // Max
      ]
      mockGetHeatmapData.mockResolvedValue(mockHeatmapData)
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      await wrapper.vm.$nextTick()
      
      // Check intensity classes are applied correctly
      const lowDay = wrapper.find('[data-testid="heatmap-day-2024-01-01"]')
      const mediumDay = wrapper.find('[data-testid="heatmap-day-2024-01-02"]')
      const highDay = wrapper.find('[data-testid="heatmap-day-2024-01-03"]')
      const maxDay = wrapper.find('[data-testid="heatmap-day-2024-01-04"]')
      
      expect(lowDay.classes()).toContain('opacity-30')
      expect(mediumDay.classes()).toContain('opacity-60') 
      expect(highDay.classes()).toContain('opacity-80')
      expect(maxDay.classes()).toContain('opacity-100')
    })
  })

  describe('Day Interactions', () => {
    it('should show tooltip on hover with day details', async () => {
      const mockHeatmapData = [
        { date: '2024-01-01', count: 4, totalTime: 14400000, productivityScore: 0.7 }
      ]
      mockGetHeatmapData.mockResolvedValue(mockHeatmapData)
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      await wrapper.vm.$nextTick()
      
      const dayElement = wrapper.find('[data-testid="heatmap-day-2024-01-01"]')
      await dayElement.trigger('mouseenter')
      
      const tooltip = wrapper.find('[data-testid="heatmap-tooltip"]')
      expect(tooltip.exists()).toBe(true)
      expect(tooltip.text()).toContain('Jan 1, 2024')
      expect(tooltip.text()).toContain('4 activities')
      expect(tooltip.text()).toContain('240m') // 14400000ms = 240min
    })

    it('should hide tooltip on mouse leave', async () => {
      const mockHeatmapData = [
        { date: '2024-01-01', count: 2, totalTime: 7200000, productivityScore: 0.5 }
      ]
      mockGetHeatmapData.mockResolvedValue(mockHeatmapData)
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      await wrapper.vm.$nextTick()
      
      const dayElement = wrapper.find('[data-testid="heatmap-day-2024-01-01"]')
      await dayElement.trigger('mouseenter')
      await dayElement.trigger('mouseleave')
      
      const tooltip = wrapper.find('[data-testid="heatmap-tooltip"]')
      expect(tooltip.exists()).toBe(false)
    })

    it('should emit day-selected event when day is clicked', async () => {
      const mockHeatmapData = [
        { date: '2024-01-01', count: 3, totalTime: 10800000, productivityScore: 0.6 }
      ]
      mockGetHeatmapData.mockResolvedValue(mockHeatmapData)
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      await wrapper.vm.$nextTick()
      
      const dayElement = wrapper.find('[data-testid="heatmap-day-2024-01-01"]')
      await dayElement.trigger('click')
      
      expect(wrapper.emitted('day-selected')).toBeTruthy()
      expect(wrapper.emitted('day-selected')![0]).toEqual([{
        date: '2024-01-01',
        count: 3,
        totalTime: 10800000,
        productivityScore: 0.6
      }])
    })
  })

  describe('Legend', () => {
    it('should display intensity legend', async () => {
      const wrapper = await mountSuspended(ProductivityHeatmap)
      
      expect(wrapper.find('[data-testid="heatmap-legend"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="heatmap-legend"]').text()).toContain('Less')
      expect(wrapper.find('[data-testid="heatmap-legend"]').text()).toContain('More')
    })

    it('should show legend squares with different intensities', async () => {
      const wrapper = await mountSuspended(ProductivityHeatmap)
      
      const legendSquares = wrapper.findAll('[data-testid^="legend-intensity-"]')
      expect(legendSquares).toHaveLength(5) // 0, 25%, 50%, 75%, 100%
      
      expect(legendSquares[0].classes()).toContain('opacity-0')
      expect(legendSquares[1].classes()).toContain('opacity-25')
      expect(legendSquares[4].classes()).toContain('opacity-100')
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should apply responsive grid sizing', async () => {
      const wrapper = await mountSuspended(ProductivityHeatmap)
      const gridContainer = wrapper.find('[data-testid="heatmap-grid"]')
      
      // Should use responsive gap and sizing classes
      expect(gridContainer.classes()).toContain('gap-1')
      expect(gridContainer.classes()).toContain('md:gap-2')
    })

    it('should have touch-friendly day squares on mobile', async () => {
      const mockHeatmapData = [
        { date: '2024-01-01', count: 1, totalTime: 3600000, productivityScore: 0.3 }
      ]
      mockGetHeatmapData.mockResolvedValue(mockHeatmapData)
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      await wrapper.vm.$nextTick()
      
      const dayElement = wrapper.find('[data-testid="heatmap-day-2024-01-01"]')
      expect(dayElement.classes()).toContain('w-3')
      expect(dayElement.classes()).toContain('h-3')
      expect(dayElement.classes()).toContain('md:w-4')
      expect(dayElement.classes()).toContain('md:h-4')
    })
  })

  describe('Data Loading', () => {
    it('should call getHeatmapData on mount', async () => {
      await mountSuspended(ProductivityHeatmap)
      expect(mockGetHeatmapData).toHaveBeenCalledTimes(1)
    })

    it('should handle loading state', async () => {
      // Mock loading state in the composable
      const mockLoading = ref(true)
      
      mockNuxtImport('useActivities', () => {
        return () => ({
          getHeatmapData: vi.fn().mockResolvedValue([]),
          formatDuration: (ms: number) => `${Math.round(ms / 60000)}m`,
          loading: mockLoading
        })
      })
      
      const wrapper = await mountSuspended(ProductivityHeatmap)
      
      expect(wrapper.find('[data-testid="heatmap-loading"]').exists()).toBe(true)
      
      // Simulate loading completion
      mockLoading.value = false
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="heatmap-loading"]').exists()).toBe(false)
    })
  })
})