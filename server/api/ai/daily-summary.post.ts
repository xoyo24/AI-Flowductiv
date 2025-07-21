import { aiSummaries, db } from '~/server/database'
import { AIRouter } from '~/services/ai/aiRouter'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.activities || !Array.isArray(body.activities)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Activities array is required',
      })
    }

    if (body.activities.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No activities to summarize',
      })
    }

    // Use the AI Router to generate real AI summaries
    const aiRouter = new AIRouter()
    
    try {
      const aiResponse = await aiRouter.generateDailySummary(body.activities)
      
      // Save to database
      const today = new Date().toISOString().split('T')[0]
      const activitiesHash = generateActivitiesHash(body.activities)
      const tokensUsed = (aiResponse.usage.input_tokens || aiResponse.usage.prompt_tokens || 0) + 
                         (aiResponse.usage.output_tokens || aiResponse.usage.completion_tokens || 0)

      const summaryData = {
        date: today,
        content: aiResponse.content,
        provider: aiResponse.provider,
        activitiesHash,
        tokensUsed,
        userId: null, // For now, no auth required
      }

      const result = await db.insert(aiSummaries).values(summaryData).returning()

      return {
        data: result[0],
        message: 'Summary generated successfully',
        usage: {
          provider: aiResponse.provider,
          tokens: tokensUsed
        }
      }
      
    } catch (aiError) {
      console.warn('AI generation failed, falling back to mock:', aiError)
      
      // Fallback to mock if AI fails
      const summary = generateMockSummary(body.activities)
      
      const today = new Date().toISOString().split('T')[0]
      const activitiesHash = generateActivitiesHash(body.activities)

      const summaryData = {
        date: today,
        content: summary,
        provider: 'mock-fallback',
        activitiesHash,
        tokensUsed: 0,
        userId: null,
      }

      const result = await db.insert(aiSummaries).values(summaryData).returning()

      return {
        data: result[0],
        message: 'Summary generated using fallback (AI unavailable)',
      }
    }
    
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('AI Summary error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate summary',
    })
  }
})

function generateMockSummary(activities: any[]): string {
  const totalTime = activities.reduce((sum, a) => sum + a.durationMs, 0)
  const hours = Math.round((totalTime / (1000 * 60 * 60)) * 10) / 10

  // Extract tags and their time
  const tagTime = activities.reduce(
    (acc, a) => {
      if (a.tags) {
        a.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + a.durationMs
        })
      }
      return acc
    },
    {} as Record<string, number>
  )

  const topTag = Object.entries(tagTime).sort(([, a], [, b]) => b - a)[0]

  const insights = [
    `You completed ${activities.length} focused sessions today, totaling ${hours} hours of tracked time.`,
    topTag
      ? `Most time was spent on **${topTag[0]}** activities (${Math.round(topTag[1] / (1000 * 60))} minutes).`
      : '',
    activities.length >= 3
      ? '**Great consistency** with multiple focused sessions!'
      : activities.length >= 1
        ? 'Good start! Consider adding more focused sessions tomorrow.'
        : '',
    hours >= 4
      ? '**Excellent productivity** - you had a highly focused day.'
      : hours >= 2
        ? 'Solid progress today.'
        : 'Consider longer focus sessions tomorrow.',
    'Tomorrow: Try to increase your longest session by 15 minutes for deeper flow states.',
  ].filter(Boolean)

  return insights.join('\n\n')
}

function generateActivitiesHash(activities: any[]): string {
  // Simple hash based on activity count and total time
  const data = activities.map((a) => `${a.title}-${a.durationMs}`).join('|')
  return Buffer.from(data).toString('base64').slice(0, 16)
}
