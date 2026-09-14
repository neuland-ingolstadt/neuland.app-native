import { useHeaderHeight } from 'expo-router/react-navigation'
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

/**
 * Compact navigation-bar height for iOS form sheets.
 * Matches expo-router's `getDefaultHeaderHeight` for iPhone modal presentation.
 *
 * Native `useHeaderHeight()` often reports 0 here: expo-router defaults
 * iOS 26 form sheets to an absolutely positioned overlay header, then the
 * native height event overwrites the default with 0. Without a fallback,
 * share/title/close covers the first content rows on every bottom card.
 */
export const IOS_26_FORM_SHEET_HEADER_HEIGHT = 56

export const getFormSheetHeaderPadding = (
	headerHeight: number,
	ios26OrLater = isIos26OrLater()
): number => {
	if (!ios26OrLater) {
		return 0
	}

	return Math.max(headerHeight, IOS_26_FORM_SHEET_HEADER_HEIGHT)
}

export const useFormSheetHeaderPadding = (): number => {
	const headerHeight = useHeaderHeight()

	return getFormSheetHeaderPadding(headerHeight)
}
