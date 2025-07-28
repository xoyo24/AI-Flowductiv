import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'server/api/**/*.test.ts', // API endpoint tests (need Nuxt env)
      'server/utils/focusTimeCalculator.test.ts', // Database integration tests
      'server/utils/rateLimitEdgeCases.test.ts', // Database integration tests
      'components/**/*.test.ts', // Component integration tests (need Nuxt env)
      'tests/integration/**/*.test.ts', // Legacy integration tests
    ],
    exclude: ['tests/e2e/**/*.test.ts'], // E2E tests use Playwright, not Vitest
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: ':memory:',
      NUXT_API_BASE_URL: 'http://localhost:3001',
    },
  },
})
