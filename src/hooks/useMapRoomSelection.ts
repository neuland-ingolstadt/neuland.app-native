import { trackEvent } from '@aptabase/react-native'
import { router, useLocalSearchParams } from 'expo-router'
import type { FeatureCollection } from 'geojson'
import { use, useCallback, useEffect, useRef } from 'react'
import { Keyboard } from 'react-native'
import { MapContext } from '@/contexts/map'
import {
	SEARCH_TYPES,
	type SelectMapElement,
	type SelectMapElementOptions
} from '@/types/map'
import { getRoomSelectionFromProperties } from '@/utils/map-screen-utils'
import { LoadingState, roomNotFoundToast } from '@/utils/ui-utils'

interface UseMapRoomSelectionOptions {
	allRooms: FeatureCollection
	mapLoadState: LoadingState
	handlePresentModalPress: () => void
	hideSearchSheet: () => void
	notificationColor: string
}

export function useMapRoomSelection({
	allRooms,
	mapLoadState,
	handlePresentModalPress,
	hideSearchSheet,
	notificationColor
}: UseMapRoomSelectionOptions): { selectMapElement: SelectMapElement } {
	const params = useLocalSearchParams<{ room: string }>()
	const { setClickedElement, setCurrentFloor } = use(MapContext)
	const handlePresentModalPressRef = useRef(handlePresentModalPress)

	useEffect(() => {
		handlePresentModalPressRef.current = handlePresentModalPress
	}, [handlePresentModalPress])

	const selectMapElement = useCallback(
		({
			room,
			type,
			center,
			origin,
			manual,
			floor
		}: SelectMapElementOptions) => {
			Keyboard.dismiss()
			setClickedElement({
				data: room,
				type,
				center,
				manual
			})
			trackEvent('Room', { room, origin })
			if (floor != null) {
				setCurrentFloor({ floor, manual: false })
			}
			handlePresentModalPressRef.current()
		},
		[setClickedElement, setCurrentFloor]
	)

	useEffect(() => {
		if (
			params.room == null ||
			params.room === '' ||
			params.room === undefined
		) {
			return
		}
		if (
			allRooms.features.length === 0 ||
			mapLoadState !== LoadingState.LOADED
		) {
			return
		}

		const room = allRooms.features.find(
			(x) => x.properties?.Raum === params.room
		)
		const selection = getRoomSelectionFromProperties(room?.properties)

		if (selection == null) {
			roomNotFoundToast(params.room, notificationColor)
			router.setParams({ room: '' })
			return
		}
		hideSearchSheet()
		selectMapElement({
			room: params.room,
			type: SEARCH_TYPES.ROOM,
			center: selection.center,
			origin: 'InAppLink',
			manual: false,
			floor:
				typeof room?.properties?.Ebene === 'string'
					? room.properties.Ebene
					: 'EG'
		})
		router.setParams({ room: '' })
	}, [
		params,
		mapLoadState,
		allRooms,
		notificationColor,
		hideSearchSheet,
		selectMapElement
	])

	return { selectMapElement }
}
