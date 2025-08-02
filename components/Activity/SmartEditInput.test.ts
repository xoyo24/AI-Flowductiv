import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import SmartEditInput from './SmartEditInput.vue'

// Mock composables
mockNuxtImport('useAutoComplete', () => {
  return () => ({
    suggestions: ref([]),
    isLoading: ref(false),
    selectNext: vi.fn(),
    selectPrevious: vi.fn(),
    performSearch: vi.fn(),
    getInitialSuggestions: vi.fn()
  })
})

mockNuxtImport('useInputParser', () => {
  return () => ({
    tags: ref(['test']),
    priority: ref(null),
    cleanText: ref('Test Activity')
  })
})

describe('SmartEditInput Component', () => {
  const mockActivity = {
    id: 'test-id',
    title: 'Test Activity #test',
    tags: ['test']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render activity edit form', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    expect(wrapper.find('[data-testid="edit-unified-input"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Activity')
  })


  it('should emit save event when Enter is pressed', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    const input = wrapper.find('[data-testid="edit-unified-input"]')
    await input.trigger('keyup.enter')

    expect(wrapper.emitted('save')).toBeTruthy()
  })

  it('should include title, tags, and priority in update emissions', async () => {
    const wrapper = await mountSuspended(SmartEditInput, {
      props: {
        activity: mockActivity
      }
    })

    // Change the input text to trigger update
    const input = wrapper.find('[data-testid="edit-unified-input"]')
    await input.setValue('New Activity Text')

    expect(wrapper.emitted('update')).toBeTruthy()
    const updateEvent = wrapper.emitted('update')?.[0]?.[0] as any
    expect(updateEvent).toHaveProperty('title')
    expect(updateEvent).toHaveProperty('tags')
    expect(updateEvent).toHaveProperty('priority')
  })
})