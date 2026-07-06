import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { seedGuestUser, waitForAppShell, expectNotOnLogin } from './helpers'

const outputDir = 'e2e/playwright/output'

test.beforeAll(async () => {
	await mkdir(outputDir, { recursive: true })
})

test.describe('web screenshots', () => {
	test('login screen', async ({ page }) => {
		await page.goto('/login')
		await waitForAppShell(page)
		await expect(
			page.getByText(/continue as guest|als Gast fortfahren/i)
		).toBeVisible({ timeout: 30_000 })

		await page.screenshot({
			path: `${outputDir}/login.png`,
			fullPage: false
		})
	})

	test('dashboard as guest', async ({ page }) => {
		await seedGuestUser(page)
		await page.goto('/')
		await waitForAppShell(page)
		await expectNotOnLogin(page)

		await page.screenshot({
			path: `${outputDir}/dashboard.png`,
			fullPage: false
		})
	})

	test('food tab as guest', async ({ page }) => {
		await seedGuestUser(page)
		await page.goto('/food')
		await waitForAppShell(page)
		await expectNotOnLogin(page)

		await page.screenshot({
			path: `${outputDir}/food.png`,
			fullPage: false
		})
	})

	test('settings tab as guest', async ({ page }) => {
		await seedGuestUser(page)
		await page.goto('/settings')
		await waitForAppShell(page)
		await expectNotOnLogin(page)

		await page.screenshot({
			path: `${outputDir}/settings.png`,
			fullPage: false
		})
	})
})
