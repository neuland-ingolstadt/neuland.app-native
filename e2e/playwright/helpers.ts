import type { Page } from '@playwright/test'

const MMKV_PREFIX = 'user-settings-storage\\'

export async function seedGuestUser(page: Page): Promise<void> {
	await page.addInitScript((prefix: string) => {
		localStorage.setItem(`${prefix}userType`, 'guest')
	}, MMKV_PREFIX)
}

export async function waitForAppShell(page: Page): Promise<void> {
	await page.waitForLoadState('domcontentloaded')
	await page.waitForTimeout(1500)
}
