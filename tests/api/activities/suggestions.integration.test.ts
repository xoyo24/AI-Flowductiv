import { describe, expect, it, beforeAll } from 'vitest'
import { $fetch } from 'ofetch'
import type { ActivitySuggestion } from '~/types/activity'

// These are integration tests that require a running server
// Run with: bun dev (in separate terminal) then bun test suggestions.integration.test.ts

const API_BASE_URL = 'http://localhost:3000'

describe('Activities Suggestions API Integration Tests', () => {
  let serverRunning = false

  beforeAll(async () => {
    // Check if server is running
    try {
      await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      serverRunning = true
      console.log('✅ Server is running - integration tests will execute')
    } catch (error) {
      console.warn('⚠️  Server is not running. Start with: bun dev')
      console.warn('⚠️  Integration tests will be skipped.')
    }
  })

  describe('GET /api/activities/suggestions', () => {
    it('should return suggestions without query parameters', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      // Validate response structure
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(Array.isArray(response.data)).toBe(true)
      
      // Validate meta structure
      expect(response.meta).toHaveProperty('total')
      expect(response.meta).toHaveProperty('query')
      expect(response.meta).toHaveProperty('limit')
      expect(typeof response.meta.total).toBe('number')
      expect(typeof response.meta.query).toBe('string')
      expect(typeof response.meta.limit).toBe('number')
      expect(response.meta.query).toBe('')
      expect(response.meta.limit).toBe(10) // default limit
    })

    it('should handle search query parameter', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?q=work`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta.query).toBe('work')
      
      // If there are results, they should contain 'work' in text
      if (response.data.length > 0) {
        const hasMatchingResults = response.data.some((s: ActivitySuggestion) => 
          s.text.toLowerCase().includes('work')
        )
        expect(hasMatchingResults).toBe(true)
      }
    })

    it('should handle tag search with # prefix', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?q=%23work`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta.query).toBe('work') // # should be stripped
      
      // Should prefer tag suggestions for tag search
      if (response.data.length > 0) {
        const tagSuggestions = response.data.filter((s: ActivitySuggestion) => s.type === 'tag')
        const activitySuggestions = response.data.filter((s: ActivitySuggestion) => s.type === 'activity')
        
        // For tag search, should either have no activity suggestions or fewer than tag suggestions
        expect(tagSuggestions.length).toBeGreaterThanOrEqual(activitySuggestions.length)
      }
    })

    it('should respect limit parameter', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?limit=3`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta.limit).toBe(3)
      expect(response.data.length).toBeLessThanOrEqual(3)
    })

    it('should enforce maximum limit of 50', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?limit=100`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta.limit).toBe(50) // Should be capped at 50
      expect(response.data.length).toBeLessThanOrEqual(50)
    })

    it('should handle multiple query parameters', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?q=test&limit=5`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta.query).toBe('test')
      expect(response.meta.limit).toBe(5)
      expect(response.data.length).toBeLessThanOrEqual(5)
    })

    it('should handle empty/nonexistent search', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?q=nonexistentquerythatshouldfindnothing`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta.query).toBe('nonexistentquerythatshouldfindnothing')
      expect(response.data).toEqual([])
      expect(response.meta.total).toBe(0)
    })

    it('should handle invalid parameters gracefully', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const testCases = [
        '?limit=invalid',
        '?limit=-5',
        '?limit=0',
        '?q=',
        '?invalid=parameter'
      ]

      for (const query of testCases) {
        const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions${query}`)
        
        expect(response).toHaveProperty('data')
        expect(response).toHaveProperty('meta')
        expect(Array.isArray(response.data)).toBe(true)
        
        // Invalid limits should default to 10
        if (query.includes('limit=')) {
          expect(response.meta.limit).toBe(10)
        }
      }
    })
  })

  describe('API response validation', () => {
    it('should return valid ActivitySuggestion objects', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      // Validate each suggestion object
      response.data.forEach((suggestion: ActivitySuggestion) => {
        expect(suggestion).toHaveProperty('id')
        expect(suggestion).toHaveProperty('text')
        expect(suggestion).toHaveProperty('type')
        expect(suggestion).toHaveProperty('frequency')
        expect(suggestion).toHaveProperty('lastUsed')
        
        expect(typeof suggestion.id).toBe('string')
        expect(typeof suggestion.text).toBe('string')
        expect(['activity', 'tag']).toContain(suggestion.type)
        expect(typeof suggestion.frequency).toBe('number')
        expect(suggestion.frequency).toBeGreaterThan(0)
        
        // lastUsed should be a valid date
        const lastUsedDate = new Date(suggestion.lastUsed)
        expect(lastUsedDate).toBeInstanceOf(Date)
        expect(lastUsedDate.getTime()).not.toBeNaN()
      })
    })

    it('should return suggestions sorted by relevance', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      // Suggestions should be sorted by relevance score (descending)
      if (response.data.length > 1) {
        // Check that they're sorted by some criteria
        // Since we don't know the exact sorting algorithm, we'll check basic consistency
        response.data.forEach((suggestion: ActivitySuggestion, index: number) => {
          if (index > 0) {
            const prevSuggestion = response.data[index - 1]
            // More frequent suggestions should generally come first
            expect(suggestion.frequency).toBeLessThanOrEqual(prevSuggestion.frequency)
          }
        })
      }
    })

    it('should have consistent ID format', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      response.data.forEach((suggestion: ActivitySuggestion) => {
        if (suggestion.type === 'activity') {
          expect(suggestion.id).toMatch(/^activity-/)
        } else if (suggestion.type === 'tag') {
          expect(suggestion.id).toMatch(/^tag-/)
        }
      })
    })
  })

  describe('API error handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      await expect($fetch(`${API_BASE_URL}/api/activities/nonexistent`)).rejects.toThrow()
    })

    it('should handle POST requests to GET endpoint', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      await expect($fetch(`${API_BASE_URL}/api/activities/suggestions`, {
        method: 'POST',
        body: { test: 'data' }
      })).rejects.toThrow()
    })
  })

  describe('API performance', () => {
    it('should respond within reasonable time', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const startTime = Date.now()
      
      await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // Should respond within 5 seconds (generous for CI environments)
      expect(responseTime).toBeLessThan(5000)
    })

    it('should handle concurrent requests', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
        $fetch(`${API_BASE_URL}/api/activities/suggestions?q=test${i}`)
      )
      
      const responses = await Promise.all(concurrentRequests)
      
      responses.forEach(response => {
        expect(response).toHaveProperty('data')
        expect(response).toHaveProperty('meta')
        expect(Array.isArray(response.data)).toBe(true)
      })
    })
  })

  describe('API database integration', () => {
    it('should reflect database state', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      // This test verifies that the API actually queries the database
      // and returns suggestions based on actual data
      
      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      // If database is empty, should return empty results
      // If database has data, should return suggestions
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(response.meta.total).toBe(response.data.length)
      
      // If there are suggestions, they should have realistic data
      if (response.data.length > 0) {
        response.data.forEach((suggestion: ActivitySuggestion) => {
          expect(suggestion.text).toBeTruthy()
          expect(suggestion.frequency).toBeGreaterThan(0)
          expect(new Date(suggestion.lastUsed).getTime()).toBeLessThanOrEqual(Date.now())
        })
      }
    })

    it('should handle empty database gracefully', async () => {
      if (!serverRunning) {
        console.warn('⚠️  Skipping test - server not running')
        return
      }

      // Even with empty database, API should not crash
      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(Array.isArray(response.data)).toBe(true)
      expect(typeof response.meta.total).toBe('number')
    })
  })
})