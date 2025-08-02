<template>
  <div class="space-y-4">
    <!-- Line 1: Input Only (Clean & Focused) -->
    <div ref="dropdownContainer" class="relative">
      <input
        id="unified-activity-input"
        v-model="activityInput"
        type="text"
        placeholder="What are you working on?"
        class="w-full px-4 py-3 border-2 border-input rounded-xl text-base bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
        :disabled="false"
        @keyup.enter="handleEnterKey"
        @keydown="handleKeydown"
        @focus="handleInputFocus"
        @blur="handleInputBlur"
        data-testid="unified-activity-input"
      />
      
      <!-- Auto-complete Suggestions Dropdown -->
      <SuggestionDropdown
        :suggestions="suggestions"
        :visible="showSuggestions"
        :selected-index="selectedIndex"
        :loading="suggestionsLoading"
        @select="handleSuggestionSelect"
        @hover="selectIndex"
        @close="hideDropdown"
      />
    </div>

    <!-- Action Buttons Row - 2-Line Desktop Layout -->
    <div class="space-y-3 lg:space-y-0">
      <!-- Desktop: 2-Line Layout (Tags Left, Controls Right) -->
      <div class="hidden lg:flex lg:items-start lg:justify-between lg:space-x-4">
        <!-- Left: Quick Start Tags or Extracted Tags -->
        <div class="flex-1">
          <!-- Show extracted tags and priority if user has typed something -->
          <div v-if="extractedTags.length > 0 || extractedPriority !== null" class="flex items-center space-x-4">
            <!-- Tags -->
            <div v-if="extractedTags.length > 0" class="flex items-center space-x-2">
              <span class="text-sm text-muted-foreground font-medium">Tags:</span>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in extractedTags" :key="tag" class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                  <span class="text-primary mr-1">#</span>{{ tag }}
                </span>
              </div>
            </div>
            
            <!-- Priority -->
            <div v-if="extractedPriority !== null" class="flex items-center space-x-2">
              <span class="text-sm text-muted-foreground font-medium">Priority:</span>
              <span class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                <span class="text-orange-500 mr-1">!</span>{{ extractedPriority }}
              </span>
            </div>
          </div>
          
          <!-- Show quick start only if no extracted tags and conditions are met -->
          <div v-else-if="!quickStartHidden && !isRunning && !isPaused" class="flex items-center space-x-3">
            <span class="text-sm text-muted-foreground font-medium">Quick start:</span>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="$emit('quick-start', 'Deep work #focus')"
                class="px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                title="Start timer with deep work activity"
              >
                #focus
              </button>
              <button 
                @click="$emit('quick-start', 'Meeting #meeting')"
                class="px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                title="Start timer with meeting activity"
              >
                #meeting
              </button>
              <button 
                @click="$emit('quick-start', 'Learning session #learning')"
                class="px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                title="Start timer with learning activity"
              >
                #learning
              </button>
            </div>
          </div>
          
          <!-- Show quick start toggle if hidden and no extracted content -->
          <div v-else-if="quickStartHidden && !isRunning && !isPaused && extractedTags.length === 0 && extractedPriority === null" class="flex justify-start">
            <button 
              @click="$emit('show-quick-start')"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Show quick start options"
            >
              Show quick start
            </button>
          </div>
        </div>

        <!-- Right: Timer Controls -->
        <div class="flex justify-end space-x-2">
          <!-- Start Button -->
          <button
            v-if="!isRunning && !isPaused"
            @click="$emit('start-timer')"
            :disabled="!activityInput.trim()"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
            data-testid="unified-start-button"
          >
            Start Timer
          </button>

          <!-- Running: Finish (Primary) + Pause (Secondary) -->
          <template v-if="isRunning">
            <button
              @click="$emit('finish-timer')"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors text-sm"
              data-testid="unified-finish-button"
            >
              ⏹ Finish
            </button>
            <button
              @click="$emit('pause-timer')"
              class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors text-sm"
              data-testid="unified-pause-button"
              title="Pause timer"
            >
              ⏸
            </button>
          </template>

          <!-- Paused: Resume (Primary) + Finish (Secondary) -->
          <template v-if="isPaused">
            <button
              @click="$emit('resume-timer')"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors text-sm"
              data-testid="unified-resume-button"
            >
              ▶️ Resume
            </button>
            <button
              @click="$emit('finish-timer')"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors text-sm"
              data-testid="unified-finish-button"
            >
              ⏹ Finish
            </button>
          </template>
        </div>
      </div>

      <!-- Mobile: Stacked Layout (Preserved) -->
      <div class="flex flex-col space-y-3 lg:hidden">
        <!-- Extracted Content Section (Mobile) -->
        <div v-if="extractedTags.length > 0 || extractedPriority !== null" class="flex flex-col space-y-3">
          <!-- Tags -->
          <div v-if="extractedTags.length > 0" class="flex flex-col space-y-2">
            <span class="text-sm text-muted-foreground font-medium">Tags:</span>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in extractedTags" :key="tag" class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <span class="text-blue-500 mr-1">#</span>{{ tag }}
              </span>
            </div>
          </div>
          
          <!-- Priority -->
          <div v-if="extractedPriority !== null" class="flex flex-col space-y-2">
            <span class="text-sm text-muted-foreground font-medium">Priority:</span>
            <span class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200 w-fit">
              <span class="text-orange-500 mr-1">!</span>{{ extractedPriority }}
            </span>
          </div>
        </div>

        <!-- Quick Start Section (only if no extracted tags) -->
        <div v-else-if="!quickStartHidden && !isRunning && !isPaused" class="flex flex-col space-y-2">
          <span class="text-sm text-muted-foreground font-medium">Quick start:</span>
          <div class="flex flex-wrap gap-2">
            <button 
              @click="$emit('quick-start', 'Deep work #focus')"
              class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              title="Start timer with deep work activity"
            >
              #focus
            </button>
            <button 
              @click="$emit('quick-start', 'Meeting #meeting')"
              class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              title="Start timer with meeting activity"
            >
              #meeting
            </button>
            <button 
              @click="$emit('quick-start', 'Learning session #learning')"
              class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              title="Start timer with learning activity"
            >
              #learning
            </button>
          </div>
        </div>

        <!-- Show Quick Start Toggle (only if no extracted tags) -->
        <div v-else-if="quickStartHidden && !isRunning && !isPaused && extractedTags.length === 0 && extractedPriority === null" class="flex justify-center">
          <button 
            @click="$emit('show-quick-start')"
            class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Show quick start options"
          >
            Show quick start
          </button>
        </div>

        <!-- Primary Action Button -->
        <div class="flex justify-center space-x-2">
          <!-- Start Button -->
          <button
            v-if="!isRunning && !isPaused"
            @click="$emit('start-timer')"
            :disabled="!activityInput.trim()"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
            data-testid="unified-start-button"
          >
            Start Timer
          </button>

          <!-- Running: Finish (Primary) + Pause (Secondary) -->
          <template v-if="isRunning">
            <button
              @click="$emit('finish-timer')"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors text-sm"
              data-testid="unified-finish-button"
            >
              ⏹ Finish
            </button>
            <button
              @click="$emit('pause-timer')"
              class="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors text-sm"
              data-testid="unified-pause-button"
              title="Pause timer"
            >
              ⏸
            </button>
          </template>

          <!-- Paused: Resume (Primary) + Finish (Secondary) -->
          <template v-if="isPaused">
            <button
              @click="$emit('resume-timer')"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors text-sm"
              data-testid="unified-resume-button"
            >
              ▶️ Resume
            </button>
            <button
              @click="$emit('finish-timer')"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors text-sm"
              data-testid="unified-finish-button"
            >
              ⏹ Finish
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, triggerRef, watch } from 'vue'
import SuggestionDropdown from '~/components/Activity/SuggestionDropdown.vue'

