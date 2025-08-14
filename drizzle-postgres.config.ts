import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema-postgres.ts',
  out: './drizzle-postgres',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})