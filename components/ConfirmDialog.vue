<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="!loading && closeDialog()"
    />
    
    <!-- Dialog -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
      <div class="flex items-start space-x-4">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="iconBgClass"
          >
            <component :is="iconComponent" :class="iconClass" class="w-5 h-5" />
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
          <p class="text-sm text-muted-foreground mb-4">{{ message }}</p>

          <div v-if="details" class="p-3 bg-muted/50 rounded-md mb-4">
            <p class="text-sm font-medium mb-1">{{ details.title }}</p>
            <p class="text-xs text-muted-foreground">{{ details.message }}</p>
          </div>

          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeDialog()"
              class="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="px-4 py-2 text-sm rounded-md transition-colors disabled:opacity-50"
              :class="confirmButtonClass"
              :disabled="loading"
            >
              <div v-if="loading" class="flex items-center">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {{ loadingText }}
              </div>
              <span v-else>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-vue-next'

type ConfirmType = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmDetails {
  title: string
  message: string
}

interface Props {
  isOpen: boolean
  type?: ConfirmType
  title: string
  message: string
  details?: ConfirmDetails
  confirmText?: string
  cancelText?: string
  loadingText?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
})

const emit = defineEmits<Emits>()

// Local state
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const iconComponent = computed(() => {
  switch (props.type) {
    case 'danger':
      return Trash2
    case 'warning':
      return AlertTriangle
    case 'success':
      return CheckCircle
    default:
      return Info
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'success':
      return 'text-green-600'
    default:
      return 'text-blue-600'
  }
})

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-50'
    case 'warning':
      return 'bg-yellow-50'
    case 'success':
      return 'bg-green-50'
    default:
      return 'bg-blue-50'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700'
    case 'warning':
      return 'bg-yellow-600 text-white hover:bg-yellow-700'
    case 'success':
      return 'bg-green-600 text-white hover:bg-green-700'
    default:
      return 'bg-primary text-primary-foreground hover:bg-primary/90'
  }
})

// Methods
const closeDialog = () => {
  if (!loading.value) {
    error.value = null
    emit('close')
  }
}

const handleConfirm = () => {
  error.value = null
  emit('confirm')
}

// Expose loading state control for parent
const setLoading = (isLoading: boolean) => {
  loading.value = isLoading
}

const setError = (errorMessage: string | null) => {
  error.value = errorMessage
}

// Handle escape key to close dialog
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen && !loading.value) {
      closeDialog()
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})

// Watch for dialog close to reset state
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      loading.value = false
      error.value = null
    }
  }
)

// Expose methods for parent component
defineExpose({
  setLoading,
  setError,
})
</script>