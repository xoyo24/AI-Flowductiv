import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import FilterBar from './FilterBar.vue'

// Mock the useAdvancedFilters composable  
const mockHasAdvancedFilters = ref(false)
const mockAdvancedFilterCount = ref(0)
const mockGetCurrentFilters = vi.fn(() => ({}))
const mockTogglePriorityFilter = vi.fn()
const mockToggleFocusRatingFilter = vi.fn()
const mockToggleEnergyLevelFilter = vi.fn()
const mockSetDurationRangeFilter = vi.fn()
const mockClearDurationRangeFilter = vi.fn()
const mockClearAllAdvancedFilters = vi.fn()
const mockApplyFilterPreset = vi.fn()
const mockAddTagFilter = vi.fn()
const mockRemoveTagFilter = vi.fn()
const mockSetDateRangeFilter = vi.fn()
const mockClearDateRangeFilter = vi.fn()
const mockClearAllFilters = vi.fn()

mockNuxtImport('useAdvancedFilters', () => {
  return () => ({
    hasAdvancedFilters: mockHasAdvancedFilters,
    advancedFilterCount: mockAdvancedFilterCount,
    getCurrentFilters: mockGetCurrentFilters,
    togglePriorityFilter: mockTogglePriorityFilter,
    toggleFocusRatingFilter: mockToggleFocusRatingFilter,
    toggleEnergyLevelFilter: mockToggleEnergyLevelFilter,
    setDurationRangeFilter: mockSetDurationRangeFilter,
    clearDurationRangeFilter: mockClearDurationRangeFilter,
    clearAllAdvancedFilters: mockClearAllAdvancedFilters,
    applyFilterPreset: mockApplyFilterPreset,
    addTagFilter: mockAddTagFilter,
    removeTagFilter: mockRemoveTagFilter,
    setDateRangeFilter: mockSetDateRangeFilter,
    clearDateRangeFilter: mockClearDateRangeFilter,
    clearAllFilters: mockClearAllFilters
  })
})

// Mock the useActivities composable
mockNuxtImport('useActivities', () => {
  return () => ({
    formatDuration: (ms: number) => `${Math.round(ms / 60000)}m`
  })
})

describe('FilterBar Component Integration', () => {
  const mockActiveFilters = {
    tags: ['focus'],
    dateRange: {
      start: new Date('2024-07-20'),
      end: new Date('2024-07-21')
    }
  }

  const mockFilterMetadata = {
    totalActivities: 10,
    filteredCount: 5,
    hasActiveFilters: true,
    hiddenCount: 5
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockHasAdvancedFilters.value = false
    mockAdvancedFilterCount.value = 0
  })

  it('should render filter bar when filters are active', async () => {
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: mockActiveFilters,
        filterMetadata: mockFilterMetadata
      }
    })
    
    expect(wrapper.find('[data-testid="filter-bar"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Showing 5 of 10')
    expect(wrapper.text()).toContain('(5 hidden)')
  })

  it('should show "More filters" button only when basic filters are active', async () => {
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: mockActiveFilters,
        filterMetadata: mockFilterMetadata
      }
    })
    
    // Should show "More filters" button since we have basic filters (tag + date)
    expect(wrapper.find('[data-testid="toggle-advanced-filters"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('More filters')
  })

  it('should not show "More filters" button when only advanced filters are active', async () => {
    const filtersWithOnlyAdvanced = {
      priority: [1, 2]
    }
    
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: filtersWithOnlyAdvanced,
        filterMetadata: mockFilterMetadata
      }
    })
    
    // Should not show "More filters" button since no basic filters (tags/date) are active
    expect(wrapper.find('[data-testid="toggle-advanced-filters"]').exists()).toBe(false)
  })

  it('should show advanced filter count when advanced filters are active', async () => {
    mockHasAdvancedFilters.value = true
    mockAdvancedFilterCount.value = 3
    
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: mockActiveFilters,
        filterMetadata: mockFilterMetadata
      }
    })
    
    expect(wrapper.text()).toContain('Advanced (3)')
  })

  it('should expand advanced filters when toggle button is clicked', async () => {
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: mockActiveFilters,
        filterMetadata: mockFilterMetadata
      }
    })
    
    const toggleButton = wrapper.find('[data-testid="toggle-advanced-filters"]')
    expect(toggleButton.exists()).toBe(true)
    
    // Initially, advanced filters should not be visible
    expect(wrapper.find('[data-testid="advanced-filters-expansion"]').exists()).toBe(false)
    
    // Click to expand
    await toggleButton.trigger('click')
    
    // Now advanced filters should be visible
    expect(wrapper.find('[data-testid="advanced-filters-expansion"]').exists()).toBe(true)
  })

  it('should display filter chips correctly', async () => {
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: mockActiveFilters,
        filterMetadata: mockFilterMetadata
      }
    })
    
    // Check tag filter chip
    const tagChip = wrapper.find('[data-testid="filter-chip-tag"]')
    expect(tagChip.exists()).toBe(true)
    expect(tagChip.text()).toContain('focus')
    
    // Check date filter chip
    const dateChip = wrapper.find('[data-testid="filter-chip-date"]')
    expect(dateChip.exists()).toBe(true)
    expect(dateChip.text()).toContain('Jul 20 - Jul 21')
  })

  it('should emit remove events when filter chips are clicked', async () => {
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: mockActiveFilters,
        filterMetadata: mockFilterMetadata
      }
    })
    
    // Click remove button on tag chip
    const tagRemoveButton = wrapper.find('[data-testid="filter-chip-tag"] button')
    await tagRemoveButton.trigger('click')
    
    expect(wrapper.emitted('remove-tag-filter')).toBeTruthy()
    expect(wrapper.emitted('remove-tag-filter')?.[0]).toEqual(['focus'])
  })

  it('should close advanced filters when clear all is clicked', async () => {
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: mockActiveFilters,
        filterMetadata: mockFilterMetadata
      }
    })
    
    // Expand advanced filters first
    await wrapper.find('[data-testid="toggle-advanced-filters"]').trigger('click')
    expect(wrapper.find('[data-testid="advanced-filters-expansion"]').exists()).toBe(true)
    
    // Click clear all
    await wrapper.find('[data-testid="clear-all-filters"]').trigger('click')
    
    // Advanced filters should be closed
    expect(wrapper.find('[data-testid="advanced-filters-expansion"]').exists()).toBe(false)
    expect(wrapper.emitted('clear-all-filters')).toBeTruthy()
  })

  it('should not render when no filters are active', async () => {
    const wrapper = await mountSuspended(FilterBar, {
      props: {
        activeFilters: {},
        filterMetadata: {
          totalActivities: 10,
          filteredCount: 10,
          hasActiveFilters: false,
          hiddenCount: 0
        }
      }
    })
    
    expect(wrapper.find('[data-testid="filter-bar"]').exists()).toBe(false)
  })
})