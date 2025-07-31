<template>
  <div class="space-y-4">
    <!-- Unified Smart Input (like InputComposer) -->
    <div>
      <label class="block text-sm font-medium mb-2">Activity</label>
      <div class="relative" ref="dropdownContainer">
        <input 
          v-model="unifiedInput"
          type="text" 
          class="w-full px-4 py-3 border-2 border-input rounded-xl text-base bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
          placeholder="What are you working on? (e.g., Meeting prep #work #planning)"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @keyup.enter="handleSave"
          data-testid="edit-unified-input"
        />

        <!-- Auto-complete Suggestions Dropdown -->
        <div 
          v-if="showSuggestions"
          class="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto content-card border shadow-lg z-50"
        >
          <div class="py-2">
            <button
              v-for="(suggestion, index) in suggestions"
              :key="suggestion.text"
              @click="selectSuggestion(suggestion)"
              @mouseenter="selectedIndex = index"
              :class="[
                'w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center space-x-2',
                selectedIndex === index ? 'bg-muted' : ''
              ]"
            >
              <span class="text-primary">#</span>
              <span>{{ suggestion.text }}</span>
              <span v-if="suggestion.count" class="text-xs text-muted-foreground ml-auto">{{ suggestion.count }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Parsed Tags Display -->
      <div v-if="parsedTags.length > 0" class="mt-3">
        <div class="flex items-center space-x-3">
          <span class="text-sm text-muted-foreground font-medium">Tags:</span>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tag in parsedTags" 
              :key="tag"
              class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20"
            >
              <span class="text-primary mr-1">#</span>{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAutoComplete } from '~/composables/useAutoComplete'
import { useInputParser } from '~/composables/useInputParser'

interface Activity {
  id: string
  title: string
  tags: string[]
}

interface Props {
  activity: Activity
}

interface Emits {
  (e: 'update', data: { title: string; tags: string[] }): void
  (e: 'save'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Unified input that combines title and tags (like InputComposer)
const unifiedInput = ref('')
const dropdownContainer = ref<HTMLElement>()
const inputFocused = ref(false)
const selectedIndex = ref(-1)

// Initialize unified input with current activity data
onMounted(() => {
  // Use the title as-is since it already contains hashtag references
  // No need to reconstruct because our edit save logic now preserves the original input
  unifiedInput.value = props.activity.title
})

// Use input parser to extract title and tags from unified input
const { tags: parsedTags, cleanText: parsedTitle } = useInputParser(unifiedInput)

// Use autocomplete for suggestions
const {
  suggestions,
  isLoading: suggestionsLoading,
  selectNext,
  selectPrevious,
  performSearch,
  getInitialSuggestions,
} = useAutoComplete(unifiedInput, { debounceMs: 300, maxSuggestions: 6 })

// Filter suggestions to only show tag suggestions
const tagSuggestions = computed(() => 
  suggestions.value.filter(s => s.type === 'tag')
)

const showSuggestions = computed(() => 
  inputFocused.value && tagSuggestions.value.length > 0
)

// Input handlers
const handleInput = () => {
  if (unifiedInput.value.trim()) {
    performSearch(unifiedInput.value.trim())
  }
  updateFormData()
}

const handleFocus = () => {
  inputFocused.value = true
  if (unifiedInput.value.trim()) {
    performSearch(unifiedInput.value.trim())
  } else {
    getInitialSuggestions()
  }
}

const handleBlur = () => {
  // Delay to allow for suggestion selection
  setTimeout(() => {
    inputFocused.value = false
  }, 150)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showSuggestions.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, tagSuggestions.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Tab':
      if (selectedIndex.value >= 0) {
        event.preventDefault()
        selectSuggestion(tagSuggestions.value[selectedIndex.value])
      }
      break
    case 'Escape':
      inputFocused.value = false
      break
  }
}

const handleSave = () => {
  // Emit save event when Enter is pressed
  emit('save')
}

const selectSuggestion = (suggestion: any) => {
  const tagName = suggestion.text.startsWith('#') ? suggestion.text.slice(1) : suggestion.text
  
  // Check if tag already exists in the input
  const currentInput = unifiedInput.value.toLowerCase()
  const tagToAdd = `#${tagName}`.toLowerCase()
  
  if (!currentInput.includes(tagToAdd)) {
    const newTag = `#${tagName}`
    unifiedInput.value = unifiedInput.value.trim() 
      ? `${unifiedInput.value} ${newTag}`
      : newTag
  }
  
  selectedIndex.value = -1
  inputFocused.value = false
  updateFormData()
}

const updateFormData = () => {
  // Emit updated data to parent with original input as title (includes hashtags)
  // This makes it consistent with home screen input behavior
  emit('update', {
    title: unifiedInput.value.trim(),
    tags: parsedTags.value
  })
}

// Watch for input changes to update form data
watch(unifiedInput, () => {
  updateFormData()
})

// Watch for activity prop changes to update input
watch(() => props.activity, (newActivity) => {
  if (newActivity) {
    // Use the title as-is since it already contains hashtag references
    unifiedInput.value = newActivity.title
  }
}, { deep: true })
</script>