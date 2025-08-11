import { desc, ne, and } from 'drizzle-orm'
import { aiSummaries, db } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = Number(query.limit) || 50
    const offset = Number(query.offset) || 0

    // Fetch AI summaries ordered by most recent first, excluding mock entries
    const results = await db
      .select()
      .from(aiSummaries)
      .where(and(
        ne(aiSummaries.provider, 'mock-fallback'),
        ne(aiSummaries.provider, 'mock')
      ))
      .orderBy(desc(aiSummaries.generatedAt))
      .limit(Math.min(limit, 100)) // Cap at 100 for performance
      .offset(offset)

    return {
      data: results,
      pagination: {
        limit,
        offset,
        total: results.length // In a real app, you'd do a separate count query
      }
    }
  } catch (error) {
    console.error('Failed to fetch AI history:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch AI analysis history',
    })
  }
})