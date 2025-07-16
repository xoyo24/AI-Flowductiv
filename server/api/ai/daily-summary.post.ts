import { db, aiSummaries } from '~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.activities || !Array.isArray(body.activities)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Activities array is required'
      })
    }

    if (body.activities.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No activities to summarize'
      })
    }

    // For Phase 0, we'll create a simple mock AI summary
    // In Phase 1A, this will integrate with actual AI providers
    const summary = generateMockSummary(body.activities)
    
    // Save to database
    const today = new Date().toISOString().split('T')[0]
    const activitiesHash = generateActivitiesHash(body.activities)
    
    const summaryData = {
      date: today,
      content: summary,
      provider: 'mock',
      activitiesHash,
      tokensUsed: 0,
      userId: null // For now, no auth required
    }

    const result = await db.insert(aiSummaries).values(summaryData).returning()

    return {
      data: result[0],
      message: 'Summary generated successfully'
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('AI Summary error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate summary'
    })
  }
})

function generateMockSummary(activities: any[]): string {
  const totalTime = activities.reduce((sum, a) => sum + a.durationMs, 0)
  const hours = Math.round((totalTime / (1000 * 60 * 60)) * 10) / 10
  
  // Extract tags and their time
  const tagTime = activities.reduce((acc, a) => {
    if (a.tags) {
      a.tags.forEach((tag: string) => {
        acc[tag] = (acc[tag] || 0) + a.durationMs
      })
    }
    return acc
  }, {} as Record<string, number>)

  const topTag = Object.entries(tagTime)
    .sort(([,a], [,b]) => b - a)[0]

  const insights = [
    `You completed ${activities.length} focused sessions today, totaling ${hours} hours of tracked time.`,
    topTag ? `Most time was spent on **${topTag[0]}** activities (${Math.round(topTag[1] / (1000 * 60))} minutes).` : '',
    activities.length >= 3 ? '**Great consistency** with multiple focused sessions!' : activities.length >= 1 ? 'Good start! Consider adding more focused sessions tomorrow.' : '',
    hours >= 4 ? '**Excellent productivity** - you had a highly focused day.' : hours >= 2 ? 'Solid progress today.' : 'Consider longer focus sessions tomorrow.',
    'Tomorrow: Try to increase your longest session by 15 minutes for deeper flow states.'
  ].filter(Boolean)

  return insights.join('\n\n')
}

function generateActivitiesHash(activities: any[]): string {
  // Simple hash based on activity count and total time
  const data = activities.map(a => `${a.title}-${a.durationMs}`).join('|')
  return Buffer.from(data).toString('base64').slice(0, 16)
}