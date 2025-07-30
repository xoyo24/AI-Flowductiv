import { sql } from 'drizzle-orm'
import { db } from '~/server/database'
import { activities } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    // Get all activities to calculate tag statistics
    const allActivities = await db.select().from(activities)

    // Calculate statistics for each tag
    const tagStats: Record<string, {
      count: number
      totalTime: number
      avgDuration: number
    }> = {}

    for (const activity of allActivities) {
      const tags = activity.tags || []
      
      for (const tag of tags) {
        if (!tagStats[tag]) {
          tagStats[tag] = {
            count: 0,
            totalTime: 0,
            avgDuration: 0
          }
        }
        
        tagStats[tag].count++
        tagStats[tag].totalTime += activity.durationMs
      }
    }

    // Calculate average durations and format results
    const formattedStats = Object.entries(tagStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        totalTime: stats.totalTime,
        avgDuration: Math.round(stats.totalTime / stats.count)
      }))
      .sort((a, b) => b.totalTime - a.totalTime) // Sort by total time descending

    return { data: formattedStats }
  } catch (error) {
    console.error('Failed to fetch tag statistics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tag statistics'
    })
  }
})