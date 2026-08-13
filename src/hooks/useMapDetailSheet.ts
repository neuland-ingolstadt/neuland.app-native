import { useNavigation } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Appearance } from 'react-native'
import { DETAIL_HIDDEN, DETAIL_OPEN } from '@/components/Map/sheet-detents'
import type { ClickedMapElement } from '@/types/map'

interface UseMapDetailSheetOptions {
	clickedElement: ClickedMapElement | null
	currentFloor: { floor: string; manual: boolean } | null
	handleSheetChangesModal: () => void
	onTabPress?: () => void
}

export function useMapDetailSheet({
	clickedElement,
	currentFloor,
	handleSheetChangesModal,
	onTabPress
}: UseMapDetailSheetOptions): {
	detailIndex: number
	handleDetailIndexChange: (next: number) => void
	presentDetailSheet: () => void
	cameraResetRequestId: number
} {
	const navigation = useNavigation()
	const [detailIndex, setDetailIndex] = useState(DETAIL_HIDDEN)
	const [cameraResetRequestId, setCameraResetRequestId] = useState(0)
	const detailIndexRef = useRef(detailIndex)

	useEffect(() => {
		detailIndexRef.current = detailIndex
	}, [detailIndex])

	const handleDetailIndexChange = useCallback(
		(next: number) => {
			const wasOpen = detailIndexRef.current !== DETAIL_HIDDEN
			detailIndexRef.current = next
			setDetailIndex(next)
			if (wasOpen && next === DETAIL_HIDDEN) {
				handleSheetChangesModal()
			}
		},
		[handleSheetChangesModal]
	)

	const presentDetailSheet = useCallback(() => {
		setDetailIndex(DETAIL_OPEN)
	}, [])

	useEffect(() => {
		const subscription = Appearance.addChangeListener(() => {
			handleDetailIndexChange(DETAIL_HIDDEN)
		})

		return () => {
			subscription.remove()
		}
	}, [handleDetailIndexChange])

	useEffect(() => {
		// @ts-expect-error wrong type
		const unsubscribe = navigation.addListener('tabPress', () => {
			onTabPress?.()
			handleDetailIndexChange(DETAIL_HIDDEN)
			setCameraResetRequestId((previous) => previous + 1)
		})

		return unsubscribe
	}, [handleDetailIndexChange, navigation, onTabPress])

	useEffect(() => {
		if (clickedElement == null || currentFloor?.manual !== true) {
			return
		}
		handleDetailIndexChange(DETAIL_HIDDEN)
		// clickedElement is read from this render on purpose: a room tap must
		// not re-run this when the floor was already chosen manually.
	}, [currentFloor, handleDetailIndexChange])

	return {
		detailIndex,
		handleDetailIndexChange,
		presentDetailSheet,
		cameraResetRequestId
	}
}
