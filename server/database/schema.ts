import { createId } from '@paralleldrive/cuid2'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Activities table - core time tracking data
export const activities = sqliteTable('activities', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  durationMs: integer('duration_ms').notNull(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }).notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default('[]'),
  priority: integer('priority'),
  focusRating: integer('focus_rating'),
  energyLevel: text('energy_level'),
  userId: text('user_id'), // Optional for demo mode
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// AI summaries table - cached AI analysis
export const aiSummaries = sqliteTable('ai_summaries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  date: text('date').notNull(), // YYYY-MM-DD format
  content: text('content').notNull(),
  provider: text('provider').notNull(), // claude, openai, gemini, ollama
  activitiesHash: text('activities_hash').notNull(), // Hash of activities for cache invalidation
  tokensUsed: integer('tokens_used'),
  generatedAt: integer('generated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  userId: text('user_id'), // Optional for demo mode
})

// Users table - basic user management
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text('email').unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  preferences: text('preferences', { mode: 'json' })
    .$type<{
      aiProvider?: string
      theme?: string
      privacyLevel?: 'local' | 'encrypted' | 'cloud'
      defaultTags?: string[]
      favoriteTags?: string[]
    }>()
    .default('{}'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// Goals table - user productivity goals and targets
export const goals = sqliteTable('goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'time', 'activity_count', 'streak', 'focus_rating'
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly'
  target: real('target').notNull(), // Target value (hours, count, etc.)
  targetUnit: text('target_unit'), // 'hours', 'activities', 'days', 'rating'
  status: text('status').notNull().default('active'), // 'active', 'completed', 'paused', 'archived'
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default('[]'), // Filter by tags
  priority: integer('priority'), // Filter by priority level
  userId: text('user_id'), // Optional for demo mode
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

// Export types for use in application
export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
export type AISummary = typeof aiSummaries.$inferSelect
export type NewAISummary = typeof aiSummaries.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
