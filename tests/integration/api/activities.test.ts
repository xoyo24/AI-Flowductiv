import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { eq } from 'drizzle-orm'
import { $fetch } from 'ofetch'
import { db } from '~/server/database'
import { activities } from '~/server/database/schema'

// Test data factory
const createTestActivity = (overrides = {}) => ({
  title: 'Test Activity',
  description: 'Test description',
  durationMs: 1800000, // 30 minutes
  startTime: new Date('2023-12-01T10:00:00Z'),
  endTime: new Date('2023-12-01T10:30:00Z'),
  tags: ['work', 'test'],
  priority: 2,
  focusRating: 8,
  energyLevel: 7,
  ...overrides
})

describe('Activities API Integration', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await db.delete(activities).execute()
  })

  afterEach(async () => {
    // Clean up test data after each test
    await db.delete(activities).execute()
  })

  describe('POST /api/activities', () => {
    it('should create activity with valid data', async () => {
      const activityData = createTestActivity()

      const response = await $fetch('/api/activities', {
        method: 'POST',
        body: activityData
      })

      expect(response).toMatchObject({
        message: 'Activity created successfully',
        data: expect.objectContaining({
          id: expect.any(String),
          title: 'Test Activity',
          description: 'Test description',
          durationMs: 1800000,
          tags: ['work', 'test'],
          priority: 2,
          focusRating: 8,
          energyLevel: 7,
          userId: null
        })
      })

      // Verify activity was saved in database
      const savedActivities = await db.select().from(activities)
      expect(savedActivities).toHaveLength(1)
      expect(savedActivities[0].title).toBe('Test Activity')
    })

    it('should create activity with minimal required data', async () => {
      const minimalData = {
        title: 'Minimal Activity',
        durationMs: 900000, // 15 minutes
        startTime: new Date('2023-12-01T14:00:00Z'),
        endTime: new Date('2023-12-01T14:15:00Z')
      }

      const response = await $fetch('/api/activities', {
        method: 'POST',
        body: minimalData
      })

      expect(response.data).toMatchObject({
        title: 'Minimal Activity',
        durationMs: 900000,
        description: null,
        tags: [],
        priority: null,
        focusRating: null,
        energyLevel: null
      })
    })

    it('should handle activity with tags and priority from parsed input', async () => {
      const activityData = createTestActivity({
        title: 'Work on project #urgent #development !3',
        tags: ['urgent', 'development'],
        priority: 3
      })

      const response = await $fetch('/api/activities', {
        method: 'POST',
        body: activityData
      })

      expect(response.data).toMatchObject({
        title: 'Work on project #urgent #development !3',
        tags: ['urgent', 'development'],
        priority: 3
      })
    })

    it('should trim title whitespace', async () => {
      const activityData = createTestActivity({
        title: '  Whitespace Activity  '
      })

      const response = await $fetch('/api/activities', {
        method: 'POST',
        body: activityData
      })

      expect(response.data.title).toBe('Whitespace Activity')
    })

    it('should return 400 for missing required fields', async () => {
      const invalidData = { title: 'Missing required fields' }

      await expect($fetch('/api/activities', {
        method: 'POST',
        body: invalidData
      })).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: expect.stringContaining('Missing required fields')
      })
    })

    it('should return 400 for negative duration', async () => {
      const invalidData = createTestActivity({
        durationMs: -1000
      })

      await expect($fetch('/api/activities', {
        method: 'POST',
        body: invalidData
      })).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Duration must be positive'
      })
    })

    it('should handle invalid date formats gracefully', async () => {
      const invalidData = createTestActivity({
        startTime: 'invalid-date',
        endTime: 'invalid-date'
      })

      await expect($fetch('/api/activities', {
        method: 'POST',
        body: invalidData
      })).rejects.toMatchObject({
        statusCode: 500
      })
    })
  })

  describe('GET /api/activities', () => {
    beforeEach(async () => {
      // Create test activities
      const testActivities = [
        createTestActivity({
          title: 'Morning Work',
          startTime: new Date('2023-12-01T09:00:00Z'),
          endTime: new Date('2023-12-01T10:00:00Z')
        }),
        createTestActivity({
          title: 'Afternoon Meeting',
          startTime: new Date('2023-12-01T14:00:00Z'),
          endTime: new Date('2023-12-01T15:00:00Z')
        }),
        createTestActivity({
          title: 'Yesterday Work',
          startTime: new Date('2023-11-30T10:00:00Z'),
          endTime: new Date('2023-11-30T11:00:00Z')
        })
      ]

      for (const activity of testActivities) {
        await db.insert(activities).values(activity)
      }
    })

    it('should return all activities when no filter is applied', async () => {
      const response = await $fetch('/api/activities')

      expect(response).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({ title: 'Morning Work' }),
          expect.objectContaining({ title: 'Afternoon Meeting' }),
          expect.objectContaining({ title: 'Yesterday Work' })
        ]),
        count: 3
      })

      // Should be ordered by start time (most recent first)
      expect(response.data[0].title).toBe('Afternoon Meeting')
      expect(response.data[1].title).toBe('Morning Work')
      expect(response.data[2].title).toBe('Yesterday Work')
    })

    it('should filter activities by date', async () => {
      const response = await $fetch('/api/activities?date=2023-12-01')

      expect(response).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({ title: 'Morning Work' }),
          expect.objectContaining({ title: 'Afternoon Meeting' })
        ]),
        count: 2
      })

      // Should not include yesterday's activity
      expect(response.data.find(a => a.title === 'Yesterday Work')).toBeUndefined()
    })

    it('should return empty array for date with no activities', async () => {
      const response = await $fetch('/api/activities?date=2023-12-31')

      expect(response).toMatchObject({
        data: [],
        count: 0
      })
    })

    it('should handle invalid date parameter gracefully', async () => {
      // Should not crash with invalid date, might return all or none
      const response = await $fetch('/api/activities?date=invalid-date')
      
      expect(response).toHaveProperty('data')
      expect(response).toHaveProperty('count')
      expect(Array.isArray(response.data)).toBe(true)
    })
  })

  describe('PATCH /api/activities/[id]', () => {
    let testActivityId: string

    beforeEach(async () => {
      // Create a test activity to update
      const result = await db.insert(activities).values(createTestActivity()).returning()
      testActivityId = result[0].id
    })

    it('should update activity with valid data', async () => {
      const updateData = {
        title: 'Updated Activity',
        focusRating: 9,
        energyLevel: 8,
        tags: ['updated', 'test']
      }

      const response = await $fetch(`/api/activities/${testActivityId}`, {
        method: 'PATCH',
        body: updateData
      })

      expect(response).toMatchObject({
        message: 'Activity updated successfully',
        data: expect.objectContaining({
          id: testActivityId,
          title: 'Updated Activity',
          focusRating: 9,
          energyLevel: 8,
          tags: ['updated', 'test']
        })
      })

      // Verify in database
      const updated = await db.select().from(activities).where(eq(activities.id, testActivityId))
      expect(updated[0]).toMatchObject(updateData)
    })

    it('should return 404 for non-existent activity', async () => {
      const nonExistentId = 'non-existent-id'

      await expect($fetch(`/api/activities/${nonExistentId}`, {
        method: 'PATCH',
        body: { title: 'Update' }
      })).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    })

    it('should return 400 for invalid duration in update', async () => {
      await expect($fetch(`/api/activities/${testActivityId}`, {
        method: 'PATCH',
        body: { durationMs: -500 }
      })).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Duration must be positive'
      })
    })
  })

  describe('DELETE /api/activities/[id]', () => {
    let testActivityId: string

    beforeEach(async () => {
      const result = await db.insert(activities).values(createTestActivity()).returning()
      testActivityId = result[0].id
    })

    it('should delete existing activity', async () => {
      const response = await $fetch(`/api/activities/${testActivityId}`, {
        method: 'DELETE'
      })

      expect(response).toMatchObject({
        message: 'Activity deleted successfully'
      })

      // Verify activity is deleted from database
      const deleted = await db.select().from(activities).where(eq(activities.id, testActivityId))
      expect(deleted).toHaveLength(0)
    })

    it('should return 404 for non-existent activity', async () => {
      const nonExistentId = 'non-existent-id'

      await expect($fetch(`/api/activities/${nonExistentId}`, {
        method: 'DELETE'
      })).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database to simulate connection failure
      // For now, we verify that errors are properly caught and returned as 500
      
      const invalidData = createTestActivity({
        // Simulate invalid data that might cause DB error
        startTime: null as any
      })

      await expect($fetch('/api/activities', {
        method: 'POST',
        body: invalidData
      })).rejects.toMatchObject({
        statusCode: 500
      })
    })

    it('should handle malformed JSON in request body', async () => {
      // Test with invalid JSON - this would be handled by Nuxt's body parser
      // The API should return appropriate error without crashing
      
      await expect($fetch('/api/activities', {
        method: 'POST',
        body: 'invalid-json'
      })).rejects.toMatchObject({
        statusCode: expect.any(Number)
      })
    })
  })

  describe('Data Integrity', () => {
    it('should maintain data consistency across operations', async () => {
      // Create activity
      const createResponse = await $fetch('/api/activities', {
        method: 'POST',
        body: createTestActivity({ title: 'Consistency Test' })
      })

      const activityId = createResponse.data.id

      // Update activity
      await $fetch(`/api/activities/${activityId}`, {
        method: 'PATCH',
        body: { focusRating: 10 }
      })

      // Fetch and verify
      const fetchResponse = await $fetch('/api/activities')
      const activity = fetchResponse.data.find(a => a.id === activityId)

      expect(activity).toMatchObject({
        title: 'Consistency Test',
        focusRating: 10
      })

      // Delete activity
      await $fetch(`/api/activities/${activityId}`, {
        method: 'DELETE'
      })

      // Verify deletion
      const afterDelete = await $fetch('/api/activities')
      expect(afterDelete.data.find(a => a.id === activityId)).toBeUndefined()
    })
  })
})