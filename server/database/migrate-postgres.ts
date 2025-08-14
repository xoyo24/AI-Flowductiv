import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for PostgreSQL migration')
}

// Connection for migrations (single connection)
const migrationClient = postgres(connectionString, { max: 1 })
const db = drizzle(migrationClient)

async function runMigration() {
  console.log('⏳ Running PostgreSQL migrations...')
  
  try {
    await migrate(db, { migrationsFolder: './drizzle-postgres' })
    console.log('✅ PostgreSQL migrations completed successfully')
  } catch (error) {
    console.error('❌ PostgreSQL migration failed:', error)
    throw error
  } finally {
    await migrationClient.end()
  }
}

// Run migrations if this file is executed directly
if (import.meta.main) {
  runMigration()
    .then(() => {
      console.log('🚀 Database ready for production!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export default runMigration