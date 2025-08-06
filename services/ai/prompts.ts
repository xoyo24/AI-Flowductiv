import type { Activity } from '~/types/ai'

export class PromptTemplates {
  static dailySummary(activities: Activity[]): string {
    if (!activities.length) {
      throw new Error('No activities provided for daily summary')
    }

    const totalDuration = PromptTemplates.getTotalDuration(activities)
    const groupedByTags = PromptTemplates.groupByTags(activities)

    const activitiesList = activities
      .map((activity) => {
        const duration = PromptTemplates.formatDuration(activity.durationMs)
        const tags = activity.tags.length > 0 ? ` #${activity.tags.join(' #')}` : ''
        return `- ${activity.title}${tags} (${duration})`
      })
      .join('\n')

    const tagSummary = Object.entries(groupedByTags)
      .map(
        ([tag, duration]) =>
          `${tag.charAt(0).toUpperCase() + tag.slice(1)}: ${PromptTemplates.formatDuration(duration)}`
      )
      .join(', ')

    return `Generate a comprehensive daily productivity summary based on the following activities:

${activitiesList}

Total time: ${PromptTemplates.formatDuration(totalDuration)}
${tagSummary ? `Time by category: ${tagSummary}` : ''}

Please analyze:
1. Productivity patterns and time distribution across different activities
2. Key achievements and insights from the day
3. Suggestions for improvement and optimization
4. Overall productivity assessment

Keep the summary concise but insightful, focusing on actionable insights that can help improve future productivity.`
  }

  static enhanceActivity(activity: Activity): string {
    const duration = PromptTemplates.formatDuration(activity.durationMs)

    return `Please enhance this activity description to make it more specific and actionable:

Activity: "${activity.title}"
Duration: ${duration}
Current tags: ${activity.tags.length > 0 ? activity.tags.join(', ') : 'none'}

Suggest:
1. More descriptive and specific title
2. Relevant tags for better categorization
3. Appropriate priority level (1-3, where 1 is highest)
4. Brief context or notes that would be helpful

Respond in JSON format with: title, tags, priority, notes`
  }

  static formatDuration(durationMs: number): string {
    const totalMinutes = Math.floor(durationMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours === 0) {
      return `${minutes}m`
    }
    if (minutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${minutes}m`
  }

  static getTotalDuration(activities: Activity[]): number {
    return activities.reduce((total, activity) => total + activity.durationMs, 0)
  }

  static groupByTags(activities: Activity[]): Record<string, number> {
    const grouped: Record<string, number> = {}

    activities.forEach((activity) => {
      activity.tags.forEach((tag) => {
        if (!grouped[tag]) {
          grouped[tag] = 0
        }
        grouped[tag] += activity.durationMs
      })
    })

    return grouped
  }
}
