import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000'

export default defineConfig({
	testDir: './e2e/playwright',
	outputDir: './e2e/playwright/test-results',
	fullyParallel: false,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: [['list']],
	use: {
		baseURL,
		trace: 'off',
		screenshot: 'off',
		video: 'off',
		viewport: { width: 390, height: 844 }
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: process.env.PLAYWRIGHT_SKIP_WEB_SERVER
		? undefined
		: {
				command: 'bunx serve dist -s -l 3000',
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000
			}
})
