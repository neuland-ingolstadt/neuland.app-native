import { useNavigation } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Appearance } from 'react-native'
import { DETAIL_HIDDEN, DETAIL_OPEN } from '@/components/Map/sheet-detents'

interface UseMapDetailSheetOptions {
	handleSheetChangesModal: () => void
	onTabPress?: () => void
}

export function useMapDetailSheet({
	handleSheetChangesModal,
	onTabPress
}: UseMapDetailSheetOptions): {
	detailIndex: number
	handleDetailIndexChange: (next: number) => void
	/** Hides the sheet without running the close callback (keeps selection). */
	hideDetailSheet: () => void
	presentDetailSheet: (index?: number) => void
	requestCameraReset: () => void
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

	const presentDetailSheet = useCallback((index: number = DETAIL_OPEN) => {
		detailIndexRef.current = index
		setDetailIndex(index)
	}, [])

	const hideDetailSheet = useCallback(() => {
		detailIndexRef.current = DETAIL_HIDDEN
		setDetailIndex(DETAIL_HIDDEN)
	}, [])

	const requestCameraReset = useCallback(() => {
		setCameraResetRequestId((previous) => previous + 1)
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
			requestCameraReset()
		})

		return unsubscribe
	}, [handleDetailIndexChange, navigation, onTabPress, requestCameraReset])

	return {
		detailIndex,
		handleDetailIndexChange,
		hideDetailSheet,
		presentDetailSheet,
		requestCameraReset,
		cameraResetRequestId
	}
}
