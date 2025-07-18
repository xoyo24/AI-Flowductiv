import { describe, expect, it, beforeAll } from 'vitest'
import { $fetch } from 'ofetch'
import type { ActivitySuggestion } from '~/types/activity'

describe('Activities Suggestions API Integration Tests', () => {
  let serverRunning = false
  const API_BASE_URL = 'http://localhost:3000'

  beforeAll(async () => {
    try {
      await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      serverRunning = true
      console.log('✅ Server detected - API integration tests enabled')
    } catch {
      console.warn('⚠️  Server not running - API integration tests will be skipped')
    }
  })

  describe('Core API functionality', () => {
    it('should return proper response structure', async () => {
      if (!serverRunning) return

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('meta')
      expect(Array.isArray(response.data)).toBe(true)
      expect(response.meta.query).toBe('')
      expect(response.meta.limit).toBe(10)
    })

    it('should handle query parameters', async () => {
      if (!serverRunning) return

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?q=test&limit=5`)
      
      expect(response.meta.query).toBe('test')
      expect(response.meta.limit).toBe(5)
      expect(response.data.length).toBeLessThanOrEqual(5)
    })

    it('should handle tag search', async () => {
      if (!serverRunning) return

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?q=%23work`)
      
      expect(response.meta.query).toBe('work') // # should be stripped
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should enforce limit constraints', async () => {
      if (!serverRunning) return

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?limit=100`)
      
      expect(response.meta.limit).toBe(50) // Should be capped at 50
      expect(response.data.length).toBeLessThanOrEqual(50)
    })

    it('should handle empty results', async () => {
      if (!serverRunning) return

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?q=nonexistentquery12345`)
      
      expect(response.data).toEqual([])
      expect(response.meta.total).toBe(0)
    })

    it('should handle invalid parameters gracefully', async () => {
      if (!serverRunning) return

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions?limit=invalid`)
      
      expect(response).toHaveProperty('data')
      expect(response.meta.limit).toBe(10) // Should default to 10
    })
  })

  describe('Response validation', () => {
    it('should return valid ActivitySuggestion objects', async () => {
      if (!serverRunning) return

      const response = await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      
      response.data.forEach((suggestion: ActivitySuggestion) => {
        expect(suggestion).toHaveProperty('id')
        expect(suggestion).toHaveProperty('text')
        expect(suggestion).toHaveProperty('type')
        expect(suggestion).toHaveProperty('frequency')
        expect(suggestion).toHaveProperty('lastUsed')
        expect(['activity', 'tag']).toContain(suggestion.type)
        expect(typeof suggestion.frequency).toBe('number')
      })
    })

    it('should have consistent ID format', async () => {
      if (!serverRunning) return

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

  describe('Error handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      if (!serverRunning) return

      await expect($fetch(`${API_BASE_URL}/api/activities/nonexistent`)).rejects.toThrow()
    })

    it('should handle POST requests to GET endpoint', async () => {
      if (!serverRunning) return

      await expect($fetch(`${API_BASE_URL}/api/activities/suggestions`, {
        method: 'POST',
        body: { test: 'data' }
      })).rejects.toThrow()
    })
  })

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      if (!serverRunning) return

      const startTime = Date.now()
      await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      const responseTime = Date.now() - startTime
      
      expect(responseTime).toBeLessThan(5000)
    })

    it('should handle concurrent requests', async () => {
      if (!serverRunning) return

      const requests = Array.from({ length: 3 }, (_, i) => 
        $fetch(`${API_BASE_URL}/api/activities/suggestions?q=test${i}`)
      )
      
      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response).toHaveProperty('data')
        expect(response).toHaveProperty('meta')
      })
    })
  })
})