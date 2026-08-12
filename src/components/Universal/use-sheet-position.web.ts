import { useCallback } from 'react'
import type { NativeSyntheticEvent } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import type { PositionChangeEventData } from '@/components/Universal/bottom-sheet'

export function useSheetPosition(position: SharedValue<number>): {
	onPositionChange: (
		event: NativeSyntheticEvent<PositionChangeEventData>
	) => void
} {
	const onPositionChange = useCallback(
		(event: NativeSyntheticEvent<PositionChangeEventData>) => {
			position.set(event.nativeEvent.position)
		},
		[position]
	)

	return { onPositionChange }
}
