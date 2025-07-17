import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// Create database connection
const sqlite = new Database('./local.db')

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })

export * from './schema'
