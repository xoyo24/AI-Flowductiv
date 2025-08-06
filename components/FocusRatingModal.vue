<template>
  <div 
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    data-testid="focus-rating-modal"
    @click="handleBackdropClick"
  >
    <div 
      class="content-card p-6 max-w-md w-full mx-4"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="text-center mb-6">
        <h3 class="text-lg font-semibold text-foreground mb-2">
          How was your focus?
        </h3>
        <p class="text-sm text-muted-foreground">
          Rate your focus for "{{ activity?.title }}"
        </p>
      </div>

      <!-- Star Rating -->
      <div class="flex justify-center space-x-2 mb-8">
        <button
          v-for="star in 5"
          :key="star"
          :data-testid="'star-button'"
          :class="{
            'text-yellow-400': star <= currentRating,
            'text-gray-300': star > currentRating
          }"
          class="p-2 transition-all duration-200 hover:scale-110"
          @click="setRating(star)"
        >
          <Star
            :class="{
              'fill-current': star <= currentRating
            }"
            class="w-8 h-8"
          />
        </button>
      </div>

      <!-- Rating Labels -->
      <div class="text-center mb-6">
        <p v-if="currentRating" class="text-sm text-muted-foreground">
          {{ getRatingLabel(currentRating) }}
        </p>
        <p v-else class="text-sm text-muted-foreground">
          Click a star to rate your focus
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center space-x-3">
        <button 
          data-testid="skip-button"
          @click="handleSkip"
          class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip for now
        </button>
        <button 
          data-testid="cancel-button"
          @click="handleCancel"
          class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button 
          data-testid="save-button"
          :disabled="!currentRating"
          @click="handleSave"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Save Rating
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

interface Props {
  isOpen: boolean
  activity: {
    id: string
    title: string
    focusRating?: number | null
  } | null
}

interface Emits {
  (e: 'rating-changed', rating: number): void
  (e: 'save', rating: number): void
  (e: 'skip'): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Internal rating state
const currentRating = ref<number>(0)

// Watch for activity changes to initialize rating
watch(
  () => props.activity,
  (newActivity) => {
    if (newActivity) {
      currentRating.value = newActivity.focusRating || 0
    }
  },
  { immediate: true }
)

// Rating labels for user feedback
const _getRatingLabel = (rating: number): string => {
  const labels = {
    1: "Very distracted - couldn't stay focused",
    2: 'Somewhat distracted - frequent interruptions',
    3: 'Moderate focus - some distractions',
    4: 'Good focus - stayed on task most of the time',
    5: 'Excellent focus - completely absorbed in the task',
  }
  return labels[rating as keyof typeof labels] || ''
}

// Actions
const _setRating = (rating: number) => {
  currentRating.value = rating
  emit('rating-changed', rating)
}

const _handleSave = () => {
  if (currentRating.value > 0) {
    emit('save', currentRating.value)
  }
}

const _handleSkip = () => {
  emit('skip')
}

const _handleCancel = () => {
  emit('close')
}

const _handleBackdropClick = () => {
  emit('close')
}
</script>