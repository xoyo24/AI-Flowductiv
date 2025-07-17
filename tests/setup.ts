import { vi } from 'vitest'

// Mock Nuxt composables
vi.mock('#app', () => ({
  useNuxtApp: () => ({}),
  navigateTo: vi.fn(),
  useCookie: vi.fn(),
  useRuntimeConfig: () => ({
    public: {},
  }),
}))

// Mock Vue composables that are auto-imported
global.ref = vi.fn()
global.reactive = vi.fn()
global.computed = vi.fn()
global.readonly = vi.fn()
global.watch = vi.fn()
global.watchEffect = vi.fn()
global.onMounted = vi.fn()
global.onUnmounted = vi.fn()
global.nextTick = vi.fn()

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
