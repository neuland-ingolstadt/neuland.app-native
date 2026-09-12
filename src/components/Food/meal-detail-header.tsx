import type { ViewStyle } from 'react-native'
import {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'

export function useMealDetailScroll(): {
	scrollHandler: ReturnType<typeof useAnimatedScrollHandler>
	headerStyle: ReturnType<typeof useAnimatedStyle<ViewStyle>>
} {
	const scrollOffset = useSharedValue(0)
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (scrollOffset && typeof scrollOffset.value !== 'undefined') {
				scrollOffset.value = event.contentOffset.y
			}
		}
	})

	const headerStyle = useAnimatedStyle<ViewStyle>(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	return { scrollHandler, headerStyle }
}
