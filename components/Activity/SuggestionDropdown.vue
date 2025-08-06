<template>
  <div
    v-if="visible && (suggestions.length > 0 || loading)"
    data-testid="suggestion-dropdown"
    class="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto"
    role="listbox"
    aria-label="Activity suggestions"
  >
    <!-- Loading state -->
    <div
      v-if="loading"
      data-testid="loading-suggestions"
      class="p-3 text-center text-muted-foreground"
    >
      <div class="flex items-center justify-center space-x-2">
        <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span>Loading suggestions...</span>
      </div>
    </div>

    <!-- Suggestions list -->
    <div v-else-if="suggestions.length > 0" class="py-1">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="suggestion.id"
        :data-testid="'suggestion-item'"
        :data-type="suggestion.type"
        class="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
        :class="{
          'bg-accent text-accent-foreground selected': index === selectedIndex
        }"
        role="option"
        :aria-selected="index === selectedIndex"
        :aria-describedby="index === selectedIndex ? `suggestion-${index}-desc` : undefined"
        tabindex="-1"
        @click.stop="selectSuggestion(suggestion)"
        @mouseenter="$emit('hover', index)"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <!-- Activity suggestions -->
            <div v-if="suggestion.type === 'activity'" class="flex flex-col">
              <span class="text-sm font-medium truncate">{{ suggestion.text }}</span>
              <span class="text-xs text-muted-foreground">
                Activity • Used {{ suggestion.frequency }} times
              </span>
            </div>
            
            <!-- Tag suggestions -->
            <div v-else class="flex flex-col">
              <span class="text-sm font-medium">
                <span class="text-primary">#</span>{{ suggestion.text }}
              </span>
              <span class="text-xs text-muted-foreground">
                Tag • Used {{ suggestion.frequency }} times
              </span>
            </div>
          </div>
          
          <!-- Suggestion type indicator -->
          <div class="ml-2 flex-shrink-0">
            <span
              v-if="suggestion.type === 'activity'"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              Activity
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            >
              Tag
            </span>
          </div>
        </div>

        <!-- Screen reader description -->
        <span
          v-if="index === selectedIndex"
          :id="`suggestion-${index}-desc`"
          class="sr-only"
        >
          {{ suggestion.type === 'activity' ? 'Activity suggestion' : 'Tag suggestion' }}
          {{ suggestion.text }}, used {{ suggestion.frequency }} times
        </span>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      data-testid="no-suggestions"
      class="p-3 text-center text-muted-foreground"
    >
      <div class="text-sm">No suggestions found</div>
      <div class="text-xs mt-1">Try typing a different activity or tag</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ActivitySuggestion } from '~/types/activity'

interface Props {
  suggestions: ActivitySuggestion[]
  visible: boolean
  selectedIndex: number
  loading?: boolean
  inputWidth?: number
}

interface Emits {
  (e: 'select', suggestion: ActivitySuggestion): void
  (e: 'hover', index: number): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Selection handlers
const _selectSuggestion = (suggestion: ActivitySuggestion) => {
  emit('select', suggestion)
}

const handleEnterKey = () => {
  // Handle enter key to select current suggestion
  if (props.selectedIndex >= 0 && props.selectedIndex < props.suggestions.length) {
    emit('select', props.suggestions[props.selectedIndex])
  }
}

const handleEscapeKey = () => {
  // Handle escape key to close dropdown
  emit('close')
}

// Expose methods for parent component
defineExpose({
  handleEnterKey,
  handleEscapeKey,
})
</script>

<style scoped>
/* Custom scrollbar for better UX */
.max-h-60::-webkit-scrollbar {
  width: 6px;
}

.max-h-60::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-60::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.max-h-60::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}

/* Loading animation - using Tailwind's built-in spin animation */

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>