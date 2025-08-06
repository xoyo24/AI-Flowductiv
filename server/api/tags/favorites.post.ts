import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/server/database'
import { users } from '~/server/database/schema'

const AddFavoriteSchema = z.object({
  tagName: z.string().min(1, 'Tag name is required').trim(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { tagName } = AddFavoriteSchema.parse(body)

    // For demo mode, use a hardcoded user ID
    const userId = 'demo-user'

    // Get current user preferences
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    let currentFavorites: string[] = []

    if (user.length > 0) {
      currentFavorites = user[0].preferences?.favoriteTags || []
    } else {
      // Create demo user if doesn't exist
      await db.insert(users).values({
        id: userId,
        name: 'Demo User',
        preferences: {
          favoriteTags: [],
        },
      })
    }

    // Add tag if not already a favorite
    if (!currentFavorites.includes(tagName)) {
      currentFavorites.push(tagName)

      // Update user preferences
      await db
        .update(users)
        .set({
          preferences: {
            ...(user[0]?.preferences || {}),
            favoriteTags: currentFavorites,
          },
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    }

    return { data: { success: true } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.errors[0].message,
      })
    }

    console.error('Failed to add favorite tag:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add favorite tag',
    })
  }
})
