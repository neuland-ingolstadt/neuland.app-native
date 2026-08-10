import type BottomSheet from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import type { RefObject } from 'react'
import { use } from 'react'
import { useTranslation } from 'react-i18next'
import { UserKindContext } from '@/components/contexts'
import { modalSection } from '@/components/Map/modal-sections'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import { useMapGeoJsonFilters } from '@/hooks/useMapGeoJsonFilters'
import { useMapQueries } from '@/hooks/useMapQueries'
import { useMapRoomSelection } from '@/hooks/useMapRoomSelection'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import {
	type ClickedMapElement,
	type RoomData,
	SEARCH_TYPES
} from '@/types/map'
import type { NormalizedLecturer } from '@/types/utils'
import { INGOLSTADT_CENTER, NEUBURG_CENTER } from '@/utils/map-constants'
import { getBuildingData, getRoomData } from '@/utils/map-screen-utils'
import type { LoadingState } from '@/utils/ui-utils'

const LOCATIONS: Record<string, string> = {
	Ingolstadt: 'Ingolstadt',
	Neuburg: 'Neuburg'
}

interface UseMapScreenModelOptions {
	mapLoadState: LoadingState
	bottomSheetRef: RefObject<BottomSheet | null>
	handlePresentModalPress: () => void
	notificationColor: string
}

export interface MapScreenModel {
	mapCenter: [number, number]
	mapOverlay: ReturnType<typeof useMapQueries>['mapOverlay']
	overlayError: ReturnType<typeof useMapQueries>['overlayError']
	lecturers: ReturnType<typeof useMapQueries>['lecturers']
	allRooms: ReturnType<typeof useMapQueries>['allRooms']
	buildingGeoJSON: ReturnType<typeof useMapQueries>['buildingGeoJSON']
	uniqueEtages: ReturnType<typeof useMapGeoJsonFilters>['uniqueEtages']
	filteredGeoJSON: ReturnType<typeof useMapGeoJsonFilters>['filteredGeoJSON']
	availableFilteredGeoJSON: ReturnType<
		typeof useMapGeoJsonFilters
	>['availableFilteredGeoJSON']
	clickedElement: ClickedMapElement | null
	currentFloor: { floor: string; manual: boolean } | null
	setCurrentFloor: (value: { floor: string; manual: boolean }) => void
	selectRoom: ReturnType<typeof useMapRoomSelection>['selectRoom']
	roomData: RoomData
	allSections: ReturnType<typeof modalSection>
	handleSheetChangesModal: () => void
}

export function useMapScreenModel({
	mapLoadState,
	bottomSheetRef,
	handlePresentModalPress,
	notificationColor
}: UseMapScreenModelOptions): MapScreenModel {
	const { userKind, userFaculty } = use(UserKindContext)
	const { t, i18n } = useTranslation('common')
	const {
		clickedElement,
		setClickedElement,
		availableRooms,
		roomOpenings,
		currentFloor,
		setCurrentFloor
	} = use(MapContext)
	const mapQueries = useMapQueries()
	const { selectRoom } = useMapRoomSelection({
		allRooms: mapQueries.allRooms,
		mapLoadState,
		handlePresentModalPress,
		bottomSheetRef,
		notificationColor
	})
	const mapFilters = useMapGeoJsonFilters({
		mapOverlay: mapQueries.mapOverlay,
		allRooms: mapQueries.allRooms,
		currentFloor,
		availableRooms
	})

	const handleSheetChangesModal = (): void => {
		setClickedElement(null)
		if (currentFloor?.manual !== true) {
			setCurrentFloor({ floor: 'EG', manual: false })
		}
		bottomSheetRef.current?.snapToIndex(1)
	}

	const roomData: RoomData = (() => {
		switch (clickedElement?.type) {
			case SEARCH_TYPES.ROOM:
				return getRoomData(
					clickedElement.data,
					availableRooms,
					mapQueries.allRooms,
					i18n,
					t,
					roomOpenings
				)
			case SEARCH_TYPES.BUILDING:
				return getBuildingData(
					clickedElement.data,
					mapQueries.allRooms,
					availableRooms,
					t
				)
			default:
				return {
					title: t('misc.unknown'),
					subtitle: t('misc.unknown'),
					type: SEARCH_TYPES.ROOM,
					properties: null,
					occupancies: null
				} as RoomData
		}
	})()

	const setSelectedLecturer = useRouteParamsStore(
		(state) => state.setSelectedLecturer
	)
	const handleOpenLecturer = (lecturer: NormalizedLecturer): void => {
		setSelectedLecturer(lecturer)
		router.navigate('/lecturer')
	}

	const lecturerSection = (() => {
		if (
			clickedElement?.type !== SEARCH_TYPES.ROOM ||
			mapQueries.lecturers == null
		) {
			return []
		}

		const filtered = mapQueries.lecturers.filter(
			(lecturer) => lecturer.room_short === clickedElement.data
		)
		if (filtered.length === 0) {
			return []
		}

		return [
			{
				header: t('pages.map.details.room.lecturers', { ns: 'common' }),
				items: filtered.map((lecturer) => ({
					title: `${[lecturer.titel, lecturer.vorname, lecturer.name]
						.join(' ')
						.trim()}`,
					onPress: () => handleOpenLecturer(lecturer)
				}))
			}
		]
	})()

	const baseSections = modalSection(
		roomData,
		LOCATIONS,
		userKind === USER_GUEST
	)
	const allSections = [...lecturerSection, ...baseSections]

	return {
		mapCenter:
			userFaculty === 'Nachhaltige Infrastruktur'
				? NEUBURG_CENTER
				: INGOLSTADT_CENTER,
		...mapQueries,
		...mapFilters,
		clickedElement,
		currentFloor,
		setCurrentFloor,
		selectRoom,
		roomData,
		allSections,
		handleSheetChangesModal
	}
}
