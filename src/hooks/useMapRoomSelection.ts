import { trackEvent } from '@aptabase/react-native'
import type BottomSheet from '@gorhom/bottom-sheet'
import { router, useLocalSearchParams } from 'expo-router'
import type { FeatureCollection } from 'geojson'
import type { RefObject } from 'react'
import { use, useCallback, useEffect, useRef } from 'react'
import { MapContext } from '@/contexts/map'
import { type MapCoordinate, SEARCH_TYPES } from '@/types/map'
import { getRoomSelectionFromProperties } from '@/utils/map-screen-utils'
import { LoadingState, roomNotFoundToast } from '@/utils/ui-utils'

type RoomSelectionOrigin = 'MapClick' | 'InAppLink'

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
}: UseMapRoomSelectionOptions): {
	selectRoom: (options: {
		room: string
		center?: MapCoordinate
		origin: RoomSelectionOrigin
		manual: boolean
		floor?: string
	}) => void
} {
	const params = useLocalSearchParams<{ room: string }>()
	const { localSearch, setClickedElement, setCurrentFloor } = use(MapContext)
	const handlePresentModalPressRef = useRef(handlePresentModalPress)

	useEffect(() => {
		handlePresentModalPressRef.current = handlePresentModalPress
	}, [handlePresentModalPress])

	const selectRoom = useCallback(
		({
			room,
			center,
			origin,
			manual,
			floor
		}: {
			room: string
			center?: MapCoordinate
			origin: RoomSelectionOrigin
			manual: boolean
			floor?: string
		}) => {
			setClickedElement({
				data: room,
				type: SEARCH_TYPES.ROOM,
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
		selectRoom({
			room: params.room,
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
		selectRoom
	])

	useEffect(() => {
		if (localSearch.length === 1 && params.room != null) {
			router.setParams(undefined)
		}
	}, [localSearch, params.room])

	return { selectRoom }
}
