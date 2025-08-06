import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { Activity } from '~/server/database/schema'
import { useAdvancedFilters } from './useAdvancedFilters'

// Mock useActivities composable
const mockActivities = ref<Activity[]>([])
const mockActiveFilters = ref({})
const mockFilterCount = ref(0)
const mockAddTagFilter = vi.fn()
const mockRemoveTagFilter = vi.fn()
const mockSetDateRangeFilter = vi.fn()
const mockClearDateRangeFilter = vi.fn()
const mockClearAllFilters = vi.fn()
const mockSetPriorityFilter = vi.fn()
const mockSetFocusRatingFilter = vi.fn()
const mockSetDurationRangeFilter = vi.fn()
const mockClearDurationRangeFilter = vi.fn()

vi.mock('./useActivities', () => ({
  useActivities: () => ({
    activities: mockActivities,
    activeFilters: mockActiveFilters,
    filterCount: mockFilterCount,
    addTagFilter: mockAddTagFilter,
    removeTagFilter: mockRemoveTagFilter,
    setDateRangeFilter: mockSetDateRangeFilter,
    clearDateRangeFilter: mockClearDateRangeFilter,
    clearAllFilters: mockClearAllFilters,
    setPriorityFilter: mockSetPriorityFilter,
    setFocusRatingFilter: mockSetFocusRatingFilter,
    setDurationRangeFilter: mockSetDurationRangeFilter,
    clearDurationRangeFilter: mockClearDurationRangeFilter,
  }),
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

      expect(mockSetPriorityFilter).toHaveBeenCalledWith([1])
    })

    it('should set priority filter with multiple values', () => {
      const { setPriorityFilter } = useAdvancedFilters()

      setPriorityFilter([1, 2, 3])

      expect(mockSetPriorityFilter).toHaveBeenCalledWith([1, 2, 3])
    })

    it('should clear priority filter when empty array provided', () => {
      const { setPriorityFilter } = useAdvancedFilters()
      mockActiveFilters.value.priority = [1, 2]

      setPriorityFilter([])

      expect(mockSetPriorityFilter).toHaveBeenCalledWith([])
    })

    it('should toggle priority value correctly', () => {
      const { togglePriorityFilter } = useAdvancedFilters()

      // Mock state changes for toggles
      mockActiveFilters.value.priority = [1, 2]

      // Remove existing priority - simulate state change
      togglePriorityFilter(1)
      mockActiveFilters.value.priority = [2] // Update mock state
      expect(mockSetPriorityFilter).toHaveBeenCalledWith([2])

      // Add new priority - simulate state change
      togglePriorityFilter(3)
      expect(mockSetPriorityFilter).toHaveBeenLastCalledWith([2, 3])
    })
  })

  describe('Focus Rating Filtering', () => {
    it('should set focus rating filter with single value', () => {
      const { setFocusRatingFilter } = useAdvancedFilters()

      setFocusRatingFilter([5])

      expect(mockSetFocusRatingFilter).toHaveBeenCalledWith([5])
    })

    it('should set focus rating filter with multiple values', () => {
      const { setFocusRatingFilter } = useAdvancedFilters()

      setFocusRatingFilter([4, 5])

      expect(mockSetFocusRatingFilter).toHaveBeenCalledWith([4, 5])
    })

    it('should toggle focus rating value correctly', () => {
      const { toggleFocusRatingFilter } = useAdvancedFilters()

      // Mock state changes for toggles
      mockActiveFilters.value.focusRating = [3, 4]

      // Remove existing rating - simulate state change
      toggleFocusRatingFilter(3)
      mockActiveFilters.value.focusRating = [4] // Update mock state
      expect(mockSetFocusRatingFilter).toHaveBeenCalledWith([4])

      // Add new rating - simulate state change
      toggleFocusRatingFilter(5)
      expect(mockSetFocusRatingFilter).toHaveBeenLastCalledWith([4, 5])
    })
  })

  describe('Duration Range Filtering', () => {
    it('should set duration range filter', () => {
      const { setDurationRangeFilter } = useAdvancedFilters()

      setDurationRangeFilter(300000, 1800000) // 5 min to 30 min

      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(300000, 1800000)
    })

    it('should set minimum duration only', () => {
      const { setDurationRangeFilter } = useAdvancedFilters()

      setDurationRangeFilter(600000) // 10 min minimum

      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(600000, undefined)
    })

    it('should clear duration range filter', () => {
      const { clearDurationRangeFilter } = useAdvancedFilters()
      mockActiveFilters.value.minDuration = 300000
      mockActiveFilters.value.maxDuration = 1800000

      clearDurationRangeFilter()

      expect(mockClearDurationRangeFilter).toHaveBeenCalled()
    })
  })

  describe('Filter State Management', () => {
    it('should get current filter values', () => {
      const { getCurrentFilters } = useAdvancedFilters()
      mockActiveFilters.value = {
        priority: [1, 2],
        focusRating: [4, 5],
        minDuration: 300000,
        maxDuration: 1800000,
      }

      const filters = getCurrentFilters()

      expect(filters).toEqual({
        priority: [1, 2],
        focusRating: [4, 5],
        minDuration: 300000,
        maxDuration: 1800000,
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
        minDuration: 300000,
      }

      expect(advancedFilterCount.value).toBe(3)
    })

    it('should clear all advanced filters', () => {
      const { clearAllAdvancedFilters } = useAdvancedFilters()
      mockActiveFilters.value = {
        tags: ['work'], // Should be preserved
        priority: [1, 2],
        focusRating: [5],
        minDuration: 300000,
        maxDuration: 1800000,
      }

      clearAllAdvancedFilters()

      // Verify the correct functions were called to clear advanced filters
      expect(mockSetPriorityFilter).toHaveBeenCalledWith([])
      expect(mockSetFocusRatingFilter).toHaveBeenCalledWith([])
      expect(mockClearDurationRangeFilter).toHaveBeenCalled()
    })
  })

  describe('Filter Preset Management', () => {
    it('should apply high-performance preset', () => {
      const { applyFilterPreset } = useAdvancedFilters()

      applyFilterPreset('high-performance')

      expect(mockSetFocusRatingFilter).toHaveBeenCalledWith([4, 5])
      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(1800000) // 30 min
    })

    it('should apply deep-work preset', () => {
      const { applyFilterPreset } = useAdvancedFilters()

      applyFilterPreset('deep-work')

      expect(mockSetFocusRatingFilter).toHaveBeenCalledWith([5])
      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(3600000) // 60 min
    })

    it('should apply quick-tasks preset', () => {
      const { applyFilterPreset } = useAdvancedFilters()

      applyFilterPreset('quick-tasks')

      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(undefined, 900000) // 15 min
      expect(mockSetPriorityFilter).toHaveBeenCalledWith([1, 2])
    })
  })

  describe('Filter Validation', () => {
    it('should validate priority values', () => {
      const { setPriorityFilter } = useAdvancedFilters()

      // Valid priorities (1-5)
      expect(() => setPriorityFilter([1, 2, 3, 4, 5])).not.toThrow()

      // Invalid priorities should be filtered out
      setPriorityFilter([0, 1, 6, 2])
      expect(mockSetPriorityFilter).toHaveBeenCalledWith([1, 2])
    })

    it('should validate focus rating values', () => {
      const { setFocusRatingFilter } = useAdvancedFilters()

      // Valid ratings (1-5)
      expect(() => setFocusRatingFilter([1, 2, 3, 4, 5])).not.toThrow()

      // Invalid ratings should be filtered out
      setFocusRatingFilter([0, 3, 6, 4])
      expect(mockSetFocusRatingFilter).toHaveBeenCalledWith([3, 4])
    })

    it('should validate duration values', () => {
      const { setDurationRangeFilter } = useAdvancedFilters()

      // Negative durations should be converted to 0
      setDurationRangeFilter(-100, 1000)
      expect(mockSetDurationRangeFilter).toHaveBeenCalledWith(0, 1000)

      // Max should be greater than min
      setDurationRangeFilter(2000, 1000)
      expect(mockSetDurationRangeFilter).toHaveBeenLastCalledWith(1000, 2000)
    })
  })

  describe('Filter Combinations', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      vi.stubGlobal('localStorage', {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      })
      vi.stubGlobal('process', { client: true })
    })

    it('should save current filter combination', () => {
      const { saveCurrentFilterCombination, setPriorityFilter, setFocusRatingFilter } =
        useAdvancedFilters()

      // Set some filters
      setPriorityFilter([1, 2])
      setFocusRatingFilter([4, 5])

      // Save the combination
      const combinationId = saveCurrentFilterCombination('My Custom Filters')

      expect(combinationId).toBeDefined()
      expect(combinationId).toMatch(/^filter-\d+-[a-z0-9]+$/)
    })

    it('should apply saved filter combination', () => {
      const {
        saveCurrentFilterCombination,
        applySavedFilterCombination,
        setPriorityFilter,
        setFocusRatingFilter,
      } = useAdvancedFilters()

      // Set and save filters
      setPriorityFilter([1, 2])
      setFocusRatingFilter([4, 5])
      const combinationId = saveCurrentFilterCombination('Test Combination')

      // Clear current filters
      mockActiveFilters.value = {}

      // Apply saved combination
      const success = applySavedFilterCombination(combinationId)

      expect(success).toBe(true)
      expect(mockClearAllFilters).toHaveBeenCalled()
    })

    it('should return false when applying non-existent combination', () => {
      const { applySavedFilterCombination } = useAdvancedFilters()

      const success = applySavedFilterCombination('non-existent-id')

      expect(success).toBe(false)
    })

    it('should delete saved filter combination', () => {
      const {
        saveCurrentFilterCombination,
        deleteSavedFilterCombination,
        savedCombinations,
        setPriorityFilter,
      } = useAdvancedFilters()

      // Save a combination
      setPriorityFilter([1])
      const combinationId = saveCurrentFilterCombination('To Delete')

      expect(savedCombinations.value).toHaveLength(1)

      // Delete the combination
      const success = deleteSavedFilterCombination(combinationId)

      expect(success).toBe(true)
      expect(savedCombinations.value).toHaveLength(0)
    })

    it('should rename saved filter combination', () => {
      const {
        saveCurrentFilterCombination,
        renameSavedFilterCombination,
        savedCombinations,
        setPriorityFilter,
      } = useAdvancedFilters()

      // Save a combination
      setPriorityFilter([1])
      const combinationId = saveCurrentFilterCombination('Original Name')

      // Rename the combination
      const success = renameSavedFilterCombination(combinationId, 'New Name')

      expect(success).toBe(true)
      expect(savedCombinations.value[0].name).toBe('New Name')
    })

    it('should return false when renaming non-existent combination', () => {
      const { renameSavedFilterCombination } = useAdvancedFilters()

      const success = renameSavedFilterCombination('non-existent-id', 'New Name')

      expect(success).toBe(false)
    })

    it('should detect when current filters differ from saved combination', () => {
      const {
        saveCurrentFilterCombination,
        hasCurrentFiltersChanged,
        setPriorityFilter,
        setFocusRatingFilter,
      } = useAdvancedFilters()

      // Set initial filters and update mock state
      setPriorityFilter([1])
      mockActiveFilters.value.priority = [1]
      const combinationId = saveCurrentFilterCombination('Test')

      // Initially should not be changed
      expect(hasCurrentFiltersChanged(combinationId)).toBe(false)

      // Change filters and update mock state
      setFocusRatingFilter([5])
      mockActiveFilters.value.focusRating = [5]

      // Now should be changed
      expect(hasCurrentFiltersChanged(combinationId)).toBe(true)
    })
  })
})
