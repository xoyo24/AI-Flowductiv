import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useAutoComplete } from '~/composables/useAutoComplete'
import { setupApiMocks } from '../../helpers/apiMocks'

// Following Vue Test Utils best practices
const apiMocks = setupApiMocks()

describe('useAutoComplete - Integration Tests', () => {
  beforeEach(() => {
    apiMocks.reset()
    
    // Mock successful API response with simple data
    apiMocks.mockSuccess([
      { id: 'sug-1', text: 'Work on project', type: 'activity', frequency: 5 },
      { id: 'sug-2', text: 'Team meeting', type: 'activity', frequency: 3 },
      { id: 'tag-1', text: 'work', type: 'tag', frequency: 8 },
      { id: 'tag-2', text: 'urgent', type: 'tag', frequency: 4 }
    ])
  })

  afterEach(() => {
    apiMocks.restore()
  })

  describe('Suggestion API Integration', () => {
    it('should fetch suggestions and update reactive state', async () => {
      const searchQuery = ref('')
      const { 
        suggestions, activitySuggestions, tagSuggestions, 
        isLoading, error, performSearch 
      } = useAutoComplete(searchQuery, { debounceMs: 50 })

      // Test API integration with performSearch
      await performSearch('work')
      await new Promise(resolve => setTimeout(resolve, 60)) // Wait for debounce

      // Test reactive state updates
      expect(Array.isArray(suggestions.value)).toBe(true)
      expect(isLoading.value).toBe(false)
      expect(error.value).toBe(null)
      
      // Test computed properties (activity vs tag filtering)
      expect(Array.isArray(activitySuggestions.value)).toBe(true)
      expect(Array.isArray(tagSuggestions.value)).toBe(true)
      
      // Verify suggestion structure
      if (suggestions.value.length > 0) {
        const suggestion = suggestions.value[0]
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
      expect(composable.getInitialSuggestions).toBeDefined()
    })
  })
})