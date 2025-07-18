import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Configure Vue Test Utils for Nuxt
config.global.mocks = {
  $fetch: vi.fn(),
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
  },
  $route: {
    params: {},
    query: {},
    path: '/',
  },
}

// Mock Nuxt composables
vi.mock('#app', () => ({
  useNuxtApp: () => ({}),
  navigateTo: vi.fn(),
  useCookie: vi.fn(),
  useRuntimeConfig: () => ({
    public: {},
  }),
}))

// Don't mock Vue composables when using Vue Test Utils
// Vue Test Utils needs real Vue reactivity system

// Mock browser APIs
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
})

Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
})

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
}
