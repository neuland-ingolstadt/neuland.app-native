import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Hook that provides the appropriate header padding for transparent headers on iOS 26+
 * Returns 0 padding for non-iOS or iOS < 26, and proper safe area + header padding for iOS 26+
 */
export const useTransparentHeaderPadding = (): number => {
	const insets = useSafeAreaInsets()

	// Only apply transparent header padding on iOS 26+
	const isIos26Plus =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26

	if (!isIos26Plus) {
		return 0
	}

	// For iOS 26+, add safe area top inset + header height
	return insets.top + 50
}

/**
 * Hook that provides the appropriate header style for transparent headers on iOS 26+
 * Returns transparent style for iOS 26+, empty object for others
 */
export const useTransparentHeaderStyle = () => {
	const isIos26Plus =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26

	if (!isIos26Plus) {
		return {}
	}

	return {
		headerTransparent: true,
		headerStyle: { backgroundColor: 'transparent' }
	}
}
