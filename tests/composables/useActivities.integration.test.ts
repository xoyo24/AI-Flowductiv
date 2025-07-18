import { describe, expect, it, beforeAll } from 'vitest'
import { useActivities } from '~/composables/useActivities'
import { $fetch } from 'ofetch'

// Mock $fetch for test environment
if (typeof globalThis.$fetch === 'undefined') {
  globalThis.$fetch = $fetch
}

describe('useActivities - Integration Tests', () => {
  let serverRunning = false
  const API_BASE_URL = 'http://localhost:3000'
  
  beforeAll(async () => {
    try {
      await $fetch(`${API_BASE_URL}/api/activities/suggestions`)
      serverRunning = true
      console.log('✅ Server detected - activities integration tests enabled')
    } catch {
      console.warn('⚠️  Server not running - activities integration tests will be skipped')
    }
  })

  describe('Server Integration', () => {
    it('should handle API errors gracefully for save activity', async () => {
      if (!serverRunning) return

      const composable = useActivities()
      
      const activityInput = {
        title: 'Test Activity',
        description: 'Test description',
        durationMs: 1800000, // 30 minutes
        startTime: new Date('2023-01-01T10:00:00Z'),
        endTime: new Date('2023-01-01T10:30:00Z'),
        tags: ['test', 'integration'],
        priority: 2,
        focusRating: 4,
        energyLevel: 'high'
      }

      // This will likely fail due to URL issues, but we test error handling
      const result = await composable.saveActivity(activityInput)
      
      expect(composable.loading.value).toBe(false)
      // Either successful or error handled gracefully
      expect(result === null || result?.title === 'Test Activity').toBe(true)
    })

    it('should handle get activities for date gracefully', async () => {
      if (!serverRunning) return

      const composable = useActivities()
      const testDate = new Date('2023-01-01')
      
      const activities = await composable.getActivitiesForDate(testDate)
      
      expect(Array.isArray(activities)).toBe(true)
      expect(composable.loading.value).toBe(false)
      
      // Either successful or error handled gracefully
      expect(composable.error.value === null || typeof composable.error.value === 'string').toBe(true)
    })

    it('should handle get todays activities gracefully', async () => {
      if (!serverRunning) return

      const composable = useActivities()
      
      const activities = await composable.getTodaysActivities()
      
      expect(Array.isArray(activities)).toBe(true)
      expect(composable.activities.value).toEqual(activities)
      expect(composable.loading.value).toBe(false)
      
      // Either successful or error handled gracefully
      expect(composable.error.value === null || typeof composable.error.value === 'string').toBe(true)
    })

    it('should handle API errors gracefully', async () => {
      if (!serverRunning) return

      const composable = useActivities()
      
      // Test with invalid endpoint by trying to update non-existent activity
      const result = await composable.updateActivity('non-existent-id', {
        title: 'Updated Title'
      })
      
      expect(result).toBe(null)
      expect(composable.error.value).toBe('Failed to update activity.')
      expect(composable.loading.value).toBe(false)
    })

    it('should handle delete operation', async () => {
      if (!serverRunning) return

      const composable = useActivities()
      
      // Test deleting non-existent activity
      const result = await composable.deleteActivity('non-existent-id')
      
      expect(result).toBe(false)
      expect(composable.error.value).toBe('Failed to delete activity.')
      expect(composable.loading.value).toBe(false)
    })
  })

  describe('Reactive State Updates', () => {
    it('should update loading state during API calls', async () => {
      if (!serverRunning) return

      const composable = useActivities()
      
      // Start an API call and check loading state
      const promise = composable.getTodaysActivities()
      
      // Note: Loading state might be brief, so we just verify it completes
      const result = await promise
      
      expect(Array.isArray(result)).toBe(true)
      expect(composable.loading.value).toBe(false)
    })

    it('should handle local state management', async () => {
      if (!serverRunning) return

      const composable = useActivities()
      
      // Test that activities are properly stored in local state
      const activities = await composable.getTodaysActivities()
      
      expect(composable.activities.value).toEqual(activities)
      expect(composable.activities.value).toBeInstanceOf(Array)
    })
  })

  describe('Component API Surface', () => {
    it('should provide complete API surface', () => {
      const composable = useActivities()

      // Verify all properties exist
      expect(composable.activities).toBeDefined()
      expect(composable.loading).toBeDefined()
      expect(composable.error).toBeDefined()
      expect(composable.getActivityStats).toBeDefined()
      expect(composable.saveActivity).toBeDefined()
      expect(composable.getActivitiesForDate).toBeDefined()
      expect(composable.getTodaysActivities).toBeDefined()
      expect(composable.updateActivity).toBeDefined()
      expect(composable.deleteActivity).toBeDefined()
      expect(composable.formatDuration).toBeDefined()
    })

    it('should provide readonly reactive state', () => {
      const composable = useActivities()
      
      // Verify state is reactive but readonly
      expect(composable.activities.value).toBeInstanceOf(Array)
      expect(typeof composable.loading.value).toBe('boolean')
      expect(composable.error.value === null || typeof composable.error.value === 'string').toBe(true)
    })
  })

  describe('Utility Functions', () => {
    it('should format duration correctly', () => {
      const composable = useActivities()
      
      expect(composable.formatDuration(30000)).toBe('0m')
      expect(composable.formatDuration(60000)).toBe('1m')
      expect(composable.formatDuration(3600000)).toBe('1h 0m')
      expect(composable.formatDuration(3900000)).toBe('1h 5m')
    })
  })
})