import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFocusRating } from '~/composables/useFocusRating'

// Mock useActivities composable
const mockUpdateActivity = vi.fn()
globalThis.useActivities = vi.fn(() => ({
  updateActivity: mockUpdateActivity,
}))

describe('useFocusRating Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the singleton state
    const { closeModal } = useFocusRating()
    closeModal()
  })

  it('should initialize with closed modal state', () => {
    const { showModal, pendingActivity } = useFocusRating()

    expect(showModal.value).toBe(false)
    expect(pendingActivity.value).toBeNull()
  })

  it('should show modal when prompting for rating', () => {
    const mockActivity = { id: 'test-id', title: 'Test Activity' }
    const { showModal, pendingActivity, promptForRating } = useFocusRating()

    promptForRating(mockActivity)

    expect(showModal.value).toBe(true)
    expect(pendingActivity.value).toEqual(mockActivity)
  })

  it('should maintain singleton state across multiple instances', () => {
    const mockActivity = { id: 'test-id', title: 'Test Activity' }
    
    // Create first instance and prompt for rating
    const instance1 = useFocusRating()
    instance1.promptForRating(mockActivity)
    
    // Create second instance - should see the same state
    const instance2 = useFocusRating()
    
    expect(instance1.showModal.value).toBe(true)
    expect(instance2.showModal.value).toBe(true)
    expect(instance1.pendingActivity.value).toEqual(mockActivity)
    expect(instance2.pendingActivity.value).toEqual(mockActivity)
  })

  it('should close modal and clear state when closeModal is called', () => {
    const mockActivity = { id: 'test-id', title: 'Test Activity' }
    const { showModal, pendingActivity, promptForRating, closeModal } = useFocusRating()

    // First show the modal
    promptForRating(mockActivity)
    expect(showModal.value).toBe(true)
    expect(pendingActivity.value).toEqual(mockActivity)

    // Then close it
    closeModal()
    expect(showModal.value).toBe(false)
    expect(pendingActivity.value).toBeNull()
  })

  it('should close modal when skipRating is called', () => {
    const mockActivity = { id: 'test-id', title: 'Test Activity' }
    const { showModal, pendingActivity, promptForRating, skipRating } = useFocusRating()

    // First show the modal
    promptForRating(mockActivity)
    expect(showModal.value).toBe(true)

    // Then skip rating
    skipRating()
    expect(showModal.value).toBe(false)
    expect(pendingActivity.value).toBeNull()
  })

  it('should save rating and close modal when saveRating is called', async () => {
    const mockActivity = { id: 'test-id', title: 'Test Activity' }
    mockUpdateActivity.mockResolvedValue(true)

    const { showModal, pendingActivity, promptForRating, saveRating } = useFocusRating()

    // First show the modal
    promptForRating(mockActivity)
    expect(showModal.value).toBe(true)

    // Save rating
    const result = await saveRating(4)

    expect(result).toBe(true)
    expect(mockUpdateActivity).toHaveBeenCalledWith('test-id', { focusRating: 4 })
    expect(showModal.value).toBe(false)
    expect(pendingActivity.value).toBeNull()
  })

  it('should return false when saveRating is called without pending activity', async () => {
    const { saveRating } = useFocusRating()

    const result = await saveRating(4)

    expect(result).toBe(false)
    expect(mockUpdateActivity).not.toHaveBeenCalled()
  })
})