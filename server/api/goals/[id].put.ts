import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/server/database'
import { goals } from '~/server/database/schema'

const updateGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['time', 'activity_count', 'streak', 'focus_rating']).optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).optional(),
  target: z.number().min(0.1, 'Target must be positive').optional(),
  targetUnit: z.string().max(20).optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  tags: z.array(z.string()).max(10, 'Too many tags').optional(),
  priority: z.number().min(1).max(5).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const goalId = getRouterParam(event, 'id')

    if (!goalId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Goal ID is required',
      })
    }

    const body = await readBody(event)
    const validatedData = updateGoalSchema.parse(body)

    // Add updated timestamp
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    }

    const result = await db.update(goals).set(updateData).where(eq(goals.id, goalId)).returning()

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Goal not found',
      })
    }

    return {
      data: result[0],
      message: 'Goal updated successfully',
    }
  } catch (error) {
    console.error('Failed to update goal:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid goal data',
        data: error.errors,
      })
    }

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update goal',
    })
  }
})
