<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeDialog"
    />
    
    <!-- Dialog -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col
                md:max-h-[85vh] sm:mx-2 sm:max-w-[calc(100vw-1rem)]">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 sm:p-6 border-b border-border">
        <div class="flex items-center space-x-3">
          <History class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold">AI Analysis History</h2>
        </div>
        <button
          @click="closeDialog"
          class="p-2 rounded-md hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p class="text-muted-foreground">Loading AI analysis history...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!histories.length" class="flex items-center justify-center py-12">
          <div class="text-center max-w-sm">
            <Brain class="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 class="text-lg font-medium mb-2">No AI Analysis Yet</h3>
            <p class="text-muted-foreground text-sm mb-4">
              Start tracking activities and generate your first AI insights to see them here.
            </p>
          </div>
        </div>

        <!-- History List -->
        <div v-else class="space-y-4">
          <!-- Summary Stats -->
          <div class="bg-muted/20 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">{{ histories.length }}</div>
                <div class="text-xs text-muted-foreground">Total Insights</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">{{ totalTokens.toLocaleString() }}</div>
                <div class="text-xs text-muted-foreground">Tokens Used</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-primary">{{ uniqueProviders }}</div>
                <div class="text-xs text-muted-foreground">AI Providers</div>
              </div>
            </div>
          </div>

          <!-- History Items -->
          <div class="space-y-3">
            <div 
              v-for="history in histories" 
              :key="history.id"
              class="bg-card border border-border rounded-lg p-4 hover:bg-muted/10 transition-colors"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="flex items-center space-x-2">
                    <Calendar class="w-4 h-4 text-muted-foreground" />
                    <span class="font-medium">{{ formatDate(history.date) }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'text-xs px-2 py-1 rounded-full',
                      getProviderColor(history.provider)
                    ]">
                      {{ getProviderName(history.provider) }}
                    </span>
                    <span v-if="history.tokensUsed" class="text-xs text-muted-foreground">
                      {{ history.tokensUsed }} tokens
                    </span>
                  </div>
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ formatTime(history.generatedAt) }}
                </div>
              </div>
              
              <!-- Content Preview -->
              <div class="mb-3">
                <p class="text-sm text-muted-foreground line-clamp-2">
                  {{ history.content.substring(0, 200) }}{{ history.content.length > 200 ? '...' : '' }}
                </p>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center justify-between">
                <button
                  @click="toggleExpanded(history.id)"
                  class="text-xs text-primary hover:underline"
                >
                  {{ expandedItems.has(history.id) ? 'Show Less' : 'View Full Insight' }}
                </button>
                <div class="text-xs text-muted-foreground">
                  Generated {{ getRelativeTime(history.generatedAt) }}
                </div>
              </div>
              
              <!-- Expanded Content -->
              <div v-if="expandedItems.has(history.id)" class="mt-4 pt-4 border-t border-border">
                <div class="prose prose-sm max-w-none dark:prose-invert">
                  <div class="whitespace-pre-wrap text-sm">{{ history.content }}</div>
                </div>
              </div>
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
  Calendar, 
  History, 
  X 
} from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import type { AISummary } from '~/server/database/schema'

interface Props {
  isOpen: boolean
}

type Emits = (e: 'close') => void

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(true)
const histories = ref<AISummary[]>([])
const expandedItems = ref(new Set<string>())

// Computed
const totalTokens = computed(() => {
  return histories.value.reduce((sum, history) => sum + (history.tokensUsed || 0), 0)
})

const uniqueProviders = computed(() => {
  const providers = new Set(histories.value.map(h => h.provider))
  return providers.size
})

// Methods
const closeDialog = () => {
  emit('close')
}

const toggleExpanded = (id: string) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

const fetchHistories = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ data: AISummary[] }>('/api/ai/history')
    histories.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch AI history:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (timestamp: Date): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRelativeTime = (timestamp: Date): string => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return formatDate(date.toISOString().split('T')[0])
}

const getProviderName = (provider: string): string => {
  const names: Record<string, string> = {
    claude: 'Claude',
    openai: 'OpenAI', 
    gemini: 'Gemini',
    ollama: 'Ollama'
  }
  return names[provider] || provider
}

const getProviderColor = (provider: string): string => {
  const colors: Record<string, string> = {
    claude: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
    openai: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
    gemini: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    ollama: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
  }
  return colors[provider] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
}

// Watch for dialog open/close
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    fetchHistories()
  }
})

// Handle escape key
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