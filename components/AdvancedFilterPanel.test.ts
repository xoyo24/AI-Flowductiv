import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import AdvancedFilterPanel from './AdvancedFilterPanel.vue'

// Mock the useAdvancedFilters composable
const mockHasAdvancedFilters = ref(false)
const mockAdvancedFilterCount = ref(0)
const mockTogglePriorityFilter = vi.fn()
const mockToggleFocusRatingFilter = vi.fn()
const mockSetDurationRangeFilter = vi.fn()
const mockClearDurationRangeFilter = vi.fn()
const mockClearAllAdvancedFilters = vi.fn()
const mockGetCurrentFilters = vi.fn(() => ({}))
const mockApplyFilterPreset = vi.fn()

mockNuxtImport('useAdvancedFilters', () => {
  return () => ({
    hasAdvancedFilters: mockHasAdvancedFilters,
    advancedFilterCount: mockAdvancedFilterCount,
    togglePriorityFilter: mockTogglePriorityFilter,
    toggleFocusRatingFilter: mockToggleFocusRatingFilter,
    setDurationRangeFilter: mockSetDurationRangeFilter,
    clearDurationRangeFilter: mockClearDurationRangeFilter,
    clearAllAdvancedFilters: mockClearAllAdvancedFilters,
    getCurrentFilters: mockGetCurrentFilters,
    applyFilterPreset: mockApplyFilterPreset
  })
})

