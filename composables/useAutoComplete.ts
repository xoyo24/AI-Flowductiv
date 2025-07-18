import { type Ref, ref, computed, watch, readonly, getCurrentInstance, onUnmounted } from 'vue'
import type { ActivitySuggestion, AutoCompleteResult } from '~/types/activity'

export interface UseAutoCompleteOptions {
  debounceMs?: number
  minQueryLength?: number
  maxSuggestions?: number
}

export const useAutoComplete = (
  searchQuery: Ref<string>,
  options: UseAutoCompleteOptions = {}
) => {
  const {
    debounceMs = 300,
    minQueryLength = 0,
    maxSuggestions = 10
  } = options

  // Reactive state
  const suggestions = ref<ActivitySuggestion[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedIndex = ref(-1)

  // Debounce timer
  let debounceTimer: NodeJS.Timeout | null = null
  let abortController: AbortController | null = null

  // Computed properties for suggestion filtering
  const activitySuggestions = computed(() => 
    suggestions.value.filter(s => s.type === 'activity')
  )

  const tagSuggestions = computed(() => 
    suggestions.value.filter(s => s.type === 'tag')
  )

  const selectedSuggestion = computed(() => {
    if (selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length) {
      return suggestions.value[selectedIndex.value]
    }
    return null
  })

  // Search function
  const performSearch = async (query: string) => {
    if (query.length < minQueryLength && query.length > 0) {
      // Only skip search if there's text but it's too short
      // Always search when empty to get recent activities/tags
      suggestions.value = []
      return
    }

    // Cancel previous request
    if (abortController) {
      abortController.abort()
    }

    abortController = new AbortController()
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ data: ActivitySuggestion[] }>('/api/activities/suggestions', {
        query: { 
          q: query,
          limit: maxSuggestions
        },
        signal: abortController.signal
      })

      suggestions.value = response.data
      selectedIndex.value = -1 // Reset selection
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        error.value = err.message || 'Failed to fetch suggestions'
        suggestions.value = []
      }
    } finally {
      isLoading.value = false
      abortController = null
    }
  }

  // Debounced search watcher
  watch(searchQuery, (newQuery) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Reset selection when query changes
    selectedIndex.value = -1

    // Set new timer
    debounceTimer = setTimeout(() => {
      performSearch(newQuery.trim())
    }, debounceMs)
  }, { immediate: false })

  // Keyboard navigation
  const selectNext = () => {
    if (suggestions.value.length === 0) return
    
    selectedIndex.value = selectedIndex.value < suggestions.value.length - 1 
      ? selectedIndex.value + 1 
      : -1
  }

  const selectPrevious = () => {
    if (suggestions.value.length === 0) return
    
    selectedIndex.value = selectedIndex.value > -1 
      ? selectedIndex.value - 1 
      : suggestions.value.length - 1
  }

  const selectCurrent = () => {
    return selectedSuggestion.value
  }

  const selectIndex = (index: number) => {
    if (index >= -1 && index < suggestions.value.length) {
      selectedIndex.value = index
    }
  }

  // Manual retry function
  const retry = () => {
    if (!isLoading.value) {
      performSearch(searchQuery.value.trim())
    }
  }

  // Get initial suggestions (recent activities/tags)
  const getInitialSuggestions = () => {
    performSearch('')
  }

  // Cleanup function
  const cleanup = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  // Auto cleanup on unmount (if getCurrentInstance available)
  try {
    const instance = getCurrentInstance()
    if (instance) {
      onUnmounted(cleanup)
    }
  } catch {
    // getCurrentInstance not available, manual cleanup required
  }

  return {
    // State
    suggestions: readonly(suggestions),
    activitySuggestions: readonly(activitySuggestions),
    tagSuggestions: readonly(tagSuggestions),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Selection
    selectedIndex: readonly(selectedIndex),
    selectedSuggestion: readonly(selectedSuggestion),
    
    // Actions
    selectNext,
    selectPrevious,
    selectCurrent,
    selectIndex,
    retry,
    cleanup,
    
    // Manual search (for testing)
    performSearch,
    getInitialSuggestions
  }
}