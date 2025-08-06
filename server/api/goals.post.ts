import { z } from 'zod'
import { db } from '~/server/database'
import { goals } from '~/server/database/schema'

const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  type: z.enum(['time', 'activity_count', 'streak', 'focus_rating']),
  period: z.enum(['daily', 'weekly', 'monthly']),
  target: z.number().min(0.1, 'Target must be positive'),
  targetUnit: z.string().max(20).optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).default('active'),
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
  userId: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createGoalSchema.parse(body)

    // Set default start date if not provided
    if (!validatedData.startDate) {
      validatedData.startDate = new Date()
    }

    // Calculate end date based on period if not provided
    if (!validatedData.endDate) {
      const endDate = new Date(validatedData.startDate)
      switch (validatedData.period) {
        case 'daily':
          endDate.setDate(endDate.getDate() + 1)
          break
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7)
          break
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1)
          break
      }
      validatedData.endDate = endDate
    }

    // Set default target unit based on type
    if (!validatedData.targetUnit) {
      switch (validatedData.type) {
        case 'time':
          validatedData.targetUnit = 'hours'
          break
        case 'activity_count':
          validatedData.targetUnit = 'activities'
          break
        case 'streak':
          validatedData.targetUnit = 'days'
          break
        case 'focus_rating':
          validatedData.targetUnit = 'average rating'
          break
      }
    }

    const result = await db.insert(goals).values(validatedData).returning()

    return {
      data: result[0],
      message: 'Goal created successfully',
    }
  } catch (error) {
    console.error('Failed to create goal:', error)

    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid goal data',
        data: error.errors,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create goal',
    })
  }
})
