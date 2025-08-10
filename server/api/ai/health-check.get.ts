import { AIRouter } from '~/services/ai/aiRouter'
import type { SupportedProvider } from '~/types/ai'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const provider = query.provider as SupportedProvider | undefined

    const router = new AIRouter()

    if (provider) {
      // Check specific provider
      const status = await router.checkProviderHealth(provider)
      return {
        provider,
        status
      }
    }

    // Check all providers
    const providers: SupportedProvider[] = ['claude', 'openai', 'gemini', 'ollama']
    const results = await Promise.all(
      providers.map(async (p) => ({
        provider: p,
        status: await router.checkProviderHealth(p)
      }))
    )

    return {
      providers: results.reduce((acc, { provider: p, status }) => {
        acc[p] = status
        return acc
      }, {} as Record<SupportedProvider, any>)
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }
})