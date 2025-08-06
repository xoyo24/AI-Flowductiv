import { eq } from 'drizzle-orm'
import { db } from '~/server/database'
import { users } from '~/server/database/schema'

export default defineEventHandler(async (event) => {
  try {
    const tagName = getRouterParam(event, 'tag')

    if (!tagName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tag name is required',
      })
    }

    // For demo mode, use a hardcoded user ID
    const userId = 'demo-user'

    // Get current user preferences
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!user.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    const currentFavorites = user[0].preferences?.favoriteTags || []
    const updatedFavorites = currentFavorites.filter((tag) => tag !== tagName)

    // Update user preferences
    await db
      .update(users)
      .set({
        preferences: {
          ...(user[0].preferences || {}),
          favoriteTags: updatedFavorites,
        },
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return { data: { success: true } }
  } catch (error) {
    console.error('Failed to remove favorite tag:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove favorite tag',
    })
  }
})
