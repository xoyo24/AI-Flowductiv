import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { Activity, AIResponse, HealthStatus } from '~/types/ai'
import { PromptTemplates } from '../prompts'

export class OpenAIProvider {
  private static getApiKey(): string {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required')
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

      const model = openai('gpt-4-turbo', {
        apiKey
      })

      const result = await generateText({
        model,
        prompt: formattedPrompt,
        maxTokens: 1000,
        temperature: 0.7
      })

      return {
        content: result.text,
        usage: {
          prompt_tokens: result.usage.promptTokens,
          completion_tokens: result.usage.completionTokens
        }
      }
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now()
    
    try {
      const apiKey = this.getApiKey()
      const model = openai('gpt-4-turbo', { apiKey })

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