import type { SupportedProvider } from '~/types/ai'

interface AISettings {
  enabled: boolean
  provider: SupportedProvider
  fallbackToMock: boolean
}

interface ProviderStatus {
  provider: SupportedProvider
  available: boolean
  lastChecked: number
  error?: string
}

export const useAISettings = () => {
  // Reactive settings with localStorage persistence
  const settings = useLocalStorage<AISettings>('ai-settings', {
    enabled: true,
    provider: 'claude' as SupportedProvider,
    fallbackToMock: true
  })

  // Provider health status
  const providerStatus = ref<Record<SupportedProvider, ProviderStatus>>({
    claude: { provider: 'claude', available: true, lastChecked: 0 },
    openai: { provider: 'openai', available: true, lastChecked: 0 }
  })

  // Computed for easy access
  const isEnabled = computed(() => settings.value.enabled)
  const currentProvider = computed(() => settings.value.provider)
  const canFallback = computed(() => settings.value.fallbackToMock)

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

  // Provider health checks
  const checkProviderHealth = async (provider: SupportedProvider): Promise<boolean> => {
    try {
      // Simple health check - attempt to create AIRouter instance
      const { AIRouter } = await import('~/services/ai/aiRouter')
      const router = new AIRouter()
      router.setProvider(provider)
      
      // Update status
      providerStatus.value[provider] = {
        provider,
        available: true,
        lastChecked: Date.now(),
      }
      
      return true
    } catch (error) {
      providerStatus.value[provider] = {
        provider,
        available: false,
        lastChecked: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      return false
    }
  }

  const checkAllProviders = async () => {
    await Promise.all([
      checkProviderHealth('claude'),
      checkProviderHealth('openai')
    ])
  }

  // Get current provider status
  const getCurrentProviderStatus = computed(() => {
    return providerStatus.value[currentProvider.value]
  })

  // Get available providers
  const availableProviders = computed(() => {
    return Object.values(providerStatus.value)
      .filter(status => status.available)
      .map(status => status.provider)
  })

  // Auto-switch to available provider if current is unavailable
  const ensureProviderAvailable = async () => {
    await checkProviderHealth(currentProvider.value)
    
    if (!getCurrentProviderStatus.value.available && availableProviders.value.length > 0) {
      setProvider(availableProviders.value[0])
    }
  }

  // Provider display names
  const getProviderDisplayName = (provider: SupportedProvider): string => {
    const names = {
      claude: 'Claude (Anthropic)',
      openai: 'GPT-4 (OpenAI)'
    }
    return names[provider] || provider
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

    // Actions
    setProvider,
    toggleEnabled,
    setEnabled,
    toggleFallback,

    // Health checks
    providerStatus: readonly(providerStatus),
    getCurrentProviderStatus,
    availableProviders,
    checkProviderHealth,
    checkAllProviders,
    ensureProviderAvailable,
    
    // Utils
    getProviderDisplayName,
  }
}