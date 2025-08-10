import { AIRouter } from '~/services/ai/aiRouter'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.message || typeof body.message !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message is required',
      })
    }

    if (!body.context) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Context is required for meaningful conversation',
      })
    }

    // Use the AI Router for consistent provider handling
    const aiRouter = new AIRouter()

    try {
      // Generate contextual response based on the report and activities
      const aiResponse = await aiRouter.generateChatResponse(
        body.message,
        body.context.report,
        body.context.activities || []
      )

      return {
        content: aiResponse.content,
        provider: aiResponse.provider,
        usage: {
          tokens: (aiResponse.usage.input_tokens || aiResponse.usage.prompt_tokens || 0) +
                 (aiResponse.usage.output_tokens || aiResponse.usage.completion_tokens || 0)
        }
      }
    } catch (aiError) {
      console.warn('AI chat failed, providing fallback response:', aiError)

      // Fallback response based on the message content
      const fallbackResponse = generateChatFallback(body.message, body.context.activities || [])

      return {
        content: fallbackResponse,
        provider: 'mock-fallback',
        usage: { tokens: 0 }
      }
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('AI Chat error:', error)

    const isDev = process.env.NODE_ENV === 'development'
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process chat message',
      data: {
        error: 'Chat processing failed',
        timestamp: new Date().toISOString(),
        details: isDev && error instanceof Error ? error.message : undefined,
      },
    })
  }
})

function generateChatFallback(message: string, activities: any[]): string {
  const lowerMessage = message.toLowerCase()
  
  // Simple keyword-based responses for common questions
  if (lowerMessage.includes('productivity') || lowerMessage.includes('productive')) {
    const totalHours = activities.reduce((sum, a) => sum + a.durationMs, 0) / (1000 * 60 * 60)
    return `Based on your tracked activities, you've logged ${totalHours.toFixed(1)} hours of focused work. This shows good productivity tracking habits!`
  }
  
  if (lowerMessage.includes('focus') || lowerMessage.includes('concentration')) {
    const ratedActivities = activities.filter(a => a.focusRating !== null && a.focusRating !== undefined)
    if (ratedActivities.length > 0) {
      const avgFocus = ratedActivities.reduce((sum, a) => sum + (a.focusRating || 0), 0) / ratedActivities.length
      return `Your average focus rating is ${avgFocus.toFixed(1)}/5. ${avgFocus >= 4 ? 'Excellent focus!' : avgFocus >= 3 ? 'Good focus levels.' : 'Consider minimizing distractions to improve focus.'}`
    }
    return 'Start rating your activities to track focus patterns over time.'
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('hours')) {
    const totalMinutes = activities.reduce((sum, a) => sum + a.durationMs, 0) / (1000 * 60)
    const avgSession = activities.length > 0 ? totalMinutes / activities.length : 0
    return `You've completed ${activities.length} activities with an average session length of ${avgSession.toFixed(1)} minutes.`
  }
  
  if (lowerMessage.includes('tag') || lowerMessage.includes('category')) {
    const tags = new Set(activities.flatMap(a => a.tags || []))
    if (tags.size > 0) {
      return `You're using ${tags.size} different tags: ${Array.from(tags).slice(0, 5).join(', ')}${tags.size > 5 ? '...' : ''}. This helps categorize your work patterns.`
    }
    return 'Consider adding tags to your activities to better categorize and analyze your work patterns.'
  }
  
  if (lowerMessage.includes('improve') || lowerMessage.includes('better') || lowerMessage.includes('recommendation')) {
    const recommendations = [
      'Try extending your longest sessions by 15-30 minutes to reach deeper focus states.',
      'Consider tracking your energy levels along with focus ratings to identify optimal work times.',
      'Use the priority system (!1-!5) to focus on high-impact activities first.',
      'Add more descriptive tags to better understand your work patterns.'
    ]
    return recommendations[Math.floor(Math.random() * recommendations.length)]
  }
  
  // Default response
  return `I understand you're asking about "${message}". While I can provide insights about your productivity data, I work best when responding to specific questions about focus, time tracking, or productivity patterns. What specific aspect of your work habits would you like to explore?`
}