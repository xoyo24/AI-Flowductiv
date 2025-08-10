import type {
  Activity,
  HealthStatus,
  RouterResponse,
  SupportedProvider,
  UsageStats,
} from '~/types/ai'
import { PromptTemplates } from './prompts'
import { ClaudeProvider } from './providers/claude'
import { OpenAIProvider } from './providers/openai'

export class AIRouter {
  private currentProvider: SupportedProvider = 'claude'
  private usageStats: UsageStats = {
    totalTokens: 0,
    requestCount: 0,
    providers: {},
  }

  private providers = {
    claude: ClaudeProvider,
    openai: OpenAIProvider,
  }

  getProvider(): SupportedProvider {
    return this.currentProvider
  }

  setProvider(provider: SupportedProvider): void {
    if (!this.providers[provider]) {
      throw new Error(`Unsupported AI provider: ${provider}`)
    }
    this.currentProvider = provider
  }

  async generateDailySummary(activities: Activity[]): Promise<RouterResponse> {
    if (!activities.length) {
      throw new Error('No activities provided')
    }

    const prompt = PromptTemplates.dailySummary(activities)
    return this.generateWithFallback(prompt, activities)
  }

  async generateChatResponse(
    message: string, 
    reportContext: string, 
    activities: Activity[]
  ): Promise<RouterResponse> {
    if (!message.trim()) {
      throw new Error('No message provided')
    }

    const prompt = PromptTemplates.chatResponse(message, reportContext, activities)
    return this.generateWithFallback(prompt, activities)
  }

  private async generateWithFallback(
    prompt: string,
    activities: Activity[]
  ): Promise<RouterResponse> {
    const providers = Object.keys(this.providers) as SupportedProvider[]
    const primaryProvider = this.currentProvider

    // Try primary provider first
    try {
      const result = await this.providers[primaryProvider].generate(prompt, activities)
      this.trackUsage(primaryProvider, result.usage)

      return {
        content: result.content,
        provider: primaryProvider,
        usage: result.usage,
      }
    } catch (error) {
      console.warn(`Primary provider ${primaryProvider} failed:`, error)

      // Try fallback providers
      for (const provider of providers) {
        if (provider === primaryProvider) continue

        try {
          const result = await this.providers[provider].generate(prompt, activities)
          this.trackUsage(provider, result.usage)

          return {
            content: result.content,
            provider,
            usage: result.usage,
          }
        } catch (fallbackError) {
          console.warn(`Fallback provider ${provider} failed:`, fallbackError)
        }
      }

      throw new Error('All AI providers failed')
    }
  }

  async checkProviderHealth(provider: SupportedProvider): Promise<HealthStatus> {
    try {
      if (!this.providers[provider]) {
        return {
          available: false,
          error: `Unsupported provider: ${provider}`,
        }
      }

      return await this.providers[provider].healthCheck()
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private trackUsage(provider: SupportedProvider, usage: any): void {
    const tokens =
      (usage.input_tokens || usage.prompt_tokens || 0) +
      (usage.output_tokens || usage.completion_tokens || 0)

    this.usageStats.totalTokens += tokens
    this.usageStats.requestCount += 1

    if (!this.usageStats.providers[provider]) {
      this.usageStats.providers[provider] = { tokens: 0, requests: 0 }
    }

    this.usageStats.providers[provider].tokens += tokens
    this.usageStats.providers[provider].requests += 1
  }

  getUsageStats(): UsageStats {
    return { ...this.usageStats }
  }

  resetUsageStats(): void {
    this.usageStats = {
      totalTokens: 0,
      requestCount: 0,
      providers: {},
    }
  }
}
