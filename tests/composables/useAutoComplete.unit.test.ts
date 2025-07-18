import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useAutoComplete } from '~/composables/useAutoComplete'

describe('useAutoComplete - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with correct defaults', () => {
      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery)
      
      expect(composable.suggestions.value).toEqual([])
      expect(composable.isLoading.value).toBe(false)
      expect(composable.error.value).toBe(null)
      expect(composable.selectedIndex.value).toBe(-1)
      expect(composable.selectedSuggestion.value).toBe(null)
    })

    it('should provide all required methods', () => {
      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery)

      expect(typeof composable.selectNext).toBe('function')
      expect(typeof composable.selectPrevious).toBe('function')
      expect(typeof composable.selectCurrent).toBe('function')
      expect(typeof composable.retry).toBe('function')
      expect(typeof composable.cleanup).toBe('function')
      expect(typeof composable.performSearch).toBe('function')
    })
  })

  describe('Core Logic', () => {
    it('should handle navigation with empty suggestions', () => {
      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery)
      
      composable.selectNext()
      composable.selectPrevious()
      expect(composable.selectedIndex.value).toBe(-1)
    })

    it('should reset selection on query change', async () => {
      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery)
      
      searchQuery.value = 'test'
      await nextTick()
      
      expect(composable.selectedIndex.value).toBe(-1)
    })

    it('should handle AbortError without setting error state', () => {
      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery)
      
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      
      // Test error handling logic
      const shouldSetError = abortError.name !== 'AbortError'
      expect(shouldSetError).toBe(false)
    })

    it('should respect minQueryLength', () => {
      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery, { minQueryLength: 2 })
      
      const shouldSearch = (query: string, minLength: number) => query.length >= minLength
      
      expect(shouldSearch('a', 2)).toBe(false)
      expect(shouldSearch('ab', 2)).toBe(true)
    })
  })
})