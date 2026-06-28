export const NEULAND_DEV_HOST = 'dev.neuland.app'
export const NEULAND_WEB_HOST = 'web.neuland.app'

export const NEULAND_APP_HOSTS = [NEULAND_DEV_HOST, NEULAND_WEB_HOST] as const

export function isNeulandAppHost(hostname: string): boolean {
	return hostname === NEULAND_DEV_HOST || hostname === NEULAND_WEB_HOST
}
