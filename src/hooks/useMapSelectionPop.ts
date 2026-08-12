import * as Haptics from 'expo-haptics'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { SELECTED_POP_HOLD_MS } from '@/components/Map/map-config'

export function useMapSelectionPop(): {
	selectionPop: boolean
	triggerSelectionPop: () => void
} {
	const [selectionPop, setSelectionPop] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeoutRef.current != null) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const triggerSelectionPop = useCallback(() => {
		if (Platform.OS !== 'web') {
			void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		}
		setSelectionPop(true)
		if (timeoutRef.current != null) {
			clearTimeout(timeoutRef.current)
		}
		timeoutRef.current = setTimeout(() => {
			setSelectionPop(false)
		}, SELECTED_POP_HOLD_MS)
	}, [])

	return { selectionPop, triggerSelectionPop }
}
