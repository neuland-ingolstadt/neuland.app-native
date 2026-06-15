export type WebPlatform = 'web-dev' | 'web' | 'web-local'

export function resolveWebPlatform(hostname: string): WebPlatform {
	if (hostname === 'dev.neuland.app') {
		return 'web-dev'
	}

	if (hostname === 'web.neuland.app') {
		return 'web'
	}

	return 'web-local'
}

export function isDevNeulandHost(hostname: string): boolean {
	return hostname === 'dev.neuland.app'
}
