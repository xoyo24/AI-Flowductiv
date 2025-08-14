import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// For now, keep using SQLite for both dev and prod to avoid complexity
// TODO: Switch to PostgreSQL when deploying to production with environment setup

// Create database connection
const sqlite = new Database('./local.db')

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

export * from './schema'
