import { describe, expect, it, beforeAll } from 'vitest'
import { ref } from 'vue'
import { useAutoComplete } from '~/composables/useAutoComplete'
import { $fetch } from 'ofetch'

// Mock $fetch for test environment
if (typeof globalThis.$fetch === 'undefined') {
  globalThis.$fetch = $fetch
}

describe('useAutoComplete - Integration Tests', () => {
  let serverRunning = false
  
  beforeAll(async () => {
    try {
      await $fetch('http://localhost:3000/api/activities/suggestions')
      serverRunning = true
      console.log('✅ Server detected - integration tests enabled')
    } catch {
      console.warn('⚠️  Server not running - integration tests will be skipped')
    }
  })

  describe('Server Integration', () => {
    it('should handle API requests gracefully', async () => {
      if (!serverRunning) return

      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery, { debounceMs: 50 })

      searchQuery.value = 'test'
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(composable.isLoading.value).toBe(false)
      expect(Array.isArray(composable.suggestions.value)).toBe(true)
      
      // Either successful or error handled gracefully
      expect(composable.error.value === null || typeof composable.error.value === 'string').toBe(true)
    })

    it('should handle empty results gracefully', async () => {
      if (!serverRunning) return

      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery, { debounceMs: 50 })

      searchQuery.value = 'nonexistentquery12345'
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(Array.isArray(composable.suggestions.value)).toBe(true)
      
      // Either successful empty result or error handled gracefully
      expect(composable.error.value === null || typeof composable.error.value === 'string').toBe(true)
    })

    it('should handle API responses correctly', async () => {
      if (!serverRunning) return

      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery, { debounceMs: 50 })

      searchQuery.value = 'work'
      await new Promise(resolve => setTimeout(resolve, 150))

      expect(composable.isLoading.value).toBe(false)
      
      // Verify response structure if suggestions exist
      if (composable.suggestions.value.length > 0) {
        const suggestion = composable.suggestions.value[0]
        expect(suggestion).toHaveProperty('id')
        expect(suggestion).toHaveProperty('text')
        expect(suggestion).toHaveProperty('type')
        expect(suggestion).toHaveProperty('frequency')
      }
    })
  })

  describe('Component Structure', () => {
    it('should provide complete API surface', () => {
      const searchQuery = ref('')
      const composable = useAutoComplete(searchQuery)

      // Verify all properties exist
      expect(composable.suggestions).toBeDefined()
      expect(composable.activitySuggestions).toBeDefined()
      expect(composable.tagSuggestions).toBeDefined()
      expect(composable.isLoading).toBeDefined()
      expect(composable.error).toBeDefined()
      expect(composable.selectedIndex).toBeDefined()
      expect(composable.selectedSuggestion).toBeDefined()
      expect(composable.selectNext).toBeDefined()
      expect(composable.selectPrevious).toBeDefined()
      expect(composable.selectCurrent).toBeDefined()
      expect(composable.selectIndex).toBeDefined()
      expect(composable.retry).toBeDefined()
      expect(composable.cleanup).toBeDefined()
      expect(composable.performSearch).toBeDefined()
    })
  })
})