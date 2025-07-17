import { and, desc, eq } from 'drizzle-orm'
import { aiSummaries, db } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const date = (query.date as string) || new Date().toISOString().split('T')[0]

    // Find existing summary for the date
    const result = await db
      .select()
      .from(aiSummaries)
      .where(eq(aiSummaries.date, date))
      .orderBy(desc(aiSummaries.generatedAt))
      .limit(1)

    return {
      data: result[0] || null,
    }
  } catch (error) {
    console.error('Failed to fetch AI summary:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch summary',
    })
  }
})
