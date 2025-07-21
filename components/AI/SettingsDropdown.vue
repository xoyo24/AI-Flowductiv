<template>
  <div class="relative" ref="dropdownRef">
    <!-- Settings Trigger Button -->
    <button
      @click="toggleDropdown"
      :class="[
        'flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors',
        'hover:bg-muted text-muted-foreground hover:text-foreground',
        { 'text-primary': isOpen }
      ]"
      :aria-expanded="isOpen"
      aria-label="AI Settings"
      data-testid="ai-settings-trigger"
    >
      <Settings class="w-3 h-3" />
      <span>{{ getProviderDisplayName(currentProvider) }}</span>
      <div 
        :class="[
          'w-2 h-2 rounded-full ml-1',
          getCurrentProviderStatus.available ? 'bg-green-500' : 'bg-red-500'
        ]"
        :title="getCurrentProviderStatus.available ? 'Provider Available' : 'Provider Unavailable'"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50"
        data-testid="ai-settings-dropdown"
      >
        <div class="p-3 space-y-3">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-foreground">AI Settings</h3>
            <button
              @click="refreshProviders"
              class="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Refresh provider status"
              :disabled="refreshing"
              data-testid="refresh-providers"
            >
              <RefreshCw 
                :class="['w-3 h-3', { 'animate-spin': refreshing }]" 
              />
            </button>
          </div>

          <!-- Enable/Disable Toggle -->
          <div class="flex items-center justify-between">
            <label for="ai-enabled" class="text-sm text-foreground">
              Enable AI Features
            </label>
            <button
              id="ai-enabled"
              @click="toggleEnabled"
              :class="[
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                isEnabled ? 'bg-primary' : 'bg-muted'
              ]"
              role="switch"
              :aria-checked="isEnabled"
              data-testid="ai-enabled-toggle"
            >
              <span
                :class="[
                  'inline-block h-3 w-3 transform rounded-full bg-white transition-transform',
                  isEnabled ? 'translate-x-5' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <!-- Provider Selection -->
          <div v-if="isEnabled" class="space-y-2">
            <label class="text-sm text-foreground">AI Provider</label>
            <div class="space-y-1">
              <button
                v-for="provider in (['claude', 'openai'] as SupportedProvider[])"
                :key="provider"
                @click="setProvider(provider)"
                :class="[
                  'w-full flex items-center justify-between p-2 rounded-md text-sm transition-colors',
                  currentProvider === provider
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-muted text-foreground'
                ]"
                :data-testid="`provider-${provider}`"
              >
                <span>{{ getProviderDisplayName(provider) }}</span>
                <div class="flex items-center gap-2">
                  <div 
                    :class="[
                      'w-2 h-2 rounded-full',
                      providerStatus[provider].available ? 'bg-green-500' : 'bg-red-500'
                    ]"
                  />
                  <Check 
                    v-if="currentProvider === provider"
                    class="w-3 h-3" 
                  />
                </div>
              </button>
            </div>
          </div>

          <!-- Provider Status Info -->
          <div v-if="isEnabled && !getCurrentProviderStatus.available" class="p-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <div class="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle class="w-3 h-3" />
              <span class="text-xs">Current provider unavailable</span>
            </div>
            <p class="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              {{ getCurrentProviderStatus.error || 'Provider is not responding' }}
            </p>
          </div>

          <!-- Fallback Option -->
          <div v-if="isEnabled" class="flex items-center justify-between pt-2 border-t border-border">
            <label for="fallback-mock" class="text-xs text-muted-foreground">
              Fallback to mock if AI fails
            </label>
            <button
              id="fallback-mock"
              @click="toggleFallback"
              :class="[
                'relative inline-flex h-4 w-7 items-center rounded-full transition-colors',
                canFallback ? 'bg-primary' : 'bg-muted'
              ]"
              role="switch"
              :aria-checked="canFallback"
              data-testid="fallback-toggle"
            >
              <span
                :class="[
                  'inline-block h-2 w-2 transform rounded-full bg-white transition-transform',
                  canFallback ? 'translate-x-4' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Check, RefreshCw, Settings } from 'lucide-vue-next'
import type { SupportedProvider } from '~/types/ai'

// AI Settings composable
const {
  isEnabled,
  currentProvider,
  canFallback,
  providerStatus,
  getCurrentProviderStatus,
  setProvider,
  toggleEnabled,
  toggleFallback,
  checkAllProviders,
  getProviderDisplayName,
} = useAISettings()

// Dropdown state
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const refreshing = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const refreshProviders = async () => {
  if (refreshing.value) return
  
  refreshing.value = true
  try {
    await checkAllProviders()
  } finally {
    refreshing.value = false
  }
}

// Close dropdown when clicking outside
onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

// Close on escape
useEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
})
</script>