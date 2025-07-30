import { eq, like } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/server/database'
import { activities, users } from '~/server/database/schema'

const RenameTagSchema = z.object({
  oldName: z.string().min(1, 'Old tag name is required').trim(),
  newName: z.string().min(1, 'New tag name is required').trim()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { oldName, newName } = RenameTagSchema.parse(body)

    if (oldName === newName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New tag name must be different from old name'
      })
    }

    // Check if new tag name already exists in any activity
    const existingActivities = await db
      .select()
      .from(activities)
      .where(like(activities.tags, `%"${newName}"%`))
      .limit(1)

    if (existingActivities.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Tag already exists'
      })
    }

    // Get all activities that contain the old tag
    const activitiesToUpdate = await db
      .select()
      .from(activities)
      .where(like(activities.tags, `%"${oldName}"%`))

    let updatedCount = 0

    // Update each activity's tags
    for (const activity of activitiesToUpdate) {
      const currentTags = activity.tags || []
      const tagIndex = currentTags.indexOf(oldName)
      
      if (tagIndex !== -1) {
        const updatedTags = [...currentTags]
        updatedTags[tagIndex] = newName

        await db
          .update(activities)
          .set({
            tags: updatedTags,
            updatedAt: new Date()
          })
          .where(eq(activities.id, activity.id))

        updatedCount++
      }
    }

    // Update favorite tags if old tag was a favorite
    const userId = 'demo-user'
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user.length > 0) {
      const currentFavorites = user[0].preferences?.favoriteTags || []
      const favoriteIndex = currentFavorites.indexOf(oldName)
      
      if (favoriteIndex !== -1) {
        const updatedFavorites = [...currentFavorites]
        updatedFavorites[favoriteIndex] = newName

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
        success: true, 
        updatedActivities: updatedCount 
      } 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.errors[0].message
      })
    }

    console.error('Failed to rename tag:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to rename tag'
    })
  }
})