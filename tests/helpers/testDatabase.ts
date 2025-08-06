import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { activities } from '~/server/database/schema'
import type { NewActivity } from '~/types'

// Test database instance
let testDb: ReturnType<typeof drizzle> | null = null
let testDbInstance: Database.Database | null = null

/**
 * Initialize test database with clean schema
 */
export async function setupTestDatabase() {
  if (testDb) return testDb

  // Create in-memory SQLite database for tests
  testDbInstance = new Database(':memory:')
  testDb = drizzle(testDbInstance)

  // Run migrations to set up schema
  try {
    await migrate(testDb, { migrationsFolder: './drizzle' })
  } catch (_error) {
    // If migrations folder doesn't exist, create tables manually
    testDbInstance.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        duration_ms INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        tags TEXT,
        priority INTEGER,
        focus_rating INTEGER,
        energy_level INTEGER,
        user_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  return testDb
}

/**
 * Clean up test database after tests
 */
export async function cleanupTestDatabase() {
  if (testDb && testDbInstance) {
    await testDb.delete(activities).execute()
  }
}

/**
 * Get test database instance
 */
export function getTestDatabase() {
  if (!testDb) {
    throw new Error('Test database not initialized. Call setupTestDatabase() first.')
  }
  return testDb
}

/**
 * Close test database connection
 */
export async function closeTestDatabase() {
  if (testDbInstance) {
    testDbInstance.close()
    testDb = null
    testDbInstance = null
  }
}

/**
 * Seed test database with sample activities
 */
export async function seedTestActivities(customActivities?: Partial<NewActivity>[]) {
  const db = getTestDatabase()

  const defaultActivities: NewActivity[] = [
    {
      id: 'test-1',
      title: 'Work on project',
      description: 'Test description',
      durationMs: 1800000, // 30 minutes
      startTime: new Date('2023-12-01T10:00:00Z'),
      endTime: new Date('2023-12-01T10:30:00Z'),
      tags: ['work', 'project'],
      priority: 2,
      focusRating: 8,
      userId: null,
    },
    {
      id: 'test-2',
      title: 'Team meeting',
      description: 'Weekly sync',
      durationMs: 3600000, // 60 minutes
      startTime: new Date('2023-12-01T14:00:00Z'),
      endTime: new Date('2023-12-01T15:00:00Z'),
      tags: ['meeting', 'team'],
      priority: 1,
      focusRating: 6,
      userId: null,
    },
    {
      id: 'test-3',
      title: 'Code review',
      description: 'Review pull requests',
      durationMs: 900000, // 15 minutes
      startTime: new Date('2023-12-01T16:00:00Z'),
      endTime: new Date('2023-12-01T16:15:00Z'),
      tags: ['code', 'review'],
      priority: 3,
      focusRating: 9,
      userId: null,
    },
  ]

  const activitiesToSeed = customActivities
    ? customActivities.map((custom, index) => ({
        ...defaultActivities[index % defaultActivities.length],
        ...custom,
        id: custom.id || `test-custom-${index}`,
      }))
    : defaultActivities

  // Insert test activities
  for (const activity of activitiesToSeed) {
    await db.insert(activities).values(activity).execute()
  }

  return activitiesToSeed
}

/**
 * Configure environment for integration tests
 */
export function setupTestEnvironment() {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = ':memory:'
  process.env.NUXT_API_BASE_URL = 'http://localhost:3001' // Test server port
}

/**
 * Reset test environment after tests
 */
export function resetTestEnvironment() {
  process.env.DATABASE_URL = undefined
  process.env.NUXT_API_BASE_URL = undefined
}
