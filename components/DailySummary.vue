<template>
  <div class="bg-card rounded-lg border border-border p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-foreground">Daily Summary</h2>
      <div v-if="!loading && summary" class="text-xs text-muted-foreground">
        AI {{ summary.provider }}
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span class="ml-2 text-sm text-muted-foreground">Generating insights...</span>
    </div>

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
      <div class="text-sm">AI insights will appear here</div>
    </div>

    <div v-else-if="!summary && activities.length > 0" class="text-center py-4">
      <button 
        @click="generateSummary"
        class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Generate AI Summary
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
interface AISummary {
  id: string
  content: string
  provider: string
  generatedAt: string
}

const { activities, getTodaysActivities } = useActivities()

// Local state
const summary = ref<AISummary | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

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
  
  const activitiesWithRating = activities.value.filter(a => a.focusRating !== null)
  if (activitiesWithRating.length === 0) return 0
  
  const average = activitiesWithRating.reduce((sum, a) => sum + (a.focusRating || 0), 0) / activitiesWithRating.length
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

// Actions
const generateSummary = async () => {
  if (activities.value.length === 0) return
  
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<{ data: AISummary }>('/api/ai/daily-summary', {
      method: 'POST',
      body: {
        activities: activities.value.map(a => ({
          title: a.title,
          durationMs: a.durationMs,
          tags: a.tags,
          priority: a.priority,
          focusRating: a.focusRating
        }))
      }
    })

    summary.value = response.data
  } catch (err) {
    console.error('Failed to generate summary:', err)
    error.value = 'Failed to generate AI summary. Please try again.'
  } finally {
    loading.value = false
  }
}

// Auto-generate summary when activities change (debounced)
const debouncedGenerate = useDebounceFn(generateSummary, 3000)

watch(activities, (newActivities, oldActivities) => {
  // Only auto-generate if we have new activities and no recent summary
  if (newActivities.length > 0 && newActivities.length !== oldActivities?.length) {
    if (!summary.value || needsRefresh()) {
      debouncedGenerate()
    }
  }
}, { deep: true })

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
      const response = await $fetch<{ data: AISummary | null }>(`/api/ai/daily-summary?date=${today}`)
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