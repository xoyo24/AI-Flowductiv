<template>
  <div class="space-y-4">
    <!-- Title Input -->
    <div>
      <label class="block text-sm font-medium mb-2">Title</label>
      <input 
        v-model="editForm.title"
        type="text" 
        class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Activity title"
        data-testid="edit-title-input"
      />
    </div>

    <!-- Smart Tag Input -->
    <div>
      <label class="block text-sm font-medium mb-2">Tags</label>
      
      <!-- Current Tags Display -->
      <div v-if="parsedTags.length > 0" class="flex flex-wrap gap-2 mb-3">
        <span 
          v-for="tag in parsedTags" 
          :key="tag"
          class="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20"
        >
          <span class="text-primary mr-1">#</span>{{ tag }}
        </span>
      </div>

      <!-- Smart Tag Input Field -->
      <div class="relative" ref="dropdownContainer">
        <input 
          v-model="tagInput"
          type="text" 
          class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Add tags: #work #meeting (or comma separated)"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          data-testid="edit-tags-input"
        />

        <!-- Tag Suggestions Dropdown -->
        <div 
          v-if="showSuggestions && suggestions.length > 0"
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

      <div class="text-xs text-muted-foreground mt-1">
        Type #tag or use comma-separated format. Press Tab or Enter to select suggestions.
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
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Form data
const editForm = ref({
  title: props.activity.title,
  tags: [...(props.activity.tags || [])]
})

const tagInput = ref('')
const dropdownContainer = ref<HTMLElement>()
const inputFocused = ref(false)
const selectedIndex = ref(-1)

// Initialize tag input with existing tags
onMounted(() => {
  if (editForm.value.tags.length > 0) {
    tagInput.value = editForm.value.tags.map(tag => `#${tag}`).join(' ')
  }
})

// Use input parser to extract tags from the input
const { tags: parsedTags } = useInputParser(tagInput)

// Use autocomplete for tag suggestions
const {
  suggestions,
  isLoading: suggestionsLoading,
  selectNext,
  selectPrevious,
  performSearch,
  getInitialSuggestions,
} = useAutoComplete(tagInput, { debounceMs: 300, maxSuggestions: 6 })

// Filter suggestions to only show tag suggestions
const tagSuggestions = computed(() => 
  suggestions.value.filter(s => s.type === 'tag')
)

const showSuggestions = computed(() => 
  inputFocused.value && tagSuggestions.value.length > 0
)

// Input handlers
const handleInput = () => {
  if (tagInput.value.trim()) {
    performSearch(tagInput.value.trim())
  }
  updateFormData()
}

const handleFocus = () => {
  inputFocused.value = true
  if (tagInput.value.trim()) {
    performSearch(tagInput.value.trim())
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
    case 'Enter':
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

const selectSuggestion = (suggestion: any) => {
  const currentTags = tagInput.value.split(/[,\s]+/).filter(Boolean)
  const tagName = suggestion.text.startsWith('#') ? suggestion.text.slice(1) : suggestion.text
  
  // Check if tag already exists
  const hasTag = currentTags.some(tag => 
    tag.replace('#', '').toLowerCase() === tagName.toLowerCase()
  )
  
  if (!hasTag) {
    const newTag = `#${tagName}`
    tagInput.value = tagInput.value.trim() 
      ? `${tagInput.value} ${newTag}`
      : newTag
  }
  
  selectedIndex.value = -1
  inputFocused.value = false
  updateFormData()
}

const updateFormData = () => {
  // Update tags from parsed input
  editForm.value.tags = [...parsedTags.value]
  
  // Emit updated data to parent
  emit('update', {
    title: editForm.value.title.trim(),
    tags: editForm.value.tags
  })
}

// Watch for title changes
watch(() => editForm.value.title, () => {
  emit('update', {
    title: editForm.value.title.trim(),
    tags: editForm.value.tags
  })
})

// Watch for parsed tags changes
watch(parsedTags, () => {
  editForm.value.tags = [...parsedTags.value]
  emit('update', {
    title: editForm.value.title.trim(),
    tags: editForm.value.tags
  })
})
</script>