import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTagManagement } from './useTagManagement'

// Mock Nuxt composables
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useTagManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Tag Favorites', () => {
    it('should add tag to favorites', async () => {
      mockFetch.mockResolvedValueOnce({ data: { success: true } })
      
      const { addToFavorites, favoriteTags } = useTagManagement()
      
      await addToFavorites('work')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/favorites', {
        method: 'POST',
        body: { tagName: 'work' }
      })
      expect(favoriteTags.value).toContain('work')
    })

    it('should remove tag from favorites', async () => {
      const { addToFavorites, removeFromFavorites, favoriteTags } = useTagManagement()
      
      // Setup initial state
      mockFetch.mockResolvedValueOnce({ data: { success: true } })
      await addToFavorites('work')
      mockFetch.mockResolvedValueOnce({ data: { success: true } })
      await addToFavorites('meeting')
      
      // Now test removal
      mockFetch.mockResolvedValueOnce({ data: { success: true } })
      await removeFromFavorites('work')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/favorites/work', {
        method: 'DELETE'
      })
      expect(favoriteTags.value).not.toContain('work')
      expect(favoriteTags.value).toContain('meeting')
    })

    it('should toggle favorite status', async () => {
      mockFetch.mockResolvedValueOnce({ data: { success: true } })
      
      const { toggleFavorite, favoriteTags } = useTagManagement()
      
      await toggleFavorite('work')
      
      expect(favoriteTags.value).toContain('work')
      
      mockFetch.mockResolvedValueOnce({ data: { success: true } })
      await toggleFavorite('work')
      
      expect(favoriteTags.value).not.toContain('work')
    })

    it('should load favorites on initialization', async () => {
      mockFetch.mockResolvedValueOnce({ data: ['work', 'meeting', 'focus'] })
      
      const { loadFavorites, favoriteTags } = useTagManagement()
      
      await loadFavorites()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/favorites')
      expect(favoriteTags.value).toEqual(['work', 'meeting', 'focus'])
    })
  })

  describe('Tag Editing', () => {
    it('should rename tag across all activities', async () => {
      mockFetch.mockResolvedValueOnce({ 
        data: { 
          updatedActivities: 5,
          success: true 
        } 
      })
      
      const { renameTag } = useTagManagement()
      
      const result = await renameTag('old-tag', 'new-tag')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/rename', {
        method: 'PATCH',
        body: { 
          oldName: 'old-tag', 
          newName: 'new-tag' 
        }
      })
      expect(result.success).toBe(true)
      expect(result.updatedActivities).toBe(5)
    })

    it('should handle rename conflicts', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Tag already exists'))
      
      const { renameTag, error } = useTagManagement()
      
      const result = await renameTag('work', 'meeting')
      
      expect(result.success).toBe(false)
      expect(error.value).toContain('already exists')
    })

    it('should validate tag names before renaming', async () => {
      const { renameTag, error } = useTagManagement()
      
      const result = await renameTag('work', '')
      
      expect(result.success).toBe(false)
      expect(error.value).toContain('required')
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Tag Statistics', () => {
    it('should calculate tag usage statistics', async () => {
      mockFetch.mockResolvedValueOnce({ 
        data: [
          { name: 'work', count: 15, totalTime: 18000000, avgDuration: 1200000 },
          { name: 'meeting', count: 8, totalTime: 7200000, avgDuration: 900000 },
          { name: 'focus', count: 12, totalTime: 21600000, avgDuration: 1800000 }
        ]
      })
      
      const { getTagStatistics } = useTagManagement()
      
      const stats = await getTagStatistics()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/statistics')
      expect(stats).toHaveLength(3)
      expect(stats[0]).toEqual({
        name: 'work',
        count: 15,
        totalTime: 18000000,
        avgDuration: 1200000
      })
    })

    it('should format statistics with productivity scores', async () => {
      mockFetch.mockResolvedValueOnce({ 
        data: [
          { name: 'focus', count: 10, totalTime: 36000000, avgDuration: 3600000 }
        ]
      })
      
      const { getTagStatistics, formatTagStats } = useTagManagement()
      
      const stats = await getTagStatistics()
      const formatted = formatTagStats(stats[0])
      
      expect(formatted.productivityScore).toBeGreaterThan(0)
      expect(formatted.formattedDuration).toBe('10h 0m')
      expect(formatted.formattedAvgDuration).toBe('1h 0m')
    })
  })

  describe('Tag Removal', () => {
    it('should remove tag from all activities without deleting activities', async () => {
      mockFetch.mockResolvedValueOnce({ 
        data: { 
          updatedActivities: 8,
          removedFromActivities: true,
          deletedActivities: 0
        } 
      })
      
      const { removeTag } = useTagManagement()
      
      const result = await removeTag('deprecated-tag', false)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/remove', {
        method: 'DELETE',
        body: { 
          tagName: 'deprecated-tag', 
          deleteActivities: false 
        }
      })
      expect(result.updatedActivities).toBe(8)
      expect(result.deletedActivities).toBe(0)
    })

    it('should remove tag and delete activities that only have that tag', async () => {
      mockFetch.mockResolvedValueOnce({ 
        data: { 
          updatedActivities: 5,
          deletedActivities: 3,
          removedFromActivities: true
        } 
      })
      
      const { removeTag } = useTagManagement()
      
      const result = await removeTag('deprecated-tag', true)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/tags/remove', {
        method: 'DELETE',
        body: { 
          tagName: 'deprecated-tag', 
          deleteActivities: true 
        }
      })
      expect(result.updatedActivities).toBe(5)
      expect(result.deletedActivities).toBe(3)
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      
      const { addToFavorites, error } = useTagManagement()
      
      await addToFavorites('work')
      
      expect(error.value).toContain('Network error')
    })

    it('should clear errors on successful operations', async () => {
      const { addToFavorites, error } = useTagManagement()
      
      // First operation fails
      mockFetch.mockRejectedValueOnce(new Error('Server error'))
      await addToFavorites('work')
      expect(error.value).toBeTruthy()
      
      // Next operation succeeds
      mockFetch.mockResolvedValueOnce({ data: { success: true } })
      await addToFavorites('meeting')
      expect(error.value).toBeNull()
    })
  })
})