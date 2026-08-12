import type { ComponentType } from 'react'
import type { NativeSyntheticEvent } from 'react-native'
import Animated, { type SharedValue, useEvent } from 'react-native-reanimated'
import type { PositionChangeEventData } from '@/components/Universal/bottom-sheet'

type WrapNativeView = <P extends object>(
	component: ComponentType<P>
) => ComponentType<P>

export function useSheetPosition(position: SharedValue<number>): {
	wrapNativeView: WrapNativeView
	onPositionChange: (
		event: NativeSyntheticEvent<PositionChangeEventData>
	) => void
} {
	const onPositionChange = useEvent<
		NativeSyntheticEvent<PositionChangeEventData>
	>(
		(event) => {
			'worklet'
			position.value = event.position
		},
		['onPositionChange']
	)

	return {
		wrapNativeView: Animated.createAnimatedComponent as WrapNativeView,
		onPositionChange
	}
}
