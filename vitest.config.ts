import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**/*.test.ts'], // E2E tests use Playwright, not Vitest
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: ':memory:',
      NUXT_API_BASE_URL: 'http://localhost:3001',
    },
  },
})
