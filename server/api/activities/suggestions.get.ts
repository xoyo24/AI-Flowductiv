import { db } from '~/server/database'
import { activities } from '~/server/database/schema'
import { sql, desc, like, or } from 'drizzle-orm'
import type { ActivitySuggestion } from '~/types/activity'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const rawSearchQuery = (query.q as string) || ''
    const limit = Math.min(Number(query.limit) || 10, 50) // Max 50 suggestions
    
    // Handle tag search - strip # prefix for tag matching
    const isTagSearch = rawSearchQuery.startsWith('#')
    const searchQuery = isTagSearch ? rawSearchQuery.slice(1) : rawSearchQuery

    // Get recent activities for suggestion generation
    const recentActivities = await db
      .select({
        title: activities.title,
        tags: activities.tags,
        startTime: activities.startTime,
      })
      .from(activities)
      .orderBy(desc(activities.startTime))
      .limit(200) // Get recent activities to analyze

    // Extract activity suggestions
    const activitySuggestions = new Map<string, ActivitySuggestion>()
    
    // Extract tag suggestions with frequency counting
    const tagFrequency = new Map<string, { count: number, lastUsed: Date }>()

    // Process activities to build suggestions
    recentActivities.forEach((activity) => {
      const title = activity.title.trim()
      const activityDate = new Date(activity.startTime)

      // Add activity suggestion (skip if doing tag search)
      if (!isTagSearch && title && (!searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase()))) {
        const key = title.toLowerCase()
        if (!activitySuggestions.has(key)) {
          activitySuggestions.set(key, {
            id: `activity-${key.replace(/\s+/g, '-')}`,
            text: title,
            type: 'activity',
            frequency: 1,
            lastUsed: activityDate
          })
        } else {
          const existing = activitySuggestions.get(key)!
          existing.frequency++
          if (activityDate > existing.lastUsed) {
            existing.lastUsed = activityDate
          }
        }
      }

      // Process tags
      if (activity.tags && Array.isArray(activity.tags)) {
        activity.tags.forEach((tag: string) => {
          if (tag && (!searchQuery || tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
            const existing = tagFrequency.get(tag) || { count: 0, lastUsed: new Date(0) }
            existing.count++
            if (activityDate > existing.lastUsed) {
              existing.lastUsed = activityDate
            }
            tagFrequency.set(tag, existing)
          }
        })
      }
    })

    // Convert tag frequency to suggestions
    const tagSuggestions: ActivitySuggestion[] = Array.from(tagFrequency.entries()).map(([tag, data]) => ({
      id: `tag-${tag}`,
      text: tag,
      type: 'tag',
      frequency: data.count,
      lastUsed: data.lastUsed
    }))

    // Combine all suggestions
    const allSuggestions = [
      ...Array.from(activitySuggestions.values()),
      ...tagSuggestions
    ]

    // Sort by relevance (frequency * recency score)
    const now = Date.now()
    const sortedSuggestions = allSuggestions
      .map(suggestion => ({
        ...suggestion,
        score: calculateRelevanceScore(suggestion, now, searchQuery, isTagSearch)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...suggestion }) => suggestion) // Remove score from response

    return {
      data: sortedSuggestions,
      meta: {
        total: sortedSuggestions.length,
        query: searchQuery,
        limit
      }
    }
  } catch (error) {
    console.error('Error fetching activity suggestions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch activity suggestions'
    })
  }
})

/**
 * Calculate relevance score for suggestion ranking
 * Higher score = more relevant
 */
function calculateRelevanceScore(
  suggestion: ActivitySuggestion, 
  now: number, 
  searchQuery: string,
  isTagSearch: boolean = false
): number {
  const dayMs = 24 * 60 * 60 * 1000
  const daysSinceUsed = (now - suggestion.lastUsed.getTime()) / dayMs
  
  // Base frequency score
  let score = suggestion.frequency
  
  // Recency boost (more recent = higher score)
  const recencyMultiplier = Math.max(0.1, 1 - (daysSinceUsed / 30)) // Decay over 30 days
  score *= recencyMultiplier
  
  // Exact match boost
  if (searchQuery && suggestion.text.toLowerCase() === searchQuery.toLowerCase()) {
    score *= 3
  }
  
  // Prefix match boost
  if (searchQuery && suggestion.text.toLowerCase().startsWith(searchQuery.toLowerCase())) {
    score *= 2
  }
  
  // Tag search preference
  if (isTagSearch) {
    // Strongly prefer tag suggestions when doing tag search
    if (suggestion.type === 'tag') {
      score *= 5
    }
  } else {
    // Slight preference for activities in normal search
    if (suggestion.type === 'activity') {
      score *= 1.1
    }
  }
  
  return score
}