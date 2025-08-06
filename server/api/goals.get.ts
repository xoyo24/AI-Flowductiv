import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/server/database'
import { goals } from '~/server/database/schema'

const querySchema = z.object({
  status: z.enum(['active', 'completed', 'paused', 'archived']).optional(),
  type: z.enum(['time', 'activity_count', 'streak', 'focus_rating']).optional(),
  period: z.enum(['daily', 'weekly', 'monthly']).optional(),
  limit: z.string().transform(Number).default('50'),
  offset: z.string().transform(Number).default('0'),
})

export default defineEventHandler(async (event) => {
  try {
    const query = await getValidatedQuery(event, querySchema.parse)

    // Build query conditions
    const conditions = []

    if (query.status) {
      conditions.push(eq(goals.status, query.status))
    }

    if (query.type) {
      conditions.push(eq(goals.type, query.type))
    }

    if (query.period) {
      conditions.push(eq(goals.period, query.period))
    }

    // Execute query
    let queryBuilder = db
      .select()
      .from(goals)
      .orderBy(desc(goals.createdAt))
      .limit(query.limit)
      .offset(query.offset)

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions))
    }

    const result = await queryBuilder

    return {
      data: result,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: result.length, // Note: for simplicity, not calculating total count
      },
    }
  } catch (error) {
    console.error('Failed to fetch goals:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch goals',
    })
  }
})
