import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import type { Activity, AIResponse, HealthStatus } from '~/types/ai'
import { PromptTemplates } from '../prompts'

export class ClaudeProvider {
  private static getApiKey(): string {
    const config = useRuntimeConfig()
    const apiKey = config.anthropicApiKey
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }
    return apiKey
  }

  static async generate(prompt: string, activities: Activity[]): Promise<AIResponse> {
    try {
      const apiKey = this.getApiKey()
      
      // Format activities into the prompt
      const formattedPrompt = activities.length > 0 
        ? `${prompt}\n\nActivities:\n${activities.map(activity => {
            const duration = PromptTemplates.formatDuration(activity.durationMs)
            const tags = activity.tags.length > 0 ? ` #${activity.tags.join(' #')}` : ''
            return `- ${activity.title}${tags} (${duration})`
          }).join('\n')}`
        : prompt

      const anthropic = createAnthropic({
        apiKey
      })
      const model = anthropic('claude-3-5-sonnet-20241022')

      const result = await generateText({
        model,
        prompt: formattedPrompt,
        maxTokens: 1000,
        temperature: 0.7
      })

      return {
        content: result.text,
        usage: {
          input_tokens: result.usage.promptTokens,
          output_tokens: result.usage.completionTokens
        }
      }
    } catch (error) {
      throw new Error(`Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      const apiKey = this.getApiKey()
      const anthropic = createAnthropic({ apiKey })
      const model = anthropic('claude-3-5-sonnet-20241022')

      await generateText({
        model,
        prompt: 'Health check - respond with "OK"',
        maxTokens: 10
      })

      const latency = Date.now() - startTime
      return {
        available: true,
        latency
      }
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}