describe('AdvancedFilterPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHasAdvancedFilters.value = false
    mockAdvancedFilterCount.value = 0
    mockGetCurrentFilters.mockReturnValue({})
  })

  it('should render advanced filter panel', async () => {
    const wrapper = await mountSuspended(AdvancedFilterPanel)
    
    expect(wrapper.find('[data-testid="advanced-filter-panel"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Advanced Filters')
  })

  describe('Filter Count Badge', () => {
    it('should show filter count badge when filters are active', async () => {
      mockAdvancedFilterCount.value = 3
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      const badge = wrapper.find('[data-testid="filter-count-badge"]')
      expect(badge.exists()).toBe(true)
      expect(badge.text()).toBe('3')
    })

    it('should hide filter count badge when no filters are active', async () => {
      mockAdvancedFilterCount.value = 0
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      expect(wrapper.find('[data-testid="filter-count-badge"]').exists()).toBe(false)
    })
  })

  describe('Clear All Button', () => {
    it('should show clear all button when advanced filters are active', async () => {
      mockHasAdvancedFilters.value = true
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      expect(wrapper.find('[data-testid="clear-advanced-filters"]').exists()).toBe(true)
    })

    it('should hide clear all button when no advanced filters are active', async () => {
      mockHasAdvancedFilters.value = false
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      expect(wrapper.find('[data-testid="clear-advanced-filters"]').exists()).toBe(false)
    })

    it('should call clearAllAdvancedFilters when clicked', async () => {
      mockHasAdvancedFilters.value = true
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      await wrapper.find('[data-testid="clear-advanced-filters"]').trigger('click')
      expect(mockClearAllAdvancedFilters).toHaveBeenCalled()
    })
  })

  describe('Filter Presets', () => {
    it('should render all filter presets', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      expect(wrapper.find('[data-testid="preset-high-performance"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="preset-deep-work"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="preset-quick-tasks"]').exists()).toBe(true)
    })

    it('should apply filter preset when clicked', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      await wrapper.find('[data-testid="preset-high-performance"]').trigger('click')
      expect(mockApplyFilterPreset).toHaveBeenCalledWith('high-performance')
    })
  })

  describe('Priority Filter', () => {
    it('should render priority buttons', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      for (let i = 1; i <= 5; i++) {
        expect(wrapper.find(`[data-testid="priority-${i}"]`).exists()).toBe(true)
      }
    })

    it('should highlight active priority filters', async () => {
      mockGetCurrentFilters.mockReturnValue({ priority: [1, 3] })
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      const priority1 = wrapper.find('[data-testid="priority-1"]')
      const priority2 = wrapper.find('[data-testid="priority-2"]')
      const priority3 = wrapper.find('[data-testid="priority-3"]')
      
      expect(priority1.classes()).toContain('bg-yellow-500/10')
      expect(priority2.classes()).not.toContain('bg-yellow-500/10')
      expect(priority3.classes()).toContain('bg-yellow-500/10')
    })

    it('should toggle priority filter when clicked', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      await wrapper.find('[data-testid="priority-2"]').trigger('click')
      expect(mockTogglePriorityFilter).toHaveBeenCalledWith(2)
    })
  })

  describe('Focus Rating Filter', () => {
    it('should render focus rating buttons', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      for (let i = 1; i <= 5; i++) {
        expect(wrapper.find(`[data-testid="focus-${i}"]`).exists()).toBe(true)
      }
    })

    it('should highlight active focus rating filters', async () => {
      mockGetCurrentFilters.mockReturnValue({ focusRating: [4, 5] })
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      const focus3 = wrapper.find('[data-testid="focus-3"]')
      const focus4 = wrapper.find('[data-testid="focus-4"]')
      const focus5 = wrapper.find('[data-testid="focus-5"]')
      
      expect(focus3.classes()).not.toContain('bg-green-500/10')
      expect(focus4.classes()).toContain('bg-green-500/10')
      expect(focus5.classes()).toContain('bg-green-500/10')
    })

    it('should toggle focus rating filter when clicked', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      await wrapper.find('[data-testid="focus-4"]').trigger('click')
      expect(mockToggleFocusRatingFilter).toHaveBeenCalledWith(4)
    })
  })


  describe('Duration Range Filter', () => {
    it('should render quick duration buttons', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      expect(wrapper.find('[data-testid="duration-short"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="duration-medium"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="duration-long"]').exists()).toBe(true)
    })

    it('should apply duration range when quick button clicked', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      await wrapper.find('[data-testid="duration-short"]').trigger('click')
      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(undefined, 900000) // ≤ 15 min
    })

    it('should render custom duration inputs', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      expect(wrapper.find('[data-testid="custom-min-duration"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="custom-max-duration"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="apply-custom-duration"]').exists()).toBe(true)
    })

    it('should apply custom duration when valid inputs provided', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      const minInput = wrapper.find('[data-testid="custom-min-duration"]')
      const maxInput = wrapper.find('[data-testid="custom-max-duration"]')
      const applyButton = wrapper.find('[data-testid="apply-custom-duration"]')
      
      await minInput.setValue('30')
      await maxInput.setValue('60')
      await applyButton.trigger('click')
      
      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(1800000, 3600000) // 30-60 min in ms
    })

    it('should disable apply button when inputs are invalid', async () => {
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      const minInput = wrapper.find('[data-testid="custom-min-duration"]')
      const maxInput = wrapper.find('[data-testid="custom-max-duration"]')
      const applyButton = wrapper.find('[data-testid="apply-custom-duration"]')
      
      // Min > Max should disable button
      await minInput.setValue('60')
      await maxInput.setValue('30')
      await wrapper.vm.$nextTick()
      
      expect(applyButton.attributes('disabled')).toBeDefined()
    })

    it('should show clear duration filter button when duration filters are active', async () => {
      mockGetCurrentFilters.mockReturnValue({ minDuration: 1800000 })
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      expect(wrapper.find('[data-testid="clear-duration-filter"]').exists()).toBe(true)
    })

    it('should clear duration filters when clear button clicked', async () => {
      mockGetCurrentFilters.mockReturnValue({ minDuration: 1800000 })
      const wrapper = await mountSuspended(AdvancedFilterPanel)
      
      await wrapper.find('[data-testid="clear-duration-filter"]').trigger('click')
      expect(mockClearDurationRangeFilter).toHaveBeenCalled()
    })
  })
})