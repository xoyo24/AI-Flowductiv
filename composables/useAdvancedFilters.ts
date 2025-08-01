import { computed, readonly } from 'vue'
import { useActivities } from './useActivities'

export type EnergyLevel = 'low' | 'medium' | 'high'
export type FilterPreset = 'high-performance' | 'deep-work' | 'quick-tasks' | 'low-energy'

export interface AdvancedFilterState {
  priority?: number[]
  focusRating?: number[]
  energyLevel?: EnergyLevel[]
  minDuration?: number
  maxDuration?: number
}

export const useAdvancedFilters = () => {
  const {
    activeFilters,
    addTagFilter,
    removeTagFilter,
    setDateRangeFilter,
    clearDateRangeFilter,
    clearAllFilters
  } = useActivities()

  // Validation helpers
  const validatePriorities = (priorities: number[]): number[] => {
    return priorities.filter(p => p >= 1 && p <= 5)
  }

  const validateFocusRatings = (ratings: number[]): number[] => {
    return ratings.filter(r => r >= 1 && r <= 5)
  }

  const validateEnergyLevels = (levels: string[]): EnergyLevel[] => {
    const validLevels: EnergyLevel[] = ['low', 'medium', 'high']
    return levels.filter(level => validLevels.includes(level as EnergyLevel)) as EnergyLevel[]
  }

  const validateDuration = (duration: number): number => {
    return Math.max(0, duration)
  }

  // Priority filtering
  const setPriorityFilter = (priorities: number[]) => {
    const validPriorities = validatePriorities(priorities)
    if (validPriorities.length > 0) {
      activeFilters.value.priority = validPriorities
    } else {
      delete activeFilters.value.priority
    }
  }

  const togglePriorityFilter = (priority: number) => {
    if (priority < 1 || priority > 5) return
    
    if (!activeFilters.value.priority) {
      activeFilters.value.priority = []
    }

    const index = activeFilters.value.priority.indexOf(priority)
    if (index > -1) {
      activeFilters.value.priority.splice(index, 1)
      if (activeFilters.value.priority.length === 0) {
        delete activeFilters.value.priority
      }
    } else {
      activeFilters.value.priority.push(priority)
    }
  }

  // Focus rating filtering
  const setFocusRatingFilter = (ratings: number[]) => {
    const validRatings = validateFocusRatings(ratings)
    if (validRatings.length > 0) {
      activeFilters.value.focusRating = validRatings
    } else {
      delete activeFilters.value.focusRating
    }
  }

  const toggleFocusRatingFilter = (rating: number) => {
    if (rating < 1 || rating > 5) return
    
    if (!activeFilters.value.focusRating) {
      activeFilters.value.focusRating = []
    }

    const index = activeFilters.value.focusRating.indexOf(rating)
    if (index > -1) {
      activeFilters.value.focusRating.splice(index, 1)
      if (activeFilters.value.focusRating.length === 0) {
        delete activeFilters.value.focusRating
      }
    } else {
      activeFilters.value.focusRating.push(rating)
    }
  }

  // Energy level filtering
  const setEnergyLevelFilter = (levels: string[]) => {
    const validLevels = validateEnergyLevels(levels)
    if (validLevels.length > 0) {
      activeFilters.value.energyLevel = validLevels
    } else {
      delete activeFilters.value.energyLevel
    }
  }

  const toggleEnergyLevelFilter = (level: EnergyLevel) => {
    const validLevels: EnergyLevel[] = ['low', 'medium', 'high']
    if (!validLevels.includes(level)) return
    
    if (!activeFilters.value.energyLevel) {
      activeFilters.value.energyLevel = []
    }

    const index = activeFilters.value.energyLevel.indexOf(level)
    if (index > -1) {
      activeFilters.value.energyLevel.splice(index, 1)
      if (activeFilters.value.energyLevel.length === 0) {
        delete activeFilters.value.energyLevel
      }
    } else {
      activeFilters.value.energyLevel.push(level)
    }
  }

  // Duration range filtering
  const setDurationRangeFilter = (minDuration?: number, maxDuration?: number) => {
    if (minDuration !== undefined) {
      activeFilters.value.minDuration = validateDuration(minDuration)
    }
    
    if (maxDuration !== undefined) {
      activeFilters.value.maxDuration = validateDuration(maxDuration)
    }

    // Ensure min <= max
    if (activeFilters.value.minDuration && activeFilters.value.maxDuration) {
      if (activeFilters.value.minDuration > activeFilters.value.maxDuration) {
        const temp = activeFilters.value.minDuration
        activeFilters.value.minDuration = activeFilters.value.maxDuration
        activeFilters.value.maxDuration = temp
      }
    }
  }

  const clearDurationRangeFilter = () => {
    delete activeFilters.value.minDuration
    delete activeFilters.value.maxDuration
  }

  // Filter state management
  const getCurrentFilters = (): AdvancedFilterState => {
    return {
      priority: activeFilters.value.priority,
      focusRating: activeFilters.value.focusRating,
      energyLevel: activeFilters.value.energyLevel,
      minDuration: activeFilters.value.minDuration,
      maxDuration: activeFilters.value.maxDuration
    }
  }

  const hasAdvancedFilters = computed(() => {
    const advancedFilterKeys = ['priority', 'focusRating', 'energyLevel', 'minDuration', 'maxDuration']
    return advancedFilterKeys.some(key => activeFilters.value[key] !== undefined)
  })

  const advancedFilterCount = computed(() => {
    let count = 0
    if (activeFilters.value.priority) count++
    if (activeFilters.value.focusRating) count++
    if (activeFilters.value.energyLevel) count++
    if (activeFilters.value.minDuration !== undefined) count++
    if (activeFilters.value.maxDuration !== undefined) count++
    return count
  })

  const clearAllAdvancedFilters = () => {
    // Preserve tag and date filters, only clear advanced filters
    const preservedFilters = {
      tags: activeFilters.value.tags,
      dateRange: activeFilters.value.dateRange
    }
    
    // Clear all filters first
    activeFilters.value = {}
    
    // Restore preserved filters
    if (preservedFilters.tags) {
      activeFilters.value.tags = preservedFilters.tags
    }
    if (preservedFilters.dateRange) {
      activeFilters.value.dateRange = preservedFilters.dateRange
    }
  }

  // Filter presets
  const applyFilterPreset = (preset: FilterPreset) => {
    // Clear existing advanced filters but preserve tags and date
    clearAllAdvancedFilters()
    
    switch (preset) {
      case 'high-performance':
        setFocusRatingFilter([4, 5])
        setEnergyLevelFilter(['high'])
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
        
      case 'low-energy':
        setEnergyLevelFilter(['low'])
        setDurationRangeFilter(undefined, 1800000) // 30 min maximum
        break
    }
  }

  return {
    // State
    hasAdvancedFilters: readonly(hasAdvancedFilters),
    advancedFilterCount: readonly(advancedFilterCount),
    
    // Priority filters
    setPriorityFilter,
    togglePriorityFilter,
    
    // Focus rating filters
    setFocusRatingFilter,
    toggleFocusRatingFilter,
    
    // Energy level filters
    setEnergyLevelFilter,
    toggleEnergyLevelFilter,
    
    // Duration filters
    setDurationRangeFilter,
    clearDurationRangeFilter,
    
    // State management
    getCurrentFilters,
    clearAllAdvancedFilters,
    
    // Presets
    applyFilterPreset,
    
    // Re-export base filter actions for convenience
    addTagFilter,
    removeTagFilter,
    setDateRangeFilter,
    clearDateRangeFilter,
    clearAllFilters
  }
}