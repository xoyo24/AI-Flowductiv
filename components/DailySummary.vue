<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-foreground">Daily Summary</h2>
      <AISettingsDropdown v-if="!loading" />
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span class="ml-2 text-sm text-muted-foreground">Generating insights...</span>
    </div>

    <!-- Rate Limit Error - Show Previous Summary + Friendly Message -->
    <div v-else-if="isRateLimited && summary" class="space-y-4">
      <!-- Show Previous Summary -->
      <div class="prose prose-sm max-w-none text-foreground">
        <div v-html="formattedSummary" class="text-sm leading-relaxed"></div>
      </div>

      <!-- Quick Stats -->
      <div class="border-t border-border pt-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-muted-foreground">Focus Score</div>
            <div class="font-semibold text-foreground">{{ focusScore }}/5</div>
          </div>
          <div>
            <div class="text-muted-foreground">Productivity</div>
            <div class="font-semibold text-foreground">{{ productivityLevel }}</div>
          </div>
        </div>
      </div>

      <!-- Friendly Rate Limit Message -->
      <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <div class="text-blue-500 mt-0.5">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Keep building your focus streak!
            </h4>
            <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div v-for="reason in rateLimitReasons" :key="reason" class="flex items-center space-x-2">
                <span class="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span>{{ reason }}</span>
              </div>
            </div>
            <div v-if="rateLimitProgress" class="mt-3">
              <div class="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 mb-1">
                <span>Progress</span>
                <span>{{ rateLimitProgress.focusTimePercent }}%</span>
              </div>
              <div class="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                <div 
                  class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min(rateLimitProgress.focusTimePercent, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Last Updated -->
      <div class="flex justify-between items-center text-xs text-muted-foreground pt-2">
        <span>Updated {{ timeAgo }}</span>
        <span class="text-blue-600 dark:text-blue-400">AI summary will refresh when requirements are met</span>
      </div>
    </div>

    <!-- Rate Limited - No Previous Summary -->
    <div v-else-if="isRateLimited && !summary" class="text-center py-6">
      <div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div class="text-amber-600 dark:text-amber-400 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
          Almost there! Keep tracking your focus time
        </h3>
        <div class="text-sm text-amber-800 dark:text-amber-200 space-y-2 mb-4">
          <div v-for="reason in rateLimitReasons" :key="reason" class="flex items-center justify-center space-x-2">
            <span class="w-2 h-2 bg-amber-400 rounded-full"></span>
            <span>{{ reason }}</span>
          </div>
        </div>
        <div v-if="rateLimitProgress" class="mb-4">
          <div class="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 mb-2">
            <span>Focus Time Progress</span>
            <span>{{ rateLimitProgress.focusTimePercent }}%</span>
          </div>
          <div class="w-full bg-amber-200 dark:bg-amber-900 rounded-full h-3">
            <div 
              class="bg-amber-500 h-3 rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(rateLimitProgress.focusTimePercent, 100)}%` }"
            ></div>
          </div>
        </div>
        <p class="text-xs text-amber-700 dark:text-amber-300">
          AI insights will unlock automatically when you reach the focus threshold
        </p>
      </div>
    </div>

    <!-- Other Errors -->
    <div v-else-if="error" class="text-center py-4">
      <div class="text-red-500 text-sm mb-2">{{ error }}</div>
      <button 
        @click="generateSummary"
        class="text-sm text-primary hover:text-primary/80"
      >
        Try again
      </button>
    </div>

    <div v-else-if="!summary && activities.length === 0" class="text-center py-8 text-muted-foreground">
      <div class="mb-2">Start tracking activities</div>
      <div class="text-sm">
        <span v-if="isEnabled">AI insights will appear here</span>
        <span v-else>Enable AI in settings to get insights</span>
      </div>
    </div>

    <div v-else-if="!summary && activities.length > 0" class="text-center py-4">
      <button 
        @click="generateSummary"
        :disabled="!isEnabled"
        :class="[
          'px-4 py-2 rounded-md font-medium transition-colors',
          isEnabled 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        ]"
      >
        {{ isEnabled ? 'Generate AI Summary' : 'Enable AI to Generate Summary' }}
      </button>
    </div>

    <div v-else class="space-y-4">
      <!-- AI Generated Content -->
      <div class="prose prose-sm max-w-none text-foreground">
        <div v-html="formattedSummary" class="text-sm leading-relaxed"></div>
      </div>

      <!-- Quick Stats -->
      <div class="border-t border-border pt-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-muted-foreground">Focus Score</div>
            <div class="font-semibold text-foreground">{{ focusScore }}/5</div>
          </div>
          <div>
            <div class="text-muted-foreground">Productivity</div>
            <div class="font-semibold text-foreground">{{ productivityLevel }}</div>
          </div>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="flex justify-between items-center text-xs text-muted-foreground pt-2">
        <span>Updated {{ timeAgo }}</span>
        <button 
          @click="generateSummary"
          class="text-primary hover:text-primary/80"
        >
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AISettingsDropdown from '~/components/AI/SettingsDropdown.vue'

