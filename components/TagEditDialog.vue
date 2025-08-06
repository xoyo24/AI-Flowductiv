<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      @click="closeDialog"
    />
    
    <!-- Dialog -->
    <div class="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">Edit Tag</h3>
        <button
          @click="closeDialog"
          class="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Close dialog"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Current Tag Name</label>
          <div class="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
            #{{ tag?.name }}
          </div>
        </div>

        <div>
          <label for="new-tag-name" class="block text-sm font-medium mb-2">New Tag Name</label>
          <input
            id="new-tag-name"
            v-model="newTagName"
            type="text"
            class="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter new tag name"
            :disabled="loading"
            @keyup.enter="handleRename"
            @keyup.escape="closeDialog"
          />
          <p class="text-xs text-muted-foreground mt-1">
            This will rename the tag across all {{ tag?.count || 0 }} activities
          </p>
        </div>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <div v-if="success" class="p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-600">{{ success }}</p>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          @click="closeDialog"
          class="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          @click="handleRename"
          class="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          :disabled="loading || !newTagName.trim() || newTagName === tag?.name"
        >
          <div v-if="loading" class="flex items-center">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Renaming...
          </div>
          <span v-else>Rename Tag</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface TagData {
  name: string
  totalTime: number
  count?: number
  isFavorite?: boolean
}

interface Props {
  isOpen: boolean
  tag: TagData | null
}

interface Emits {
  (e: 'close'): void
  (e: 'renamed', oldName: string, newName: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { renameTag } = useTagManagement()

// Local state
const newTagName = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Watch for tag changes to reset form
watch(
  () => props.tag,
  (newTag) => {
    if (newTag) {
      newTagName.value = newTag.name
      error.value = null
      success.value = null
    }
  }
)

// Watch for dialog open to focus input
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.tag) {
      newTagName.value = props.tag.name
      error.value = null
      success.value = null
      // Focus input after next tick
      nextTick(() => {
        const input = document.getElementById('new-tag-name') as HTMLInputElement
        input?.focus()
        input?.select()
      })
    }
  }
)

const closeDialog = () => {
  if (!loading.value) {
    emit('close')
  }
}

const _handleRename = async () => {
  if (!props.tag || !newTagName.value.trim() || loading.value) return

  const trimmedName = newTagName.value.trim()
  if (trimmedName === props.tag.name) {
    closeDialog()
    return
  }

  loading.value = true
  error.value = null
  success.value = null

  try {
    const result = await renameTag(props.tag.name, trimmedName)

    if (result.success) {
      success.value = `Renamed tag to "${trimmedName}" across ${result.updatedActivities} activities`
      emit('renamed', props.tag.name, trimmedName)

      // Close dialog after showing success message briefly
      setTimeout(() => {
        closeDialog()
      }, 1500)
    } else {
      error.value = result.error || 'Failed to rename tag'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to rename tag'
  } finally {
    loading.value = false
  }
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