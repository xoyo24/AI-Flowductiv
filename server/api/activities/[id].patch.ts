import { eq } from 'drizzle-orm'
import { activities, db } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Activity ID is required',
      })
    }

    // Build update data from provided fields
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (body.title !== undefined) {
      updateData.title = body.title.trim()
    }
    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags : []
    }
    if (body.priority !== undefined) {
      updateData.priority = body.priority
    }
    if (body.focusRating !== undefined) {
      updateData.focusRating = body.focusRating
    }

    // Update in database
    const result = await db
      .update(activities)
      .set(updateData)
      .where(eq(activities.id, id))
      .returning()

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found',
      })
    }

    return {
      data: result[0],
      message: 'Activity updated successfully',
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update activity',
    })
  }
})
