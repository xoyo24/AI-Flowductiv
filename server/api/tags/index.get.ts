import { sql } from 'drizzle-orm'
import { db } from '~/server/database'
import { activities } from '~/server/database/schema'

export default defineEventHandler(async (_event) => {
  try {
    // Get all unique tags from all activities
    const result = await db
      .select({
        tags: activities.tags,
      })
      .from(activities)
      .where(sql`${activities.tags} IS NOT NULL AND json_array_length(${activities.tags}) > 0`)

    // Extract and flatten all unique tags
    const allTags = new Set<string>()

    for (const row of result) {
      const tags = row.tags || []
      for (const tag of tags) {
        if (tag?.trim()) {
          allTags.add(tag.trim())
        }
      }
    }

    // Convert to sorted array
    const uniqueTags = Array.from(allTags).sort()

    return {
      data: uniqueTags,
      count: uniqueTags.length,
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tags',
    })
  }
})
