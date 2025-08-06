import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '~/server/database'
import { users } from '~/server/database/schema'

export default defineEventHandler(async (_event) => {
  try {
    // For demo mode, use a hardcoded user ID
    const userId = 'demo-user'

    // Get user preferences containing favorite tags
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!user.length) {
      // Create demo user if doesn't exist
      await db.insert(users).values({
        id: userId,
        name: 'Demo User',
        preferences: {
          favoriteTags: [],
        },
      })

      return { data: [] }
    }

    const favoriteTags = user[0].preferences?.favoriteTags || []

    return { data: favoriteTags }
  } catch (error) {
    console.error('Failed to fetch favorite tags:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch favorite tags',
    })
  }
})
