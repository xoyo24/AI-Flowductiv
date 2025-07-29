<template>
  <div class="content-card p-6">
    <div class="space-y-6">
      <!-- Activity Input -->
      <div class="space-y-2">
        <label for="activity-input" class="text-sm font-medium text-foreground">
          What are you working on?
        </label>
        <div class="flex space-x-2">
          <div ref="dropdownContainer" class="relative flex-1">
            <input
              id="activity-input"
              v-model="activityInput"
              type="text"
              placeholder="Enter activity or click for suggestions"
              class="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              :disabled="isRunning || isPaused"
              @keyup.enter="handleEnterKey"
              @keydown="handleKeydown"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
              data-testid="activity-input"
            />
            
            <!-- Dynamic suggestions dropdown -->
            <SuggestionDropdown
              :suggestions="suggestions"
              :visible="showSuggestions"
              :selected-index="selectedIndex"
              :loading="suggestionsLoading"
              @select="handleSuggestionSelect"
              @hover="selectIndex"
              @close="hideDropdown"
            />
            <div v-if="activityInput" class="absolute right-2 top-2 flex space-x-1">
              <span v-for="tag in extractedTags" :key="tag" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                #{{ tag }}
              </span>
              <span v-if="extractedPriority" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                !{{ extractedPriority }}
              </span>
            </div>
          </div>
          <button
            v-if="!isRunning && !isPaused"
            @click="handleStart"
            :disabled="!activityInput.trim()"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors whitespace-nowrap"
            data-testid="start-button"
          >
            Start
          </button>
        </div>
      </div>

      <!-- Timer Display -->
      <div class="text-center space-y-4">
        <div class="text-7xl timer-display font-bold text-foreground tracking-tight" data-testid="timer-display">
          {{ formattedTime }}
        </div>
        
        <div v-if="currentActivity" class="text-lg text-muted-foreground">
          {{ currentActivity }}
        </div>

        <!-- Timer Status -->
        <div class="flex items-center justify-center space-x-2">
          <div 
            :class="{
              'w-3 h-3 rounded-full': true,
              'bg-green-500 animate-pulse': isRunning,
              'bg-yellow-500': isPaused,
              'bg-gray-300': !isRunning && !isPaused
            }"
            data-testid="timer-status"
          />
          <span class="text-sm text-muted-foreground">
            {{ timerStatus }}
          </span>
        </div>
      </div>

      <!-- Control Buttons -->
      <div class="flex justify-center space-x-4">
        <button
          v-if="canStart"
          @click="handleStart"
          :disabled="!activityInput.trim()"
          class="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          data-testid="start-timer"
        >
          Start Timer
        </button>

        <button
          v-if="canPause"
          @click="handlePause"
          class="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 font-medium transition-colors"
          data-testid="pause-timer"
        >
          Pause
        </button>

        <button
          v-if="canResume"
          @click="handleResume"
          class="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium transition-colors"
          data-testid="resume-timer"
        >
          Resume
        </button>

        <button
          v-if="canFinish"
          @click="handleFinish"
          class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium transition-colors"
          data-testid="finish-timer"
        >
          Finish
        </button>

        <button
          v-if="isRunning || isPaused"
          @click="handleReset"
          class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 font-medium transition-colors"
          data-testid="reset-timer"
        >
          Reset
        </button>
      </div>

      <!-- Note: Quick Actions removed - dynamic suggestions provide better UX -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, triggerRef, watch } from 'vue'
import SuggestionDropdown from '~/components/Activity/SuggestionDropdown.vue'
import { useAutoComplete } from '~/composables/useAutoComplete'
import { useInputParser } from '~/composables/useInputParser'

const {
  isRunning,
  isPaused,
  currentActivity,
  formattedTime,
  canStart,
  canPause,
  canResume,
  canFinish,
  startTimer,
  pauseTimer,
  resumeTimer,
  finishTimer,
  resetTimer,
} = useTimer()

// Local reactive state
const activityInput = ref('')

// Computed values
const timerStatus = computed(() => {
  if (isRunning.value) return 'Running'
  if (isPaused.value) return 'Paused'
  return 'Stopped'
})

// Use centralized input parser
const {
  tags: extractedTags,
  priority: extractedPriority,
  cleanText,
} = useInputParser(activityInput)

// Dynamic auto-complete suggestions
const {
  suggestions,
  isLoading: suggestionsLoading,
  selectedIndex,
  selectNext,
  selectPrevious,
  selectCurrent,
  selectIndex,
  performSearch,
  getInitialSuggestions,
} = useAutoComplete(activityInput, { debounceMs: 300, maxSuggestions: 8 })

// Simplified dropdown state management
const inputFocused = ref(false)
const dropdownVisible = ref(false)

const showSuggestions = computed(
  () =>
    inputFocused.value &&
    dropdownVisible.value &&
    (suggestions.value.length > 0 || suggestionsLoading.value)
)

