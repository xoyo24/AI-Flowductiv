import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import AnalyticsDialog from './AnalyticsDialog.vue'

describe('AnalyticsDialog', () => {
  it('should render when open', async () => {
    const wrapper = await mountSuspended(AnalyticsDialog, {
      props: {
        isOpen: true
      }
    })

    expect(wrapper.find('h2').text()).toBe('Analytics & Insights')
    expect(wrapper.find('[data-testid="overview-tab"]').exists()).toBe(false) // No test id yet
    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.text()).toContain('AI Insights')
    expect(wrapper.text()).toContain('Settings')
  })

  it('should not render when closed', async () => {
    const wrapper = await mountSuspended(AnalyticsDialog, {
      props: {
        isOpen: false
      }
    })

    expect(wrapper.find('h2').exists()).toBe(false)
  })

  it('should emit close event when backdrop is clicked', async () => {
    const wrapper = await mountSuspended(AnalyticsDialog, {
      props: {
        isOpen: true
      }
    })

    // Find backdrop (first div with backdrop classes)
    const backdrop = wrapper.find('.bg-black\\/50')
    await backdrop.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should emit close event when close button is clicked', async () => {
    const wrapper = await mountSuspended(AnalyticsDialog, {
      props: {
        isOpen: true
      }
    })

    // Find close button (button with X icon)
    const closeButton = wrapper.find('button[aria-label="Close dialog"]')
    await closeButton.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should display overview tab content by default', async () => {
    const wrapper = await mountSuspended(AnalyticsDialog, {
      props: {
        isOpen: true
      }
    })

    // Should show today stats
    expect(wrapper.text()).toContain('Today')
    expect(wrapper.text()).toContain('This Week') 
    expect(wrapper.text()).toContain('Total Tracked')
    expect(wrapper.text()).toContain('Peak Performance Hours')
  })

  it('should be mobile responsive', async () => {
    const wrapper = await mountSuspended(AnalyticsDialog, {
      props: {
        isOpen: true
      }
    })

    // Check for mobile responsive classes
    const dialog = wrapper.find('.max-w-4xl')
    expect(dialog.exists()).toBe(true)
    
    // Check for mobile grid layout
    const statsGrid = wrapper.find('.grid.grid-cols-1.md\\:grid-cols-3')
    expect(statsGrid.exists()).toBe(true)
  })
})