import { type Ref, computed, readonly } from 'vue'
import type { ActivityInput } from '~/composables/useActivities'
import { InputParserService } from '~/services/inputParser'
import type { ParsedActivity } from '~/types/activity'

export const useInputParser = (inputRef: Ref<string>) => {
  // Reactive parsed activity
  const parsedActivity = computed<ParsedActivity>(() => {
    return InputParserService.parseActivity(inputRef.value)
  })

  // Individual computed properties for convenience
  const tags = computed(() => parsedActivity.value.tags)
  const priority = computed(() => parsedActivity.value.priority)
  const focusRating = computed(() => parsedActivity.value.focusRating)
  const cleanText = computed(() => parsedActivity.value.cleanText)

  // Utility to create ActivityInput from parsed data
  const createActivityInput = (timing: {
    durationMs: number
    startTime: Date
    endTime: Date
  }): ActivityInput => {
    const parsed = parsedActivity.value

    return {
      title: parsed.cleanText || 'Untitled Activity',
      description: parsed.originalText !== parsed.cleanText ? parsed.originalText : undefined,
      durationMs: timing.durationMs,
      startTime: timing.startTime,
      endTime: timing.endTime,
      tags: parsed.tags,
      priority: parsed.priority,
      focusRating: parsed.focusRating,
      energyLevel: null,
    }
  }

  return {
    // Readonly reactive state
    parsedActivity: readonly(parsedActivity),
    tags: readonly(tags),
    priority: readonly(priority),
    focusRating: readonly(focusRating),
    cleanText: readonly(cleanText),

    // Utilities
    createActivityInput,
  }
}