const showDropdown = () => {
  if (suggestions.value.length > 0 || suggestionsLoading.value) {
    dropdownVisible.value = true
  }
}

const hideDropdown = () => {
  dropdownVisible.value = false
}

// Show dropdown when new suggestions arrive and input is focused
watch(suggestions, (newSuggestions) => {
  if (inputFocused.value && newSuggestions.length > 0) {
    showDropdown()
  }
})

// Show dropdown when loading starts (for immediate feedback)
watch(suggestionsLoading, (loading) => {
  if (loading && inputFocused.value) {
    dropdownVisible.value = true
  }
})

// Track if we just made a selection to prevent immediate timer start
const justSelectedSuggestion = ref(false)

// Suggestion handling
const handleSuggestionSelect = (suggestion) => {
  // Force reactive update with explicit triggering
  if (suggestion.type === 'activity') {
    activityInput.value = suggestion.text
  } else {
    // For tags, append to current input
    const currentText = activityInput.value.trim()
    const hasTag = currentText.includes(`#${suggestion.text}`)
    if (!hasTag) {
      activityInput.value = currentText
        ? `${currentText} #${suggestion.text}`
        : `#${suggestion.text}`
    }
  }

  // Force reactivity trigger
  triggerRef(activityInput)

  // Mark that we just selected a suggestion
  justSelectedSuggestion.value = true

  // Auto-close dropdown after selection
  hideDropdown()

  // Keep input focused for further editing
  nextTick(() => {
    const input = document.getElementById('activity-input')
    if (input) {
      input.focus()
      // Make sure the input value is synced
      input.value = activityInput.value
    }
    // Reset the selection flag after a short delay
    setTimeout(() => {
      justSelectedSuggestion.value = false
    }, 200)
  })
}

const handleKeydown = (event) => {
  // Handle dropdown-specific keys
  if (showSuggestions.value) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        selectNext()
        break
      case 'ArrowUp':
        event.preventDefault()
        selectPrevious()
        break
      case 'Enter':
        if (selectedIndex.value >= 0) {
          // User has navigated to a suggestion - select it
          event.preventDefault()
          const selected = selectCurrent()
          if (selected) {
            handleSuggestionSelect(selected)
          }
          return // Don't trigger timer start when selecting suggestion
        } else {
          // No suggestion selected - close dropdown and start timer
          hideDropdown()
          // Don't preventDefault - let handleEnterKey handle timer start
        }
        break
      case 'Escape':
        event.preventDefault()
        hideDropdown()
        break
      case 'Tab':
        // Close dropdown on tab to next field
        hideDropdown()
        break
    }
  }

  // Handle typing that should show suggestions
  if (!showSuggestions.value && event.key.length === 1) {
    // User is typing, show dropdown if we have suggestions
    nextTick(() => {
      if (suggestions.value.length > 0) {
        showDropdown()
      }
    })
  }
}

// Input focus handling
const handleInputFocus = () => {
  inputFocused.value = true

  // If input is empty, get initial suggestions (recent activities/tags)
  // If input has content, search for matching suggestions
  nextTick(() => {
    if (activityInput.value.trim()) {
      performSearch(activityInput.value.trim())
    } else {
      getInitialSuggestions()
    }
  })

  // Show existing suggestions if available
  if (suggestions.value.length > 0) {
    showDropdown()
  }
}

// Handle input blur with delay for click handling
const handleInputBlur = () => {
  // Delay hiding dropdown to allow click events to complete
  setTimeout(() => {
    if (!justSelectedSuggestion.value) {
      inputFocused.value = false
      hideDropdown()
    }
  }, 150)
}

// Handle Enter key press on input
const handleEnterKey = () => {
  // Don't start timer if we just selected a suggestion
  if (justSelectedSuggestion.value) {
    return
  }

  // Start timer normally (dropdown logic handled in handleKeydown)
  handleStart()
}

// Actions
// Click outside to dismiss dropdown
const dropdownContainer = ref(null)

const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    hideDropdown()
  }
}

// Set up click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleStart = () => {
  if (activityInput.value.trim() && startTimer(activityInput.value)) {
    // Successfully started
    hideDropdown() // Close dropdown when starting timer
  }
}

const handlePause = () => {
  pauseTimer()
}

const handleResume = () => {
  resumeTimer()
}

const handleFinish = async () => {
  const success = await finishTimer()
  if (success) {
    activityInput.value = ''
    // Optional: Show success notification
  }
}

const handleReset = () => {
  if (confirm('Are you sure you want to reset the timer? This will discard the current session.')) {
    resetTimer()
    activityInput.value = ''
  }
}

// Watch for timer state changes to clear input when appropriate
watch([isRunning, isPaused], ([running, paused]) => {
  if (!running && !paused) {
    // Timer has been reset or finished
    nextTick(() => {
      if (activityInput.value && !currentActivity.value) {
        // Keep input if timer was just finished/reset but activity is different
      }
    })
  }
})
</script>