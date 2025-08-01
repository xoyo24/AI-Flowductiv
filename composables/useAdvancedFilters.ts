import { computed, ref, readonly } from 'vue'
import { useActivities } from './useActivities'

export type FilterPreset = 'high-performance' | 'deep-work' | 'quick-tasks'

export interface AdvancedFilterState {
  priority?: number[]
  focusRating?: number[]
  minDuration?: number
  maxDuration?: number
}

export interface SavedFilterCombination {
  id: string
  name: string
  filters: AdvancedFilterState & {
    tags?: string[]
    dateRange?: {
      start: string
      end: string
    }
  }
  createdAt: string
}

export const useAdvancedFilters = () => {
  const {
    activeFilters,
    addTagFilter,
    removeTagFilter,
    setDateRangeFilter,
    clearDateRangeFilter,
    clearAllFilters,
    setPriorityFilter,
    setFocusRatingFilter,
    setDurationRangeFilter,
    clearDurationRangeFilter
  } = useActivities()

  // Saved filter combinations state
  const savedCombinations = ref<SavedFilterCombination[]>([])
  const STORAGE_KEY = 'flowductiv-saved-filter-combinations'

  // Load saved combinations from localStorage on initialization
  const loadSavedCombinations = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        savedCombinations.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load saved filter combinations:', error)
      savedCombinations.value = []
    }
  }

  // Save combinations to localStorage
  const saveCombinationsToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCombinations.value))
    } catch (error) {
      console.error('Failed to save filter combinations:', error)
    }
  }

  // Initialize saved combinations
  if (process.client) {
    loadSavedCombinations()
  }

  // Validation helpers
  const validatePriorities = (priorities: number[]): number[] => {
    return priorities.filter(p => p >= 1 && p <= 5)
  }

  const validateFocusRatings = (ratings: number[]): number[] => {
    return ratings.filter(r => r >= 1 && r <= 5)
  }


  const validateDuration = (duration: number): number => {
    return Math.max(0, duration)
  }

  // Priority filtering (wrapped with validation)
  const setPriorityFilterWithValidation = (priorities: number[]) => {
    const validPriorities = validatePriorities(priorities)
    setPriorityFilter(validPriorities)
  }

  const togglePriorityFilter = (priority: number) => {
    if (priority < 1 || priority > 5) return
    
    const currentPriorities = activeFilters.value.priority || []
    const index = currentPriorities.indexOf(priority)
    
    let newPriorities: number[]
    if (index > -1) {
      newPriorities = currentPriorities.filter(p => p !== priority)
    } else {
      newPriorities = [...currentPriorities, priority]
    }
    
    setPriorityFilter(newPriorities)
  }

  // Focus rating filtering (wrapped with validation)
  const setFocusRatingFilterWithValidation = (ratings: number[]) => {
    const validRatings = validateFocusRatings(ratings)
    setFocusRatingFilter(validRatings)
  }

  const toggleFocusRatingFilter = (rating: number) => {
    if (rating < 1 || rating > 5) return
    
    const currentRatings = activeFilters.value.focusRating || []
    const index = currentRatings.indexOf(rating)
    
    let newRatings: number[]
    if (index > -1) {
      newRatings = currentRatings.filter(r => r !== rating)
    } else {
      newRatings = [...currentRatings, rating]
    }
    
    setFocusRatingFilter(newRatings)
  }


  // Duration range filtering (wrapped with validation)
  const setDurationRangeFilterWithValidation = (minDuration?: number, maxDuration?: number) => {
    let validMinDuration = minDuration !== undefined ? validateDuration(minDuration) : undefined
    let validMaxDuration = maxDuration !== undefined ? validateDuration(maxDuration) : undefined

    // Ensure min <= max
    if (validMinDuration !== undefined && validMaxDuration !== undefined) {
      if (validMinDuration > validMaxDuration) {
        const temp = validMinDuration
        validMinDuration = validMaxDuration
        validMaxDuration = temp
      }
    }

    setDurationRangeFilter(validMinDuration, validMaxDuration)
  }

  // Filter state management
  const getCurrentFilters = (): AdvancedFilterState => {
    return {
      priority: activeFilters.value.priority,
      focusRating: activeFilters.value.focusRating,
      minDuration: activeFilters.value.minDuration,
      maxDuration: activeFilters.value.maxDuration
    }
  }

  const hasAdvancedFilters = computed(() => {
    const advancedFilterKeys = ['priority', 'focusRating', 'minDuration', 'maxDuration']
    return advancedFilterKeys.some(key => activeFilters.value[key] !== undefined)
  })

  const advancedFilterCount = computed(() => {
    let count = 0
    if (activeFilters.value.priority) count++
    if (activeFilters.value.focusRating) count++
    if (activeFilters.value.minDuration !== undefined) count++
    if (activeFilters.value.maxDuration !== undefined) count++
    return count
  })

  const clearAllAdvancedFilters = () => {
    // Clear only advanced filters, preserve tags and date filters
    setPriorityFilter([])
    setFocusRatingFilter([])
    clearDurationRangeFilter()
  }

  // Filter presets
  const applyFilterPreset = (preset: FilterPreset) => {
    // Clear existing advanced filters but preserve tags and date
    clearAllAdvancedFilters()
    
    switch (preset) {
      case 'high-performance':
        setFocusRatingFilter([4, 5])
        setDurationRangeFilter(1800000) // 30 min minimum
        break
        
      case 'deep-work':
        setFocusRatingFilter([5])
        setDurationRangeFilter(3600000) // 60 min minimum
        break
        
      case 'quick-tasks':
        setPriorityFilter([1, 2])
        setDurationRangeFilter(undefined, 900000) // 15 min maximum
        break
    }
  }

  // Filter combination management
  const saveCurrentFilterCombination = (name: string): string => {
    const id = `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const combination: SavedFilterCombination = {
      id,
      name: name.trim(),
      filters: {
        ...getCurrentFilters(),
        tags: activeFilters.value.tags ? [...activeFilters.value.tags] : undefined,
        dateRange: activeFilters.value.dateRange ? {
          start: activeFilters.value.dateRange.start,
          end: activeFilters.value.dateRange.end
        } : undefined
      },
      createdAt: new Date().toISOString()
    }
    
    savedCombinations.value.push(combination)
    saveCombinationsToStorage()
    return id
  }

  const applySavedFilterCombination = (id: string) => {
    const combination = savedCombinations.value.find(c => c.id === id)
    if (!combination) return false

    // Clear all current filters
    clearAllFilters()

    // Apply saved filters
    const { filters } = combination
    
    if (filters.priority) setPriorityFilter(filters.priority)
    if (filters.focusRating) setFocusRatingFilter(filters.focusRating)
    if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
      setDurationRangeFilter(filters.minDuration, filters.maxDuration)
    }
    if (filters.tags) {
      filters.tags.forEach(tag => addTagFilter(tag))
    }
    if (filters.dateRange) {
      setDateRangeFilter(filters.dateRange.start, filters.dateRange.end)
    }

    return true
  }

  const deleteSavedFilterCombination = (id: string) => {
    const index = savedCombinations.value.findIndex(c => c.id === id)
    if (index > -1) {
      savedCombinations.value.splice(index, 1)
      saveCombinationsToStorage()
      return true
    }
    return false
  }

  const renameSavedFilterCombination = (id: string, newName: string) => {
    const combination = savedCombinations.value.find(c => c.id === id)
    if (combination) {
      combination.name = newName.trim()
      saveCombinationsToStorage()
      return true
    }
    return false
  }

  const hasCurrentFiltersChanged = (savedFiltersId: string) => {
    const combination = savedCombinations.value.find(c => c.id === savedFiltersId)
    if (!combination) return false

    const current = {
      ...getCurrentFilters(),
      tags: activeFilters.value.tags ? [...activeFilters.value.tags] : undefined,
      dateRange: activeFilters.value.dateRange ? {
        start: activeFilters.value.dateRange.start,
        end: activeFilters.value.dateRange.end
      } : undefined
    }

    return JSON.stringify(current) !== JSON.stringify(combination.filters)
  }

  return {
    // State
    hasAdvancedFilters: readonly(hasAdvancedFilters),
    advancedFilterCount: readonly(advancedFilterCount),
    savedCombinations: readonly(savedCombinations),
    
    // Priority filters
    setPriorityFilter: setPriorityFilterWithValidation,
    togglePriorityFilter,
    
    // Focus rating filters
    setFocusRatingFilter: setFocusRatingFilterWithValidation,
    toggleFocusRatingFilter,
    
    // Duration filters
    setDurationRangeFilter: setDurationRangeFilterWithValidation,
    clearDurationRangeFilter,
    
    // State management
    getCurrentFilters,
    clearAllAdvancedFilters,
    
    // Presets
    applyFilterPreset,
    
    // Filter combinations
    saveCurrentFilterCombination,
    applySavedFilterCombination,
    deleteSavedFilterCombination,
    renameSavedFilterCombination,
    hasCurrentFiltersChanged,
    
    // Re-export base filter actions for convenience
    addTagFilter,
    removeTagFilter,
    setDateRangeFilter,
    clearDateRangeFilter,
    clearAllFilters
  }
}