interface Props {
  isRunning: boolean
  isPaused: boolean
  quickStartHidden: boolean
  suggestions: any[]
  suggestionsLoading: boolean
  selectedIndex: number
  extractedTags: string[]
  extractedPriority: number | null
  modelValue: string // Add prop for parent's activity input
}

interface Emits {
  (e: 'quick-start', activity: string): void
  (e: 'show-quick-start'): void
  (e: 'start-timer'): void
  (e: 'pause-timer'): void
  (e: 'resume-timer'): void
  (e: 'finish-timer'): void
  (e: 'update:modelValue', value: string): void // v-model support
  (e: 'suggestion-select', suggestion: any): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'input-focus'): void
  (e: 'input-blur'): void
  (e: 'enter-key', event: KeyboardEvent): void
  (e: 'select-index', index: number): void
  (e: 'hide-dropdown'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive state  
const activityInput = ref(props.modelValue || '')
const inputFocused = ref(false)
const dropdownVisible = ref(false)
const justSelectedSuggestion = ref(false)
const dropdownContainer = ref(null)

const showSuggestions = computed(
  () =>
    inputFocused.value &&
    dropdownVisible.value &&
    (props.suggestions.length > 0 || props.suggestionsLoading)
)

// Watch activity input and emit changes (child to parent)
watch(activityInput, (newValue) => {
  emit('update:modelValue', newValue)
})

// Watch parent changes and sync to local state (parent to child)
watch(() => props.modelValue, (newValue) => {
  if (newValue !== activityInput.value) {
    activityInput.value = newValue || ''
  }
})

// Dropdown management
const showDropdown = () => {
  if (props.suggestions.length > 0 || props.suggestionsLoading) {
    dropdownVisible.value = true
  }
}

const hideDropdown = () => {
  dropdownVisible.value = false
  emit('hide-dropdown')
}

// Event handlers
const handleSuggestionSelect = (suggestion) => {
  if (suggestion.type === 'activity') {
    activityInput.value = suggestion.text
  } else {
    const currentText = activityInput.value.trim()
    const hasTag = currentText.includes(`#${suggestion.text}`)
    if (!hasTag) {
      activityInput.value = currentText
        ? `${currentText} #${suggestion.text}`
        : `#${suggestion.text}`
    }
  }

  triggerRef(activityInput)
  justSelectedSuggestion.value = true
  hideDropdown()

  nextTick(() => {
    const input = document.getElementById('unified-activity-input')
    if (input) {
      input.focus()
      input.value = activityInput.value
    }
    setTimeout(() => {
      justSelectedSuggestion.value = false
    }, 200)
  })

  emit('suggestion-select', suggestion)
}

const handleKeydown = (event) => {
  emit('keydown', event)
}

const handleInputFocus = () => {
  inputFocused.value = true
  emit('input-focus')
}

const handleInputBlur = () => {
  setTimeout(() => {
    if (!justSelectedSuggestion.value) {
      inputFocused.value = false
      hideDropdown()
    }
  }, 150)
  emit('input-blur')
}

const handleEnterKey = (event: KeyboardEvent) => {
  if (justSelectedSuggestion.value) {
    return
  }
  emit('enter-key', event)
}

const selectIndex = (index: number) => {
  emit('select-index', index)
}

// Click outside to dismiss dropdown
const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    hideDropdown()
  }
}

// Watch for suggestions and loading changes
watch(() => props.suggestions, (newSuggestions) => {
  if (inputFocused.value && newSuggestions.length > 0) {
    showDropdown()
  }
})

watch(() => props.suggestionsLoading, (loading) => {
  if (loading && inputFocused.value) {
    dropdownVisible.value = true
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Expose methods and data for parent component
defineExpose({
  activityInput,
  clearInput: () => { activityInput.value = '' }
})
</script>