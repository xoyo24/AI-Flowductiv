import { eq, like } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/server/database'
import { activities, users } from '~/server/database/schema'

const RemoveTagSchema = z.object({
  tagName: z.string().min(1, 'Tag name is required').trim(),
  deleteActivities: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { tagName, deleteActivities } = RemoveTagSchema.parse(body)

    // Get all activities that contain the tag
    const activitiesToProcess = await db
      .select()
      .from(activities)
      .where(like(activities.tags, `%"${tagName}"%`))

    let updatedActivities = 0
    let deletedActivities = 0

    for (const activity of activitiesToProcess) {
      const currentTags = activity.tags || []
      const hasTag = currentTags.includes(tagName)
      
      if (!hasTag) continue

      const remainingTags = currentTags.filter(tag => tag !== tagName)

      if (deleteActivities && remainingTags.length === 0) {
        // Delete activity if it only had this tag and deleteActivities is true
        await db
          .delete(activities)
          .where(eq(activities.id, activity.id))
        
        deletedActivities++
      } else {
        // Remove tag from activity
        await db
          .update(activities)
          .set({
            tags: remainingTags,
            updatedAt: new Date()
          })
          .where(eq(activities.id, activity.id))
        
        updatedActivities++
      }
    }

    // Remove tag from favorites if it was a favorite
    const userId = 'demo-user'
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user.length > 0) {
      const currentFavorites = user[0].preferences?.favoriteTags || []
      const updatedFavorites = currentFavorites.filter(tag => tag !== tagName)

      if (updatedFavorites.length !== currentFavorites.length) {
        await db
          .update(users)
          .set({
            preferences: {
              ...user[0].preferences || {},
              favoriteTags: updatedFavorites
            },
            updatedAt: new Date()
          })
          .where(eq(users.id, userId))
      }
    }

    return { 
      data: { 
        updatedActivities,
        deletedActivities,
        removedFromActivities: true
      } 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.errors[0].message
      })
    }

    console.error('Failed to remove tag:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove tag'
    })
  }
})