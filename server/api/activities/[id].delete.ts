import { db, activities } from '~/server/database'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Activity ID is required'
      })
    }

    // Delete from database
    const result = await db
      .delete(activities)
      .where(eq(activities.id, id))
      .returning()

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Activity not found'
      })
    }

    return {
      message: 'Activity deleted successfully',
      data: { id }
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete activity'
    })
  }
})