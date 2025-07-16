import type { Config } from 'drizzle-kit'

export default {
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  driver: 'sqlite',
  dbCredentials: {
    url: './local.db'
  }
} satisfies Config