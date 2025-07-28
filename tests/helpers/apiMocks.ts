import { vi } from 'vitest'

/**
 * Simple API mocking utilities following Vue Test Utils best practices
 * Use vi.spyOn() for focused, predictable mocks without reimplementing API logic
 */

export const setupApiMocks = () => {
  // Access the $fetch mock from global config (setup.ts)
  // @ts-ignore - globalThis.$fetch is mocked in setup
  const mockFetch = globalThis.$fetch as any

  return {
    mockFetch,

    // Mock successful responses with simple, predictable data
    mockSuccess: (responseData: any) => {
      mockFetch.mockResolvedValue(responseData)
    },

    // Mock error responses
    mockError: (error = new Error('API Error')) => {
      mockFetch.mockRejectedValue(error)
    },

    // Mock specific API endpoints with different responses
    mockEndpoint: (url: string, method: string, response: any) => {
      mockFetch.mockImplementation(async (requestUrl, options = {}) => {
        const requestMethod = options.method || 'GET'
        if (requestUrl === url && requestMethod === method) {
          return response
        }
        // Default fallback
        return { data: [] }
      })
    },

    // Reset all mocks
    reset: () => {
      mockFetch.mockReset()
    },

    // Restore mocks (handled by Vue Test Utils setup)
    restore: () => {
      mockFetch.mockRestore()
    },
  }
}
