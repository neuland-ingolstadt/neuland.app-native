import { Platform } from 'react-native'
import type { Platform as AnnouncementPlatform } from '@/__generated__/gql/graphql'

export type WebPlatform = 'web-dev' | 'web' | 'web-local'

export const NEULAND_DEV_HOST = 'dev.neuland.app'
export const NEULAND_WEB_HOST = 'web.neuland.app'

export const NEULAND_APP_HOSTS = [NEULAND_DEV_HOST, NEULAND_WEB_HOST] as const

export function isNeulandAppHost(hostname: string): boolean {
	return hostname === NEULAND_DEV_HOST || hostname === NEULAND_WEB_HOST
}

export function resolveAnnouncementPlatform(
	hostname?: string
): AnnouncementPlatform {
	if (Platform.OS === 'ios') {
		return 'IOS'
	}

	if (Platform.OS === 'android') {
		return 'ANDROID'
	}

	const host =
		hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')

	if (isDevNeulandHost(host)) {
		return 'WEB_DEV'
	}

	return 'WEB'
}

/** Resolves the GraphQL announcement platform at call time (not module load). */
export function getAnnouncementPlatform(): AnnouncementPlatform {
	return resolveAnnouncementPlatform()
}

export function resolveWebPlatform(hostname: string): WebPlatform {
	if (hostname === NEULAND_DEV_HOST) {
		return 'web-dev'
	}

	if (hostname === NEULAND_WEB_HOST) {
		return 'web'
	}

	return 'web-local'
}

export function isDevNeulandHost(hostname: string): boolean {
	return hostname === NEULAND_DEV_HOST
}
