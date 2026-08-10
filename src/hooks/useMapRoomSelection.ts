import { trackEvent } from '@aptabase/react-native'
import type BottomSheet from '@gorhom/bottom-sheet'
import { router, useLocalSearchParams } from 'expo-router'
import type { FeatureCollection } from 'geojson'
import type { RefObject } from 'react'
import { use, useCallback, useEffect, useRef } from 'react'
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
	bottomSheetRef: RefObject<BottomSheet | null>
	notificationColor: string
}

export function useMapRoomSelection({
	allRooms,
	mapLoadState,
	handlePresentModalPress,
	bottomSheetRef,
	notificationColor
}: UseMapRoomSelectionOptions): { selectMapElement: SelectMapElement } {
	const params = useLocalSearchParams<{ room: string }>()
	const { localSearch, setClickedElement, setCurrentFloor } = use(MapContext)
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
		bottomSheetRef.current?.close()
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
		bottomSheetRef,
		selectMapElement
	])

	useEffect(() => {
		if (localSearch.length === 1 && params.room != null) {
			router.setParams(undefined)
		}
	}, [localSearch, params.room])

	return { selectMapElement }
}
