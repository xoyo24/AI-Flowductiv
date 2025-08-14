import { createId } from '@paralleldrive/cuid2'
import { integer, pgTable, text, timestamp, jsonb, serial } from 'drizzle-orm/pg-core'

// Activities table - core time tracking data (PostgreSQL version)
export const activities = pgTable('activities', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  durationMs: integer('duration_ms').notNull(),
  startTime: timestamp('start_time', { mode: 'date' }).notNull(),
  endTime: timestamp('end_time', { mode: 'date' }).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),
  priority: integer('priority'),
  focusRating: integer('focus_rating'),
  energyLevel: text('energy_level'),
  userId: text('user_id'), // Optional for demo mode
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow(),
})

// AI summaries table - cached AI analysis (PostgreSQL version)
export const aiSummaries = pgTable('ai_summaries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  date: text('date').notNull(), // YYYY-MM-DD format
  content: text('content').notNull(),
  provider: text('provider').notNull(),
  activitiesHash: text('activities_hash').notNull(),
  tokensUsed: integer('tokens_used'),
  generatedAt: timestamp('generated_at', { mode: 'date' })
    .notNull()
    .defaultNow(),
})

// Goals table - user productivity goals (PostgreSQL version)
export const goals = pgTable('goals', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'daily_time', 'weekly_time', 'activity_count'
  targetValue: integer('target_value').notNull(),
  timeframe: text('timeframe').notNull(), // 'daily', 'weekly', 'monthly'
  tags: jsonb('tags').$type<string[]>().default([]),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  priority: integer('priority').default(1),
  userId: text('user_id'), // Optional for demo mode
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow(),
})

// Favorite tags table - user's preferred tags (PostgreSQL version)
export const favoriteTags = pgTable('favorite_tags', {
  id: serial('id').primaryKey(),
  tag: text('tag').notNull().unique(),
  userId: text('user_id'), // Optional for demo mode
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .defaultNow(),
})

// Type exports for TypeScript
export type Activity = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert
export type AiSummary = typeof aiSummaries.$inferSelect  
export type NewAiSummary = typeof aiSummaries.$inferInsert
export type Goal = typeof goals.$inferSelect
export type NewGoal = typeof goals.$inferInsert
export type FavoriteTag = typeof favoriteTags.$inferSelect
export type NewFavoriteTag = typeof favoriteTags.$inferInsert