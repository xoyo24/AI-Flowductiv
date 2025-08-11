<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeDialog"
    />
    
    <!-- Dialog -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col
                md:max-h-[85vh] sm:mx-2">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-lg font-semibold">Settings</h2>
        <button
          @click="closeDialog"
          class="p-2 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close settings"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="space-y-8">
          <!-- AI & Insights Section -->
          <section>
            <h3 class="text-base font-semibold mb-4 flex items-center space-x-2">
              <Brain class="w-4 h-4 text-primary" />
              <span>AI & Insights</span>
            </h3>
            
            <div class="space-y-6">
              <!-- Enable AI -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium">Enable AI Features</label>
                  <p class="text-xs text-muted-foreground mt-1">
                    Turn on AI-powered productivity insights and chat
                  </p>
                </div>
                <button
                  @click="toggleEnabled"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    isEnabled ? 'bg-primary' : 'bg-muted'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>

              <!-- AI Provider Selection -->
              <div class="space-y-3">
                <label class="text-sm font-medium">AI Provider</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    v-for="provider in availableProviders"
                    :key="provider"
                    @click="setProvider(provider)"
                    :disabled="!isEnabled"
                    :class="[
                      'flex items-center justify-between p-3 border rounded-lg text-left transition-colors',
                      currentProvider === provider && isEnabled
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50',
                      !isEnabled && 'opacity-50 cursor-not-allowed'
                    ]"
                  >
                    <div>
                      <div class="text-sm font-medium">{{ getProviderDisplayName(provider) }}</div>
                      <div class="text-xs text-muted-foreground">{{ getProviderStatus(provider) }}</div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span :class="[
                        'text-xs px-2 py-1 rounded',
                        getProviderBadge(provider).color === 'green' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                          : getProviderBadge(provider).color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                      ]">
                        {{ getProviderBadge(provider).text }}
                      </span>
                      <div v-if="currentProvider === provider && isEnabled" class="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Cost Management -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium">Cost Tracking</label>
                    <p class="text-xs text-muted-foreground mt-1">
                      Monitor AI usage costs and set budget limits
                    </p>
                  </div>
                  <button
                    @click="toggleCostTracking"
                    :disabled="!isEnabled"
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      isCostTrackingEnabled && isEnabled ? 'bg-primary' : 'bg-muted',
                      !isEnabled && 'opacity-50 cursor-not-allowed'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        isCostTrackingEnabled && isEnabled ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    />
                  </button>
                </div>

                <div v-if="isCostTrackingEnabled && isEnabled" class="pl-4 space-y-3 border-l-2 border-primary/20">
                  <div>
                    <label class="text-sm font-medium">Monthly Budget Limit</label>
                    <div class="flex items-center space-x-2 mt-2">
                      <span class="text-sm">$</span>
                      <input
                        :value="monthlyLimit"
                        @input="handleBudgetChange"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-20 px-2 py-1 text-sm border border-border rounded bg-background"
                      />
                      <span class="text-xs text-muted-foreground">per month</span>
                    </div>
                  </div>
                  
                  <div class="text-sm space-y-1">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Current month usage:</span>
                      <span class="font-medium">${currentMonthCost.toFixed(3)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">Budget remaining:</span>
                      <span :class="[
                        'font-medium',
                        remainingBudget > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      ]">
                        ${{ remainingBudget.toFixed(3) }}
                      </span>
                    </div>
                    <div class="w-full bg-muted rounded-full h-2">
                      <div 
                        class="bg-primary h-2 rounded-full transition-all"
                        :style="{ width: `${Math.min(budgetUtilization, 100)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback to Mock -->
              <div class="flex items-center justify-between">
                <div>
                  <label class="text-sm font-medium">Fallback to Mock Responses</label>
                  <p class="text-xs text-muted-foreground mt-1">
                    Use mock responses when AI providers are unavailable
                  </p>
                </div>
                <button
                  @click="toggleFallback"
                  :disabled="!isEnabled"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    canFallback && isEnabled ? 'bg-primary' : 'bg-muted',
                    !isEnabled && 'opacity-50 cursor-not-allowed'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      canFallback && isEnabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </div>
            </div>
          </section>

          <!-- Appearance Section -->
          <section>
            <h3 class="text-base font-semibold mb-4 flex items-center space-x-2">
              <Palette class="w-4 h-4 text-primary" />
              <span>Appearance</span>
            </h3>
            
            <div class="space-y-6">
              <!-- Theme -->
              <div class="space-y-3">
                <label class="text-sm font-medium">Theme</label>
                <div class="flex space-x-2">
                  <button
                    @click="setTheme('system')"
                    :class="[
                      'flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm transition-colors',
                      $colorMode.preference === 'system' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                    ]"
                  >
                    <Monitor class="w-4 h-4" />
                    <span>System</span>
                  </button>
                  <button
                    @click="setTheme('light')"
                    :class="[
                      'flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm transition-colors',
                      $colorMode.preference === 'light' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                    ]"
                  >
                    <Sun class="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    @click="setTheme('dark')"
                    :class="[
                      'flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm transition-colors',
                      $colorMode.preference === 'dark' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground/50'
                    ]"
                  >
                    <Moon class="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Data & Privacy Section -->
          <section>
            <h3 class="text-base font-semibold mb-4 flex items-center space-x-2">
              <Shield class="w-4 h-4 text-primary" />
              <span>Data & Privacy</span>
            </h3>
            
            <div class="space-y-6">
              <!-- Data Export -->
              <div>
                <label class="text-sm font-medium">Export Data</label>
                <p class="text-xs text-muted-foreground mt-1 mb-3">
                  Export your productivity data and insights for external analysis
                </p>
                <div class="flex flex-wrap gap-2">
                  <button class="px-3 py-2 text-sm bg-muted text-muted-foreground rounded-lg border hover:bg-muted/80 transition-colors">
                    CSV Export (Coming Soon)
                  </button>
                  <button class="px-3 py-2 text-sm bg-muted text-muted-foreground rounded-lg border hover:bg-muted/80 transition-colors">
                    JSON Export (Coming Soon)
                  </button>
                </div>
              </div>

              <!-- Privacy Notice -->
              <div class="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded p-4">
                <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">Privacy-First Analytics</h4>
                <div class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• All analytics calculations happen locally in your browser</p>
                  <p>• Activity data never leaves your device unless you explicitly use AI features</p>
                  <p>• AI data is sent securely to your chosen provider and not stored by AI services</p>
                  <p>• No tracking, cookies, or third-party analytics</p>
                </div>
              </div>

              <!-- Reset Options -->
              <div>
                <label class="text-sm font-medium text-destructive">Reset & Clear Data</label>
                <p class="text-xs text-muted-foreground mt-1 mb-3">
                  These actions cannot be undone
                </p>
                <div class="space-y-2">
                  <button 
                    @click="resetMonthlyUsage"
                    class="px-3 py-2 text-sm border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    Reset Monthly AI Usage
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Brain, 
  Monitor, 
  Moon, 
  Palette, 
  Shield, 
  Sun, 
  X 
} from 'lucide-vue-next'
import { computed, onMounted, onUnmounted } from 'vue'
import { useAISettings } from '~/composables/useAISettings'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// AI Settings composable
const {
  isEnabled,
  currentProvider,
  canFallback,
  isCostTrackingEnabled,
  monthlyLimit,
  currentMonthCost,
  remainingBudget,
  budgetUtilization,
  availableProviders,
  setProvider,
  toggleEnabled,
  toggleFallback,
  toggleCostTracking,
  setMonthlyLimit,
  resetMonthlyUsage,
  getProviderDisplayName,
  getProviderBadge,
  providerStatus
} = useAISettings()

// Color mode from Nuxt
const { $colorMode } = useNuxtApp()

// Available providers (hardcoded for now, could be computed from providerStatus)
const availableProviders = computed(() => ['claude', 'openai', 'gemini', 'ollama'] as const)

// Methods
const closeDialog = () => {
  emit('close')
}

const handleBudgetChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  if (!isNaN(value) && value >= 0) {
    setMonthlyLimit(value)
  }
}

const setTheme = (theme: 'system' | 'light' | 'dark') => {
  $colorMode.preference = theme
}

const getProviderStatus = (provider: string) => {
  const status = providerStatus.value[provider as keyof typeof providerStatus.value]
  if (!status) return 'Unknown'
  return status.available ? 'Available' : 'Unavailable'
}

// Handle escape key to close dialog
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeDialog()
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>