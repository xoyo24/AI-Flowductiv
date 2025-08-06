import { readonly, ref } from 'vue'

export interface FocusRatingState {
  showModal: boolean
  pendingActivity: any | null
}

// Global singleton state - shared across all useFocusRating() calls
const showModal = ref(false)
const pendingActivity = ref<any | null>(null)

export const useFocusRating = () => {
  // Actions
  const promptForRating = (activity: any) => {
    pendingActivity.value = activity
    showModal.value = true
  }

  const saveRating = async (rating: number): Promise<boolean> => {
    if (!pendingActivity.value) return false

    try {
      // Update the activity with the focus rating
      const { updateActivity } = useActivities()
      const updatedActivity = {
        ...pendingActivity.value,
        focusRating: rating,
      }

      await updateActivity(updatedActivity.id, { focusRating: rating })

      // Clear state
      closeModal()
      return true
    } catch (error) {
      console.error('Failed to save focus rating:', error)
      return false
    }
  }

  const skipRating = () => {
    // Just close the modal without saving
    closeModal()
  }

  const closeModal = () => {
    showModal.value = false
    pendingActivity.value = null
  }

  return {
    // State (readonly)
    showModal: readonly(showModal),
    pendingActivity: readonly(pendingActivity),

    // Actions
    promptForRating,
    saveRating,
    skipRating,
    closeModal,
  }
}
