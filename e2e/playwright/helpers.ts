import { expect, type Page } from '@playwright/test'

// useMMKVString() without an explicit instance uses MMKV's default storage id.
const MMKV_PREFIX = 'mmkv.default\\'

export async function seedGuestUser(page: Page): Promise<void> {
	await page.addInitScript((prefix: string) => {
		localStorage.setItem(`${prefix}userType`, 'guest')
	}, MMKV_PREFIX)
}

export async function waitForAppShell(page: Page): Promise<void> {
	await page.waitForLoadState('domcontentloaded')
	await page.waitForTimeout(1500)
}

export async function expectNotOnLogin(page: Page): Promise<void> {
	await expect(page).not.toHaveURL(/\/login\/?$/)
	await expect(
		page.getByText(/continue as guest|als Gast fortfahren/i)
	).not.toBeVisible()
}
