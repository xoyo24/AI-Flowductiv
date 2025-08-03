import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { goals } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const goalId = getRouterParam(event, 'id')
    
    if (!goalId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Goal ID is required'
      })
    }
    
    const result = await db
      .delete(goals)
      .where(eq(goals.id, goalId))
      .returning()
    
    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Goal not found'
      })
    }
    
    return { 
      data: result[0],
      message: 'Goal deleted successfully'
    }
  } catch (error) {
    console.error('Failed to delete goal:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete goal'
    })
  }
})