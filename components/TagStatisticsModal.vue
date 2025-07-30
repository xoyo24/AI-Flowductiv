<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeModal"
    />
    
    <!-- Modal -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-xl font-semibold">Tag Statistics</h2>
        <button
          @click="closeModal"
          class="p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="flex items-center space-x-3 text-muted-foreground">
            <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Loading tag statistics...</span>
          </div>
        </div>

        <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <div v-else-if="statistics.length === 0" class="text-center py-12 text-muted-foreground">
          <BarChart3 class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No tag statistics available</p>
          <p class="text-sm">Start tracking activities with tags to see insights</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Summary Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-primary">{{ statistics.length }}</div>
              <div class="text-sm text-muted-foreground">Total Tags</div>
            </div>
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-primary">{{ totalActivities }}</div>
              <div class="text-sm text-muted-foreground">Activities</div>
            </div>
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-primary">{{ formatDuration(totalTime) }}</div>
              <div class="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div class="bg-muted/50 rounded-lg p-4 text-center">
              <div class="text-2xl font-bold text-primary">{{ formatDuration(avgSessionTime) }}</div>
              <div class="text-sm text-muted-foreground">Avg Session</div>
            </div>
          </div>

          <!-- Tag List -->
          <div class="space-y-3">
            <h3 class="text-lg font-medium mb-4">Tag Usage Statistics</h3>
            
            <div v-for="(stat, index) in sortedStatistics" :key="stat.name" class="border border-border rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <div class="font-medium">#{{ stat.name }}</div>
                    <div class="text-sm text-muted-foreground">
                      {{ stat.count }} activities • {{ stat.formattedDuration }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center">
                      <div 
                        class="w-2 h-2 rounded-full mr-2"
                        :class="getProductivityColorClass(stat.productivityScore || 0)"
                      ></div>
                      <span class="text-sm font-medium">{{ Math.round((stat.productivityScore || 0) * 100) }}%</span>
                    </div>
                  </div>
                  <div class="text-xs text-muted-foreground">productivity</div>
                </div>
              </div>

              <!-- Stats Row -->
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div class="text-muted-foreground">Average Duration</div>
                  <div class="font-medium">{{ stat.formattedAvgDuration }}</div>
                </div>
                <div>
                  <div class="text-muted-foreground">Total Time</div>
                  <div class="font-medium">{{ stat.formattedDuration }}</div>
                </div>
                <div>
                  <div class="text-muted-foreground">Usage Frequency</div>
                  <div class="font-medium">{{ ((stat.count / totalActivities) * 100).toFixed(1) }}%</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mt-3">
                <div class="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Time compared to most used tag</span>
                  <span>{{ ((stat.totalTime / maxTime) * 100).toFixed(1) }}%</span>
                </div>
                <div class="w-full bg-muted rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-500"
                    :class="getProductivityColorClass(stat.productivityScore || 0, 'bg')"
                    :style="{ width: `${(stat.totalTime / maxTime) * 100}%` }"
                  ></div>
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
import { X, BarChart3 } from 'lucide-vue-next'

interface TagStatistic {
  name: string
  count: number
  totalTime: number
  avgDuration: number
  productivityScore?: number
  formattedDuration?: string
  formattedAvgDuration?: string
}

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { getTagStatistics, formatTagStats, formatDuration } = useTagManagement()

// Local state
const statistics = ref<TagStatistic[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const totalActivities = computed(() => {
  return statistics.value.reduce((sum, stat) => sum + stat.count, 0)
})

const totalTime = computed(() => {
  return statistics.value.reduce((sum, stat) => sum + stat.totalTime, 0)
})

const avgSessionTime = computed(() => {
  return totalActivities.value > 0 ? totalTime.value / totalActivities.value : 0
})

const sortedStatistics = computed(() => {
  return [...statistics.value].sort((a, b) => b.totalTime - a.totalTime)
})

const maxTime = computed(() => {
  return Math.max(...statistics.value.map(s => s.totalTime), 1)
})

// Methods
const closeModal = () => {
  emit('close')
}

const loadStatistics = async () => {
  loading.value = true
  error.value = null

  try {
    const rawStats = await getTagStatistics()
    statistics.value = rawStats.map(stat => formatTagStats(stat))
  } catch (err: any) {
    error.value = err.message || 'Failed to load tag statistics'
  } finally {
    loading.value = false
  }
}

const getProductivityColorClass = (score: number, prefix: string = '') => {
  const basePrefix = prefix ? `${prefix}-` : ''
  
  if (score >= 0.8) return `${basePrefix}green-500`
  if (score >= 0.6) return `${basePrefix}blue-500`
  if (score >= 0.4) return `${basePrefix}yellow-500`
  if (score >= 0.2) return `${basePrefix}orange-500`
  return `${basePrefix}red-500`
}

// Watch for modal open to load data
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadStatistics()
  }
})

// Handle escape key to close modal
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      closeModal()
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>