import { useHeaderHeight } from '@react-navigation/elements'
import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const isIos26OrLater = (): boolean => {
	// Needed because iOS 26+ places form-sheet content behind the Liquid Glass header, causing overlap.
	return Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
}

/**
 * Hook that provides the appropriate header padding for transparent headers on iOS 26+
 * Returns 0 padding for non-iOS or iOS < 26, and proper safe area + header padding for iOS 26+
 */
export const useTransparentHeaderPadding = (): number => {
	const insets = useSafeAreaInsets()

	if (!isIos26OrLater()) {
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
	if (!isIos26OrLater()) {
		return {}
	}

	return {
		headerTransparent: true,
		headerStyle: { backgroundColor: 'transparent' }
	}
}

export const useFormSheetHeaderPadding = (): number => {
	const headerHeight = useHeaderHeight()

	return isIos26OrLater() ? headerHeight : 0
}
