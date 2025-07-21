export interface Activity {
  title: string
  durationMs: number
  tags: string[]
}

export interface AIResponse {
  content: string
  usage: {
    input_tokens?: number
    output_tokens?: number
    prompt_tokens?: number
    completion_tokens?: number
  }
}

export interface AIProvider {
  generate(prompt: string, activities: Activity[]): Promise<AIResponse>
  healthCheck(): Promise<HealthStatus>
}

export interface HealthStatus {
  available: boolean
  latency?: number
  error?: string
}

export interface UsageStats {
  totalTokens: number
  requestCount: number
  providers: Record<string, {
    tokens: number
    requests: number
  }>
}

export type SupportedProvider = 'claude' | 'openai' | 'gemini' | 'ollama'

export interface RouterResponse {
  content: string
  provider: SupportedProvider
  usage: AIResponse['usage']
}