interface AISummary {
  id: string
  content: string
  provider: string
  generatedAt: string
}

const { activities, getTodaysActivities } = useActivities()
const { isEnabled, currentProvider } = useAISettings()

// Local state
const summary = ref<AISummary | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const rateLimitData = ref<any>(null)

// Computed values
const formattedSummary = computed(() => {
  if (!summary.value) return ''

  // Convert markdown-like content to HTML
  return summary.value.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
})

const focusScore = computed(() => {
  if (activities.value.length === 0) return 0

  const activitiesWithRating = activities.value.filter((a) => a.focusRating !== null)
  if (activitiesWithRating.length === 0) return 0

  const average =
    activitiesWithRating.reduce((sum, a) => sum + (a.focusRating || 0), 0) /
    activitiesWithRating.length
  return Math.round(average * 10) / 10
})

const productivityLevel = computed(() => {
  const totalTime = activities.value.reduce((sum, a) => sum + a.durationMs, 0)
  const hours = totalTime / (1000 * 60 * 60)

  if (hours >= 6) return 'High'
  if (hours >= 3) return 'Medium'
  if (hours >= 1) return 'Low'
  return 'Starting'
})

const timeAgo = computed(() => {
  if (!summary.value) return ''

  const now = new Date()
  const generated = new Date(summary.value.generatedAt)
  const diffMinutes = Math.floor((now.getTime() - generated.getTime()) / (1000 * 60))

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return 'yesterday'
})

// Rate limit handling
const isRateLimited = computed(() => {
  return rateLimitData.value !== null
})

const rateLimitReasons = computed(() => {
  return rateLimitData.value?.reasons || []
})

const rateLimitProgress = computed(() => {
  return rateLimitData.value?.progress || null
})

// Actions
const generateSummary = async () => {
  if (activities.value.length === 0) return

  if (!isEnabled.value) {
    error.value = 'AI features are disabled. Enable them in settings to generate summaries.'
    return
  }

  loading.value = true
  error.value = null
  rateLimitData.value = null

  try {
    const response = await $fetch<{ data: AISummary }>('/api/ai/daily-summary', {
      method: 'POST',
      body: {
        activities: activities.value.map((a) => ({
          title: a.title,
          durationMs: a.durationMs,
          tags: a.tags,
          priority: a.priority,
          focusRating: a.focusRating,
        })),
      },
    })

    summary.value = response.data
  } catch (err: any) {
    console.error('Failed to generate summary:', err)
    
    // Handle rate limit errors (429) with detailed data
    if (err.statusCode === 429 || err.status === 429) {
      rateLimitData.value = err.data || {}
      console.log('Rate limit data:', rateLimitData.value)
      // Don't set error.value for rate limits - we show a different UI
    } else {
      error.value = 'Failed to generate AI summary. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// Auto-generate summary when activities change (debounced)
const debouncedGenerate = useDebounceFn(generateSummary, 3000)

watch(
  activities,
  (newActivities, oldActivities) => {
    // Only auto-generate if we have new activities and no recent summary
    if (newActivities.length > 0 && newActivities.length !== oldActivities?.length) {
      if (!summary.value || needsRefresh()) {
        debouncedGenerate()
      }
    }
  },
  { deep: true }
)

const needsRefresh = () => {
  if (!summary.value) return true

  // Refresh if summary is older than 5 minutes
  const summaryAge = Date.now() - new Date(summary.value.generatedAt).getTime()
  return summaryAge > 5 * 60 * 1000
}

// Event handler reference for cleanup
let activitySavedHandler: (() => void) | null = null

// Load existing summary on mount
onMounted(async () => {
  // Load today's activities first
  await getTodaysActivities()

  if (activities.value.length > 0) {
    // Try to load cached summary for today
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await $fetch<{ data: AISummary | null }>(
        `/api/ai/daily-summary?date=${today}`
      )
      if (response.data) {
        summary.value = response.data
      }
    } catch (err) {
      // No cached summary, that's okay
    }
  }

  // Listen for new activities
  activitySavedHandler = async () => {
    await getTodaysActivities()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('activity-saved', activitySavedHandler)
  }
})

// Cleanup event listener on unmount
onUnmounted(() => {
  if (typeof window !== 'undefined' && activitySavedHandler) {
    window.removeEventListener('activity-saved', activitySavedHandler)
    activitySavedHandler = null
  }
})
</script>