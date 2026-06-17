import { Platform } from 'react-native'
import { resolveWebPlatform } from '@/utils/web-host'

export function getEvaluationPlatform(): string {
	if (Platform.OS === 'ios') {
		return 'ios'
	}

	if (Platform.OS === 'android') {
		return 'android'
	}

	if (typeof window !== 'undefined') {
		return resolveWebPlatform(window.location.hostname)
	}

	return 'web-local'
}
