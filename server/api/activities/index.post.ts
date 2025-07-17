import { activities, db } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.title || !body.durationMs || !body.startTime || !body.endTime) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: title, durationMs, startTime, endTime',
      })
    }

    // Parse dates
    const startTime = new Date(body.startTime)
    const endTime = new Date(body.endTime)

    // Validate duration
    if (body.durationMs < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Duration must be positive',
      })
    }

    // Create activity data
    const activityData = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      durationMs: body.durationMs,
      startTime,
      endTime,
      tags: Array.isArray(body.tags) ? body.tags : [],
      priority: body.priority || null,
      focusRating: body.focusRating || null,
      energyLevel: body.energyLevel || null,
      userId: null, // For now, no auth required
    }

    // Insert into database
    const result = await db.insert(activities).values(activityData).returning()

    if (result.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create activity',
      })
    }

    return {
      data: result[0],
      message: 'Activity created successfully',
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
