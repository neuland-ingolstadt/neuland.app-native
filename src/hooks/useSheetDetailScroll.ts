import { useHeaderHeight } from 'expo-router/react-navigation'
import type { ViewStyle } from 'react-native'
import {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { isIos26OrLater } from '@/hooks/useTransparentHeader'

export function useSheetDetailScroll() {
	const usesLiquidGlassHeader = isIos26OrLater()
	const headerHeight = useHeaderHeight()
	const topInset = usesLiquidGlassHeader ? headerHeight : 0
	const scrollOffset = useSharedValue(-topInset)
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollOffset.value = event.contentOffset.y
		}
	})

	const headerStyle = useAnimatedStyle<ViewStyle>(() => {
		// UIKit's automatic top inset starts contentOffset below zero. Use the
		// measured header height only for animation, never for content layout.
		const scroll = scrollOffset.value + topInset
		return {
			opacity: usesLiquidGlassHeader
				? interpolate(scroll, [65, 95], [0, 1], 'clamp')
				: 1,
			transform: [
				{
					translateY: interpolate(
						scroll,
						usesLiquidGlassHeader ? [0, 65, 95] : [0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	return {
		scrollHandler,
		headerStyle,
		contentInsetAdjustmentBehavior: usesLiquidGlassHeader
			? ('automatic' as const)
			: undefined
	}
}
