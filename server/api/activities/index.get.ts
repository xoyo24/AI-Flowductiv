import { and, desc, gte, lte } from 'drizzle-orm'
import { activities, db } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const date = query.date as string
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10

    const whereConditions = []

    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      whereConditions.push(
        gte(activities.startTime, startOfDay),
        lte(activities.startTime, endOfDay)
      )
    }

    // TODO: Add user filtering when auth is implemented
    // if (userId) {
    //   whereConditions.push(eq(activities.userId, userId))
    // }

    // Build query
    let dbQuery = db.select().from(activities)

    if (whereConditions.length > 0) {
      dbQuery = dbQuery.where(and(...whereConditions))
    }

    // Order by start time, most recent first
    dbQuery = dbQuery.orderBy(desc(activities.startTime))

    // Add pagination only if not filtering by date
    if (!date) {
      const offset = (page - 1) * limit
      dbQuery = dbQuery.limit(limit).offset(offset)
    }

    const result = await dbQuery

    return {
      data: result,
      count: result.length,
      page,
      limit,
      hasMore: !date && result.length === limit,
    }
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch activities',
    })
  }
})
