import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, './'),
      '@': resolve(__dirname, './'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'composables/**/*.test.ts',
      'services/**/*.test.ts',
      'components/**/*.test.ts',  // Vue component unit tests
      'server/utils/focusTimeUtils.test.ts'  // Only pure utility functions, not database-dependent ones
    ],
    env: {
      NODE_ENV: 'test',
    },
  },
})