import { test, expect } from '@playwright/test'

test.describe('Timer Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
    
    // Wait for the app to load
    await expect(page.locator('[data-testid="activity-input"]')).toBeVisible()
  })

  test('complete timer workflow: start → pause → resume → finish', async ({ page }) => {
    // Step 1: Enter activity and start timer
    await page.fill('[data-testid="activity-input"]', 'Work on project #urgent !2')
    await page.click('[data-testid="start-timer"]')

    // Verify timer started
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
    await expect(page.locator('text=Running')).toBeVisible()
    await expect(page.locator('[data-testid="pause-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="finish-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-timer"]')).toBeVisible()
    
    // Verify input is disabled during timer
    await expect(page.locator('[data-testid="activity-input"]')).toBeDisabled()

    // Step 2: Pause timer
    await page.click('[data-testid="pause-timer"]')

    // Verify timer paused
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-yellow-500/)
    await expect(page.locator('text=Paused')).toBeVisible()
    await expect(page.locator('[data-testid="resume-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="finish-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-timer"]')).toBeVisible()

    // Step 3: Resume timer
    await page.click('[data-testid="resume-timer"]')

    // Verify timer resumed
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
    await expect(page.locator('text=Running')).toBeVisible()
    await expect(page.locator('[data-testid="pause-timer"]')).toBeVisible()

    // Step 4: Finish timer
    await page.click('[data-testid="finish-timer"]')

    // Verify timer finished and activity saved
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('00:00')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-gray-300/)
    await expect(page.locator('[data-testid="start-timer"]')).toBeVisible()
    
    // Input should be enabled again and cleared
    await expect(page.locator('[data-testid="activity-input"]')).toBeEnabled()
    await expect(page.locator('[data-testid="activity-input"]')).toHaveValue('')

    // Activity should appear in the activity list
    await expect(page.locator('text=Work on project #urgent !2')).toBeVisible()
  })

  test('start timer with Enter key', async ({ page }) => {
    await page.fill('[data-testid="activity-input"]', 'Meeting with team')
    await page.press('[data-testid="activity-input"]', 'Enter')

    // Verify timer started
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
    await expect(page.locator('text=Running')).toBeVisible()
  })

  test('reset timer workflow', async ({ page }) => {
    // Start timer
    await page.fill('[data-testid="activity-input"]', 'Test activity')
    await page.click('[data-testid="start-timer"]')

    // Wait a moment for timer to run
    await page.waitForTimeout(1000)

    // Reset timer
    await page.click('[data-testid="reset-timer"]')

    // Verify reset
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('00:00')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-gray-300/)
    await expect(page.locator('[data-testid="activity-input"]')).toBeEnabled()
    await expect(page.locator('[data-testid="activity-input"]')).toHaveValue('')
    await expect(page.locator('[data-testid="start-timer"]')).toBeVisible()
  })

  test('timer persistence across page refresh', async ({ page }) => {
    // Start timer
    await page.fill('[data-testid="activity-input"]', 'Persistent activity')
    await page.click('[data-testid="start-timer"]')

    // Verify timer is running
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)

    // Refresh page
    await page.reload()

    // Wait for app to load
    await expect(page.locator('[data-testid="activity-input"]')).toBeVisible()

    // Verify timer state is restored
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
    await expect(page.locator('text=Persistent activity')).toBeVisible()
    await expect(page.locator('[data-testid="pause-timer"]')).toBeVisible()
  })

  test('cannot start timer with empty input', async ({ page }) => {
    // Try to start timer with empty input
    await expect(page.locator('[data-testid="start-timer"]')).toBeDisabled()

    // Try to start with whitespace only
    await page.fill('[data-testid="activity-input"]', '   ')
    await expect(page.locator('[data-testid="start-timer"]')).toBeDisabled()

    // Add valid input
    await page.fill('[data-testid="activity-input"]', 'Valid activity')
    await expect(page.locator('[data-testid="start-timer"]')).toBeEnabled()
  })

  test('timer display updates correctly', async ({ page }) => {
    // Start timer
    await page.fill('[data-testid="activity-input"]', 'Timer display test')
    await page.click('[data-testid="start-timer"]')

    // Initial display should be 00:00 or 00:01
    const initialTime = await page.locator('[data-testid="timer-display"]').textContent()
    expect(initialTime).toMatch(/00:0[0-1]/)

    // Wait a few seconds and check that time has progressed
    await page.waitForTimeout(3000)
    const laterTime = await page.locator('[data-testid="timer-display"]').textContent()
    expect(laterTime).toMatch(/00:0[3-5]/)
  })

  test('activity with tags and priority displays correctly', async ({ page }) => {
    const activityText = 'Work on feature #urgent #frontend !3'
    
    await page.fill('[data-testid="activity-input"]', activityText)

    // Verify tags and priority are displayed in real-time
    await expect(page.locator('text=#urgent')).toBeVisible()
    await expect(page.locator('text=#frontend')).toBeVisible()
    await expect(page.locator('text=!3')).toBeVisible()

    // Start timer
    await page.click('[data-testid="start-timer"]')

    // Verify activity shows in timer display
    await expect(page.locator(`text=${activityText}`)).toBeVisible()
  })
})

test.describe('Timer Accessibility', () => {
  test('keyboard navigation works correctly', async ({ page }) => {
    await page.goto('/')

    // Focus on input and type
    await page.focus('[data-testid="activity-input"]')
    await page.keyboard.type('Keyboard test activity')

    // Press Enter to start timer
    await page.keyboard.press('Enter')

    // Verify timer started
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
  })

  test('has proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/')

    // Check label association
    const input = page.locator('[data-testid="activity-input"]')
    const labelFor = await page.locator('label[for="activity-input"]').textContent()
    expect(labelFor).toContain('What are you working on?')

    // Check button accessibility
    const startButton = page.locator('[data-testid="start-timer"]')
    await expect(startButton).toHaveAttribute('type', 'button')
  })
})

test.describe('Timer Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    // Start timer
    await page.fill('[data-testid="activity-input"]', 'Network error test')
    await page.click('[data-testid="start-timer"]')

    // Simulate network failure by going offline
    await page.context().setOffline(true)

    // Try to finish timer
    await page.click('[data-testid="finish-timer"]')

    // Should handle error gracefully (timer might remain in current state)
    // The exact behavior depends on implementation
    // At minimum, the app shouldn't crash
    await expect(page.locator('[data-testid="timer-display"]')).toBeVisible()
  })

  test('handles invalid timer state gracefully', async ({ page }) => {
    await page.goto('/')

    // Manually corrupt localStorage timer state
    await page.evaluate(() => {
      localStorage.setItem('flowductiv-timer-state', 'invalid-json')
    })

    // Refresh page
    await page.reload()

    // App should still load without crashing
    await expect(page.locator('[data-testid="activity-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('00:00')
  })
})

test.describe('Mobile Timer Workflow', () => {
  test('timer works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Start timer on mobile
    await page.fill('[data-testid="activity-input"]', 'Mobile timer test')
    await page.tap('[data-testid="start-timer"]')

    // Verify timer works on mobile
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
    
    // Test mobile touch interactions
    await page.tap('[data-testid="pause-timer"]')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-yellow-500/)
    
    await page.tap('[data-testid="resume-timer"]')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
  })
})