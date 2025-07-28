import { expect, test } from '@playwright/test'

test.describe('Timer Essential Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="activity-input"]')).toBeVisible()

    // Ensure clean state
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
    await expect(page.locator('[data-testid="activity-input"]')).toBeVisible()
  })

  test('Complete timer workflow: start → pause → resume → finish', async ({ page }) => {
    const activityText = 'Work on project #urgent'

    // STEP 1: Verify initial state
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('00:00')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-gray-300/)

    // STEP 2: Start timer using Enter key (most reliable method)
    await page.fill('[data-testid="activity-input"]', activityText)
    await page.press('[data-testid="activity-input"]', 'Enter')

    // STEP 3: Verify timer started
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
    await expect(page.locator('text=Running')).toBeVisible()
    await expect(page.locator('[data-testid="pause-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="finish-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-timer"]')).toBeVisible()

    // Verify input is disabled and shows current activity
    await expect(page.locator('[data-testid="activity-input"]')).toBeDisabled()
    await expect(page.locator(`text=${activityText}`)).toBeVisible()

    // STEP 4: Pause timer
    await page.click('[data-testid="pause-timer"]')

    // STEP 5: Verify paused state
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-yellow-500/)
    await expect(page.locator('text=Paused')).toBeVisible()
    await expect(page.locator('[data-testid="resume-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="finish-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="reset-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="pause-timer"]')).not.toBeVisible()

    // STEP 6: Resume timer
    await page.click('[data-testid="resume-timer"]')

    // STEP 7: Verify resumed state
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
    await expect(page.locator('text=Running')).toBeVisible()
    await expect(page.locator('[data-testid="pause-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="resume-timer"]')).not.toBeVisible()

    // STEP 8: Finish timer
    await page.click('[data-testid="finish-timer"]')

    // STEP 9: Verify finished state
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('00:00')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-gray-300/)
    await expect(page.locator('text=Stopped')).toBeVisible()

    // Input should be enabled and cleared
    await expect(page.locator('[data-testid="activity-input"]')).toBeEnabled()
    await expect(page.locator('[data-testid="activity-input"]')).toHaveValue('')
  })

  test('Timer input validation', async ({ page }) => {
    // Test that timer doesn't start with empty input
    await page.press('[data-testid="activity-input"]', 'Enter')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-gray-300/)

    // Test with valid input
    await page.fill('[data-testid="activity-input"]', 'Valid activity')
    await page.press('[data-testid="activity-input"]', 'Enter')
    await expect(page.locator('[data-testid="timer-status"]')).toHaveClass(/bg-green-500/)
  })
})
