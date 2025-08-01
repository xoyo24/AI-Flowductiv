import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useAdvancedFilters } from './useAdvancedFilters'
import type { Activity } from '~/server/database/schema'

// Mock useActivities composable
const mockActivities = ref<Activity[]>([])
const mockActiveFilters = ref({})
const mockFilterCount = ref(0)
const mockAddTagFilter = vi.fn()
const mockRemoveTagFilter = vi.fn()
const mockSetDateRangeFilter = vi.fn()
const mockClearDateRangeFilter = vi.fn()
const mockClearAllFilters = vi.fn()

vi.mock('./useActivities', () => ({
  useActivities: () => ({
    activities: mockActivities,
    activeFilters: mockActiveFilters,
    filterCount: mockFilterCount,
    addTagFilter: mockAddTagFilter,
    removeTagFilter: mockRemoveTagFilter,
    setDateRangeFilter: mockSetDateRangeFilter,
    clearDateRangeFilter: mockClearDateRangeFilter,
    clearAllFilters: mockClearAllFilters
  })
}))

describe('useAdvancedFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockActivities.value = []
    mockActiveFilters.value = {}
    mockFilterCount.value = 0
  })

  describe('Priority Filtering', () => {
    it('should set priority filter with single value', () => {
      const { setPriorityFilter } = useAdvancedFilters()
      
      setPriorityFilter([1])
      
      expect(mockActiveFilters.value.priority).toEqual([1])
    })

    it('should set priority filter with multiple values', () => {
      const { setPriorityFilter } = useAdvancedFilters()
      
      setPriorityFilter([1, 2, 3])
      
      expect(mockActiveFilters.value.priority).toEqual([1, 2, 3])
    })

    it('should clear priority filter when empty array provided', () => {
      const { setPriorityFilter } = useAdvancedFilters()
      mockActiveFilters.value.priority = [1, 2]
      
      setPriorityFilter([])
      
      expect(mockActiveFilters.value.priority).toBeUndefined()
    })

    it('should toggle priority value correctly', () => {
      const { togglePriorityFilter } = useAdvancedFilters()
      mockActiveFilters.value.priority = [1, 2]
      
      // Remove existing priority
      togglePriorityFilter(1)
      expect(mockActiveFilters.value.priority).toEqual([2])
      
      // Add new priority
      togglePriorityFilter(3)
      expect(mockActiveFilters.value.priority).toEqual([2, 3])
    })
  })

  describe('Focus Rating Filtering', () => {
    it('should set focus rating filter with single value', () => {
      const { setFocusRatingFilter } = useAdvancedFilters()
      
      setFocusRatingFilter([5])
      
      expect(mockActiveFilters.value.focusRating).toEqual([5])
    })

    it('should set focus rating filter with multiple values', () => {
      const { setFocusRatingFilter } = useAdvancedFilters()
      
      setFocusRatingFilter([4, 5])
      
      expect(mockActiveFilters.value.focusRating).toEqual([4, 5])
    })

    it('should toggle focus rating value correctly', () => {
      const { toggleFocusRatingFilter } = useAdvancedFilters()
      mockActiveFilters.value.focusRating = [3, 4]
      
      // Remove existing rating
      toggleFocusRatingFilter(3)
      expect(mockActiveFilters.value.focusRating).toEqual([4])
      
      // Add new rating
      toggleFocusRatingFilter(5)
      expect(mockActiveFilters.value.focusRating).toEqual([4, 5])
    })
  })

  describe('Energy Level Filtering', () => {
    it('should set energy level filter with single value', () => {
      const { setEnergyLevelFilter } = useAdvancedFilters()
      
      setEnergyLevelFilter(['high'])
      
      expect(mockActiveFilters.value.energyLevel).toEqual(['high'])
    })

    it('should set energy level filter with multiple values', () => {
      const { setEnergyLevelFilter } = useAdvancedFilters()
      
      setEnergyLevelFilter(['low', 'medium', 'high'])
      
      expect(mockActiveFilters.value.energyLevel).toEqual(['low', 'medium', 'high'])
    })

    it('should toggle energy level value correctly', () => {
      const { toggleEnergyLevelFilter } = useAdvancedFilters()
      mockActiveFilters.value.energyLevel = ['low', 'medium']
      
      // Remove existing level
      toggleEnergyLevelFilter('low')
      expect(mockActiveFilters.value.energyLevel).toEqual(['medium'])
      
      // Add new level
      toggleEnergyLevelFilter('high')
      expect(mockActiveFilters.value.energyLevel).toEqual(['medium', 'high'])
    })
  })

  describe('Duration Range Filtering', () => {
    it('should set duration range filter', () => {
      const { setDurationRangeFilter } = useAdvancedFilters()
      
      setDurationRangeFilter(300000, 1800000) // 5 min to 30 min
      
      expect(mockActiveFilters.value.minDuration).toBe(300000)
      expect(mockActiveFilters.value.maxDuration).toBe(1800000)
    })

    it('should set minimum duration only', () => {
      const { setDurationRangeFilter } = useAdvancedFilters()
      
      setDurationRangeFilter(600000) // 10 min minimum
      
      expect(mockActiveFilters.value.minDuration).toBe(600000)
      expect(mockActiveFilters.value.maxDuration).toBeUndefined()
    })

    it('should clear duration range filter', () => {
      const { clearDurationRangeFilter } = useAdvancedFilters()
      mockActiveFilters.value.minDuration = 300000
      mockActiveFilters.value.maxDuration = 1800000
      
      clearDurationRangeFilter()
      
      expect(mockActiveFilters.value.minDuration).toBeUndefined()
      expect(mockActiveFilters.value.maxDuration).toBeUndefined()
    })
  })

  describe('Filter State Management', () => {
    it('should get current filter values', () => {
      const { getCurrentFilters } = useAdvancedFilters()
      mockActiveFilters.value = {
        priority: [1, 2],
        focusRating: [4, 5],
        energyLevel: ['high'],
        minDuration: 300000,
        maxDuration: 1800000
      }
      
      const filters = getCurrentFilters()
      
      expect(filters).toEqual({
        priority: [1, 2],
        focusRating: [4, 5],
        energyLevel: ['high'],
        minDuration: 300000,
        maxDuration: 1800000
      })
    })

    it('should check if any advanced filters are active', () => {
      const { hasAdvancedFilters } = useAdvancedFilters()
      
      // No filters
      mockActiveFilters.value = {}
      expect(hasAdvancedFilters.value).toBe(false)
      
      // Only tag filters (not advanced)
      mockActiveFilters.value = { tags: ['work'] }
      expect(hasAdvancedFilters.value).toBe(false)
      
      // With advanced filters
      mockActiveFilters.value = { priority: [1] }
      expect(hasAdvancedFilters.value).toBe(true)
    })

    it('should count active advanced filters', () => {
      const { advancedFilterCount } = useAdvancedFilters()
      
      mockActiveFilters.value = {
        priority: [1, 2],
        focusRating: [5],
        minDuration: 300000
      }
      
      expect(advancedFilterCount.value).toBe(3)
    })

    it('should clear all advanced filters', () => {
      const { clearAllAdvancedFilters } = useAdvancedFilters()
      mockActiveFilters.value = {
        tags: ['work'], // Should be preserved
        priority: [1, 2],
        focusRating: [5],
        energyLevel: ['high'],
        minDuration: 300000,
        maxDuration: 1800000
      }
      
      clearAllAdvancedFilters()
      
      expect(mockActiveFilters.value).toEqual({
        tags: ['work'] // Only tags should remain
      })
    })
  })

  describe('Filter Preset Management', () => {
    it('should apply high-performance preset', () => {
      const { applyFilterPreset } = useAdvancedFilters()
      
      applyFilterPreset('high-performance')
      
      expect(mockActiveFilters.value.focusRating).toEqual([4, 5])
      expect(mockActiveFilters.value.energyLevel).toEqual(['high'])
      expect(mockActiveFilters.value.minDuration).toBe(1800000) // 30 min
    })

    it('should apply deep-work preset', () => {
      const { applyFilterPreset } = useAdvancedFilters()
      
      applyFilterPreset('deep-work')
      
      expect(mockActiveFilters.value.focusRating).toEqual([5])
      expect(mockActiveFilters.value.minDuration).toBe(3600000) // 60 min
    })

    it('should apply quick-tasks preset', () => {
      const { applyFilterPreset } = useAdvancedFilters()
      
      applyFilterPreset('quick-tasks')
      
      expect(mockActiveFilters.value.maxDuration).toBe(900000) // 15 min
      expect(mockActiveFilters.value.priority).toEqual([1, 2])
    })

    it('should apply low-energy preset', () => {
      const { applyFilterPreset } = useAdvancedFilters()
      
      applyFilterPreset('low-energy')
      
      expect(mockActiveFilters.value.energyLevel).toEqual(['low'])
      expect(mockActiveFilters.value.maxDuration).toBe(1800000) // 30 min
    })
  })

  describe('Filter Validation', () => {
    it('should validate priority values', () => {
      const { setPriorityFilter } = useAdvancedFilters()
      
      // Valid priorities (1-5)
      expect(() => setPriorityFilter([1, 2, 3, 4, 5])).not.toThrow()
      
      // Invalid priorities should be filtered out
      setPriorityFilter([0, 1, 6, 2])
      expect(mockActiveFilters.value.priority).toEqual([1, 2])
    })

    it('should validate focus rating values', () => {
      const { setFocusRatingFilter } = useAdvancedFilters()
      
      // Valid ratings (1-5)
      expect(() => setFocusRatingFilter([1, 2, 3, 4, 5])).not.toThrow()
      
      // Invalid ratings should be filtered out
      setFocusRatingFilter([0, 3, 6, 4])
      expect(mockActiveFilters.value.focusRating).toEqual([3, 4])
    })

    it('should validate energy level values', () => {
      const { setEnergyLevelFilter } = useAdvancedFilters()
      
      // Valid energy levels
      expect(() => setEnergyLevelFilter(['low', 'medium', 'high'])).not.toThrow()
      
      // Invalid energy levels should be filtered out
      setEnergyLevelFilter(['low', 'invalid', 'high'])
      expect(mockActiveFilters.value.energyLevel).toEqual(['low', 'high'])
    })

    it('should validate duration values', () => {
      const { setDurationRangeFilter } = useAdvancedFilters()
      
      // Negative durations should be converted to 0
      setDurationRangeFilter(-100, 1000)
      expect(mockActiveFilters.value.minDuration).toBe(0)
      expect(mockActiveFilters.value.maxDuration).toBe(1000)
      
      // Max should be greater than min
      setDurationRangeFilter(2000, 1000)
      expect(mockActiveFilters.value.minDuration).toBe(1000)
      expect(mockActiveFilters.value.maxDuration).toBe(2000)
    })
  })
})