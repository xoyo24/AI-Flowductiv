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
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="text-lg font-semibold">Settings</h2>
        <button
          @click="closeDialog"
          class="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Close settings"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="divide-y divide-border">
          <!-- AI Features Toggle -->
          <div class="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
            <div class="text-sm font-medium">AI Features</div>
            <button
              @click="toggleEnabled"
              :class="[
                'relative inline-flex h-4 w-7 items-center rounded-full transition-colors',
                isEnabled ? 'bg-primary' : 'bg-muted'
              ]"
            >
              <span
                :class="[
                  'inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform',
                  isEnabled ? 'translate-x-3.5' : 'translate-x-0.5'
                ]"
              />
            </button>
          </div>

          <!-- AI Provider (only show available ones) -->
          <div v-if="isEnabled && availableProviders.length > 1" class="px-4 py-3 hover:bg-muted/30 transition-colors">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium">AI Provider</div>
              <select
                :value="currentProvider"
                @change="setProvider(($event.target as HTMLSelectElement).value)"
                class="px-2 py-1 text-sm border border-border rounded bg-background"
              >
                <option 
                  v-for="provider in availableProviders" 
                  :key="provider" 
                  :value="provider"
                >
                  {{ getProviderDisplayName(provider) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Current Provider Status (when only one available) -->
          <div v-else-if="isEnabled" class="px-4 py-3 bg-muted/10">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium">AI Provider</div>
              <div class="text-sm text-muted-foreground">
                {{ getProviderDisplayName(currentProvider) }}
              </div>
            </div>
            <div class="text-xs text-muted-foreground mt-1">
              Configure API keys in environment to enable other providers
            </div>
          </div>


          <!-- Theme (compact dropdown) -->
          <div class="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
            <div class="text-sm font-medium">Theme</div>
            <select
              :value="$colorMode.preference"
              @change="setTheme(($event.target as HTMLSelectElement).value as 'system' | 'light' | 'dark')"
              class="px-2 py-1 text-sm border border-border rounded bg-background"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <!-- Data Export -->
          <div class="px-4 py-3 hover:bg-muted/30 transition-colors">
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm font-medium">Export Data</div>
            </div>
            <div class="flex space-x-2">
              <button class="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors">
                CSV (Soon)
              </button>
              <button class="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors">
                JSON (Soon)
              </button>
            </div>
          </div>

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
  availableProviders,
  setProvider,
  toggleEnabled,
  getProviderDisplayName,
  providerStatus
} = useAISettings()

// Color mode from Nuxt
const { $colorMode } = useNuxtApp()


// Methods
const closeDialog = () => {
  emit('close')
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