import type React from 'react'
import { Platform } from 'react-native'
import {
	CloseHeaderButton,
	ShareHeaderButton
} from '@/components/Universal/share-header-button'

interface HeaderButtonOptions {
	onShare?: () => void | Promise<void>
	noShare?: boolean
}

/**
 * Returns platform-specific header button configuration
 * - iOS: Share button on left, Close button on right
 * - Android/Web: Share button on right, no close button (uses back gesture/button)
 */
export function getPlatformHeaderButtons({
	onShare,
	noShare = false
}: HeaderButtonOptions): {
	headerLeft?: () => React.JSX.Element | undefined
	headerRight?: () => React.JSX.Element | undefined
} {
	if (Platform.OS === 'ios') {
		return {
			headerLeft: onShare
				? () => <ShareHeaderButton onPress={onShare} noShare={noShare} />
				: undefined,
			headerRight: () => <CloseHeaderButton />
		}
	}

	// Android and Web
	return {
		headerLeft: undefined,
		headerRight: onShare
			? () => <ShareHeaderButton onPress={onShare} noShare={noShare} />
			: undefined
	}
}
