import type { SupportedProvider, UsageStats } from '~/types/ai'

interface AISettings {
  enabled: boolean
  provider: SupportedProvider
  fallbackToMock: boolean
  costTracking: boolean
  monthlyCostLimit: number
  preferredProviderOrder: SupportedProvider[]
}

interface ProviderCostInfo {
  provider: SupportedProvider
  inputTokenCost: number // per 1K tokens
  outputTokenCost: number // per 1K tokens
  currency: string
  tier: 'free' | 'paid'
}

interface ProviderStatus {
  provider: SupportedProvider
  available: boolean
  lastChecked: number
  error?: string
  estimatedCost?: number
  responseTime?: number
}

export const useAISettings = () => {
  // Reactive settings with localStorage persistence
  const settings = useLocalStorage<AISettings>('ai-settings', {
    enabled: true,
    provider: 'claude' as SupportedProvider,
    fallbackToMock: true,
    costTracking: true,
    monthlyCostLimit: 10.0, // Default $10/month
    preferredProviderOrder: ['claude', 'openai'],
  })

  // Usage statistics
  const usageStats = useLocalStorage<UsageStats>('ai-usage-stats', {
    totalTokens: 0,
    requestCount: 0,
    providers: {},
  })

  // Monthly cost tracking
  const monthlyCosts = useLocalStorage<Record<string, number>>('ai-monthly-costs', {})

  // Provider cost information
  const providerCostInfo = ref<Record<SupportedProvider, ProviderCostInfo>>({
    claude: {
      provider: 'claude',
      inputTokenCost: 0.008, // $8 per 1M tokens
      outputTokenCost: 0.024, // $24 per 1M tokens
      currency: 'USD',
      tier: 'paid',
    },
    openai: {
      provider: 'openai',
      inputTokenCost: 0.0025, // $2.5 per 1M tokens (GPT-4 Turbo)
      outputTokenCost: 0.01, // $10 per 1M tokens
      currency: 'USD',
      tier: 'paid',
    },
    gemini: {
      provider: 'gemini',
      inputTokenCost: 0.00125, // $1.25 per 1M tokens
      outputTokenCost: 0.005, // $5 per 1M tokens
      currency: 'USD',
      tier: 'paid',
    },
    ollama: {
      provider: 'ollama',
      inputTokenCost: 0, // Free local inference
      outputTokenCost: 0,
      currency: 'USD',
      tier: 'free',
    },
  })

  // Provider health status
  const providerStatus = ref<Record<SupportedProvider, ProviderStatus>>({
    claude: { provider: 'claude', available: true, lastChecked: 0 },
    openai: { provider: 'openai', available: true, lastChecked: 0 },
    gemini: { provider: 'gemini', available: false, lastChecked: 0 },
    ollama: { provider: 'ollama', available: false, lastChecked: 0 },
  })

  // Computed for easy access
  const isEnabled = computed(() => Boolean(settings.value?.enabled))
  const currentProvider = computed(() => settings.value?.provider || 'claude')
  const canFallback = computed(() => Boolean(settings.value?.fallbackToMock))
  const isCostTrackingEnabled = computed(() => Boolean(settings.value?.costTracking))
  const monthlyLimit = computed(() => Number(settings.value?.monthlyCostLimit || 10))

  // Cost calculations
  const getCurrentMonthKey = (): string => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const currentMonthCost = computed((): number => {
    const monthKey = getCurrentMonthKey()
    return Number(monthlyCosts.value[monthKey] || 0)
  })

  const remainingBudget = computed((): number => {
    const limit = Number(monthlyLimit.value || 10)
    const current = Number(currentMonthCost.value || 0)
    return Math.max(0, limit - current)
  })

  const budgetUtilization = computed((): number => {
    const limit = Number(monthlyLimit.value || 10)
    const current = Number(currentMonthCost.value || 0)
    if (limit <= 0) return 0
    return (current / limit) * 100
  })

  const calculateEstimatedCost = (provider: SupportedProvider, inputTokens: number, outputTokens: number): number => {
    const costInfo = providerCostInfo.value[provider]
    if (!costInfo) return 0
    
    const inputCost = (inputTokens / 1000) * costInfo.inputTokenCost
    const outputCost = (outputTokens / 1000) * costInfo.outputTokenCost
    return inputCost + outputCost
  }

  const getCostPerRequest = (provider: SupportedProvider): number => {
    // Estimated cost per typical request (based on average token usage)
    const avgInputTokens = 800 // Typical daily summary prompt
    const avgOutputTokens = 300 // Typical response length
    return calculateEstimatedCost(provider, avgInputTokens, avgOutputTokens)
  }

  // Provider management
  const setProvider = (provider: SupportedProvider) => {
    settings.value.provider = provider
  }

  const toggleEnabled = () => {
    settings.value.enabled = !settings.value.enabled
  }

  const setEnabled = (enabled: boolean) => {
    settings.value.enabled = enabled
  }

  const toggleFallback = () => {
    settings.value.fallbackToMock = !settings.value.fallbackToMock
  }

  const toggleCostTracking = () => {
    settings.value.costTracking = !settings.value.costTracking
  }

  const setMonthlyLimit = (limit: number) => {
    settings.value.monthlyCostLimit = Math.max(0, limit)
  }

  const setPreferredProviderOrder = (order: SupportedProvider[]) => {
    settings.value.preferredProviderOrder = order
  }

  const trackUsage = (provider: SupportedProvider, inputTokens: number, outputTokens: number) => {
    if (!isCostTrackingEnabled.value) return

    // Update usage stats
    const totalTokens = inputTokens + outputTokens
    usageStats.value.totalTokens += totalTokens
    usageStats.value.requestCount += 1

    if (!usageStats.value.providers[provider]) {
      usageStats.value.providers[provider] = { tokens: 0, requests: 0 }
    }

    usageStats.value.providers[provider].tokens += totalTokens
    usageStats.value.providers[provider].requests += 1

    // Update monthly costs
    const cost = calculateEstimatedCost(provider, inputTokens, outputTokens)
    const monthKey = getCurrentMonthKey()
    monthlyCosts.value[monthKey] = (monthlyCosts.value[monthKey] || 0) + cost
  }

  // Provider health checks
  const checkProviderHealth = async (provider: SupportedProvider): Promise<boolean> => {
    try {
      const startTime = Date.now()
      
      // Use the API endpoint to perform actual health check
      const response = await $fetch<{
        provider: SupportedProvider,
        status: {
          available: boolean,
          latency?: number,
          error?: string
        }
      }>(`/api/ai/health-check?provider=${provider}`)

      const responseTime = Date.now() - startTime

      // Update status
      providerStatus.value[provider] = {
        provider,
        available: response.status.available,
        lastChecked: Date.now(),
        ...(response.status.error && { error: response.status.error }),
        responseTime: response.status.latency || responseTime,
      }

      return response.status.available
    } catch (error) {
      providerStatus.value[provider] = {
        provider,
        available: false,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Network error - unable to reach API',
      }

      return false
    }
  }

  const checkAllProviders = async () => {
    const providers: SupportedProvider[] = ['claude', 'openai', 'gemini', 'ollama']
    await Promise.all(providers.map(provider => checkProviderHealth(provider)))
  }

  const getBestProvider = (): SupportedProvider => {
    // If budget exceeded, prefer free providers
    if (budgetUtilization.value >= 100) {
      const freeProviders = settings.value.preferredProviderOrder.filter(
        provider => providerCostInfo.value[provider]?.tier === 'free' && 
                   providerStatus.value[provider]?.available
      )
      if (freeProviders.length > 0) {
        return freeProviders[0]!
      }
    }

    // Otherwise, use preferred order with availability check
    for (const provider of settings.value.preferredProviderOrder) {
      if (providerStatus.value[provider]?.available) {
        return provider
      }
    }

    // Fallback to first available provider
    const availableProvider = Object.values(providerStatus.value)
      .find(status => status.available)?.provider

    return availableProvider || 'claude'
  }

  const getProvidersSortedByCost = (): SupportedProvider[] => {
    const providers = Object.keys(providerCostInfo.value) as SupportedProvider[]
    return providers.sort((a, b) => {
      const costA = getCostPerRequest(a)
      const costB = getCostPerRequest(b)
      return costA - costB
    })
  }

  // Get current provider status
  const getCurrentProviderStatus = computed(() => {
    const provider = currentProvider.value || 'claude'
    return providerStatus.value[provider] || { 
      provider, 
      available: false, 
      lastChecked: 0 
    }
  })

  // Get available providers
  const availableProviders = computed(() => {
    return Object.values(providerStatus.value)
      .filter((status) => status.available)
      .map((status) => status.provider)
  })

  // Auto-switch to available provider if current is unavailable
  const ensureProviderAvailable = async () => {
    await checkProviderHealth(currentProvider.value)

    if (!getCurrentProviderStatus.value.available && availableProviders.value.length > 0) {
      const firstAvailable = availableProviders.value[0]
      if (firstAvailable) {
        setProvider(firstAvailable)
      }
    }
  }

  // Provider display names and information
  const getProviderDisplayName = (provider: SupportedProvider): string => {
    const names = {
      claude: 'Claude (Anthropic)',
      openai: 'GPT-4 (OpenAI)',
      gemini: 'Gemini (Google)',
      ollama: 'Ollama (Local)',
    }
    return names[provider] || provider
  }

  const getProviderBadge = (provider: SupportedProvider): { text: string; color: string } => {
    const costInfo = providerCostInfo.value[provider]
    if (!costInfo) return { text: 'Unknown', color: 'gray' }
    
    if (costInfo.tier === 'free') {
      return { text: 'Free', color: 'green' }
    }
    
    const cost = getCostPerRequest(provider)
    if (cost < 0.001) {
      return { text: '< $0.001', color: 'green' }
    } else if (cost < 0.01) {
      return { text: `$${cost.toFixed(3)}`, color: 'yellow' }
    } else {
      return { text: `$${cost.toFixed(3)}`, color: 'red' }
    }
  }

  const resetMonthlyUsage = () => {
    const monthKey = getCurrentMonthKey()
    monthlyCosts.value[monthKey] = 0
    
    // Reset usage stats for current month
    usageStats.value = {
      totalTokens: 0,
      requestCount: 0,
      providers: {},
    }
  }

  // Initialize on mount
  onMounted(() => {
    // Check provider health on startup
    if (typeof window !== 'undefined') {
      checkAllProviders()
    }
  })

  return {
    // Settings
    settings: readonly(settings),
    isEnabled,
    currentProvider,
    canFallback,
    isCostTrackingEnabled,
    monthlyLimit,

    // Cost tracking
    usageStats: readonly(usageStats),
    monthlyCosts: readonly(monthlyCosts),
    currentMonthCost,
    remainingBudget,
    budgetUtilization,
    providerCostInfo: readonly(providerCostInfo),

    // Actions
    setProvider,
    toggleEnabled,
    setEnabled,
    toggleFallback,
    toggleCostTracking,
    setMonthlyLimit,
    setPreferredProviderOrder,
    trackUsage,
    resetMonthlyUsage,

    // Health checks
    providerStatus: readonly(providerStatus),
    getCurrentProviderStatus,
    availableProviders,
    checkProviderHealth,
    checkAllProviders,
    ensureProviderAvailable,

    // Cost-aware provider selection
    getBestProvider,
    getProvidersSortedByCost,
    calculateEstimatedCost,
    getCostPerRequest,

    // Utils
    getProviderDisplayName,
    getProviderBadge,
  }
}
