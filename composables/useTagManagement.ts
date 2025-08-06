import { computed, readonly, ref } from 'vue'

export interface TagStatistic {
  name: string
  count: number
  totalTime: number
  avgDuration: number
  productivityScore?: number
  formattedDuration?: string
  formattedAvgDuration?: string
}

export interface TagOperationResult {
  success: boolean
  updatedActivities?: number
  deletedActivities?: number
  error?: string
}

export const useTagManagement = () => {
  // Reactive state
  const favoriteTags = ref<string[]>([])
  const allTags = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Utility function to clear errors
  const clearError = () => {
    error.value = null
  }

  // Utility function to handle API errors
  const handleError = (err: any): void => {
    console.error('Tag management error:', err)
    error.value = err.message || 'An error occurred'
  }

  // Tag Favorites Management
  const loadFavorites = async (): Promise<void> => {
    loading.value = true
    clearError()

    try {
      const response = await $fetch<{ data: string[] }>('/api/tags/favorites')
      favoriteTags.value = response.data
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  const addToFavorites = async (tagName: string): Promise<void> => {
    loading.value = true
    clearError()

    try {
      await $fetch('/api/tags/favorites', {
        method: 'POST',
        body: { tagName },
      })

      if (!favoriteTags.value.includes(tagName)) {
        favoriteTags.value.push(tagName)
      }
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  const removeFromFavorites = async (tagName: string): Promise<void> => {
    loading.value = true
    clearError()

    try {
      await $fetch(`/api/tags/favorites/${tagName}`, {
        method: 'DELETE',
      })

      favoriteTags.value = favoriteTags.value.filter((tag) => tag !== tagName)
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  const toggleFavorite = async (tagName: string): Promise<void> => {
    if (favoriteTags.value.includes(tagName)) {
      await removeFromFavorites(tagName)
    } else {
      await addToFavorites(tagName)
    }
  }

  // Tag Editing
  const renameTag = async (oldName: string, newName: string): Promise<TagOperationResult> => {
    // Validation
    if (!newName.trim()) {
      error.value = 'New tag name is required'
      return { success: false, error: 'New tag name is required' }
    }

    if (oldName === newName) {
      error.value = 'New tag name must be different'
      return { success: false, error: 'New tag name must be different' }
    }

    loading.value = true
    clearError()

    try {
      const response = await $fetch<{ data: { updatedActivities: number; success: boolean } }>(
        '/api/tags/rename',
        {
          method: 'PATCH',
          body: {
            oldName: oldName.trim(),
            newName: newName.trim(),
          },
        }
      )

      // Update favorites if the renamed tag was a favorite
      if (favoriteTags.value.includes(oldName)) {
        favoriteTags.value = favoriteTags.value.map((tag) => (tag === oldName ? newName : tag))
      }

      return {
        success: true,
        updatedActivities: response.data.updatedActivities,
      }
    } catch (err) {
      handleError(err)
      return {
        success: false,
        error: error.value || 'Failed to rename tag',
      }
    } finally {
      loading.value = false
    }
  }

  // Tag Statistics
  const getTagStatistics = async (): Promise<TagStatistic[]> => {
    loading.value = true
    clearError()

    try {
      const response = await $fetch<{ data: TagStatistic[] }>('/api/tags/statistics')
      return response.data
    } catch (err) {
      handleError(err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Get All Unique Tags
  const getAllTags = async (): Promise<string[]> => {
    loading.value = true
    clearError()

    try {
      const response = await $fetch<{ data: string[] }>('/api/tags')
      allTags.value = response.data
      return response.data
    } catch (err) {
      handleError(err)
      return []
    } finally {
      loading.value = false
    }
  }

  const formatTagStats = (stat: TagStatistic): TagStatistic => {
    // Calculate productivity score based on average session length and frequency
    // Longer average sessions and higher frequency = higher productivity
    const avgHours = stat.avgDuration / (1000 * 60 * 60)
    const frequencyScore = Math.min(stat.count / 20, 1) // Normalize to max 20 activities
    const durationScore = Math.min(avgHours / 2, 1) // Normalize to max 2 hours avg
    const productivityScore = (frequencyScore + durationScore) / 2

    return {
      ...stat,
      productivityScore,
      formattedDuration: formatDuration(stat.totalTime),
      formattedAvgDuration: formatDuration(stat.avgDuration),
    }
  }

  // Tag Removal
  const removeTag = async (
    tagName: string,
    deleteActivities = false
  ): Promise<TagOperationResult> => {
    loading.value = true
    clearError()

    try {
      const response = await $fetch<{
        data: {
          updatedActivities: number
          deletedActivities: number
          removedFromActivities: boolean
        }
      }>('/api/tags/remove', {
        method: 'DELETE',
        body: {
          tagName,
          deleteActivities,
        },
      })

      // Remove from favorites if it was a favorite
      if (favoriteTags.value.includes(tagName)) {
        favoriteTags.value = favoriteTags.value.filter((tag) => tag !== tagName)
      }

      return {
        success: true,
        updatedActivities: response.data.updatedActivities,
        deletedActivities: response.data.deletedActivities,
      }
    } catch (err) {
      handleError(err)
      return {
        success: false,
        error: error.value || 'Failed to remove tag',
      }
    } finally {
      loading.value = false
    }
  }

  // Utility function for duration formatting (matches useActivities pattern)
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Computed properties
  const isFavorite = computed(() => (tagName: string): boolean => {
    return favoriteTags.value.includes(tagName)
  })

  const favoriteCount = computed(() => favoriteTags.value.length)

  const sortedFavorites = computed(() => {
    return [...favoriteTags.value].sort((a, b) => a.localeCompare(b))
  })

  return {
    // State (readonly)
    favoriteTags: readonly(favoriteTags),
    allTags: readonly(allTags),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    isFavorite,
    favoriteCount,
    sortedFavorites,

    // Favorites actions
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,

    // Tag editing actions
    renameTag,

    // Statistics actions
    getTagStatistics,
    formatTagStats,

    // Tag fetching actions
    getAllTags,

    // Tag removal actions
    removeTag,

    // Utilities
    formatDuration,
    clearError,
  }
}
