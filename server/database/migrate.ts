import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import Database from 'better-sqlite3'
import path from 'path'

// Create database connection
const sqlite = new Database('./local.db')

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL')

const db = drizzle(sqlite)

async function runMigrations() {
  try {
    console.log('Running database migrations...')
    
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), 'server/database/migrations')
    })
    
    console.log('✅ Database migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()