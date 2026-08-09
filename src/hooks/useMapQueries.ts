import { useQuery } from '@tanstack/react-query'
import { toast } from 'burnt'
import type { Feature, FeatureCollection } from 'geojson'
import { use, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import API from '@/api/authenticated-api'
import {
	NoSessionError,
	UnavailableSessionError
} from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import { MapContext } from '@/contexts/map'
import { USER_GUEST } from '@/data/constants'
import type { FeatureProperties } from '@/types/asset-api'
import { SEARCH_TYPES } from '@/types/map'
import type { NormalizedLecturer } from '@/types/utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import { getIcon } from '@/utils/map-actions'
import { FLOOR_SUBSTITUTES, getBuildingCodes } from '@/utils/map-constants'
import { getCenter, getCenterSingle } from '@/utils/map-geometry-utils'
import { filterRooms, getRoomOpenings } from '@/utils/map-room-utils'
import { getOngoingOrNextEvent } from '@/utils/map-screen-utils'
import { loadTimetable } from '@/utils/timetable-utils'
import { useMapOverlayQuery } from './useMapOverlayQuery'

export function useMapQueries(): {
	mapOverlay: FeatureCollection | undefined
	overlayError: Error | null
	timetable: Awaited<ReturnType<typeof loadTimetable>> | undefined
	lecturers: NormalizedLecturer[] | undefined
	allRooms: FeatureCollection
	buildingGeoJSON: FeatureCollection
} {
	const { userKind } = use(UserKindContext)
	const { setNextLecture, setAvailableRooms, setRoomOpenings } = use(MapContext)
	const { t, i18n } = useTranslation('common')
	const currentDate = new Date()

	const { data: mapOverlay, error: overlayError } = useMapOverlayQuery()

	useEffect(() => {
		if (overlayError != null) {
			toast({
				title: t('toast.mapOverlay', { ns: 'common' }),
				preset: 'error',
				duration: 3,
				from: 'top'
			})
		}
	}, [overlayError, t])

	const { data: timetable } = useQuery({
		queryKey: ['timetableV2', userKind],
		queryFn: loadTimetable,
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
		retry(failureCount, error) {
			const ignoreErrors = [
				'"Time table does not exist" (-202)',
				'Timetable is empty'
			]
			if (ignoreErrors.includes(error.message)) {
				return false
			}
			return failureCount < 2
		},
		enabled: userKind !== USER_GUEST
	})

	const { data: lecturers } = useQuery({
		queryKey: ['allLecturers'],
		queryFn: async () => {
			const rawData = await API.getLecturers('0', 'z')
			return normalizeLecturers(rawData)
		},
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
		enabled: userKind !== USER_GUEST
	})

	useEffect(() => {
		if (timetable == null) {
			setNextLecture([])
			return
		}
		const ongoingOrNextEvent = getOngoingOrNextEvent(timetable)
		setNextLecture(ongoingOrNextEvent)
	}, [timetable, userKind, setNextLecture])

	const { data: roomStatusData } = useQuery({
		queryKey: ['freeRooms', formatISODate(currentDate)],
		queryFn: async () => await API.getFreeRooms(currentDate),
		staleTime: 1000 * 60 * 60, // 60 minutes
		gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				return false
			}
			return failureCount < 2
		}
	})

	useEffect(() => {
		function load(): void {
			if (roomStatusData == null) {
				console.debug('No room status data')
				return
			}
			try {
				const dateObj = new Date()
				const date = formatISODate(dateObj)
				const time = formatISOTime(dateObj)
				const rooms = filterRooms(roomStatusData, date, time)
				setAvailableRooms(rooms)
				const openings = getRoomOpenings(roomStatusData, dateObj)
				setRoomOpenings(openings)
			} catch (e) {
				if (
					e instanceof NoSessionError ||
					e instanceof UnavailableSessionError
				) {
					setAvailableRooms([])
				} else {
					console.error(e)
				}
			}
		}
		setAvailableRooms(null)
		setRoomOpenings(null)
		load()
	}, [userKind, roomStatusData, setAvailableRooms, setRoomOpenings])

	const allRooms: FeatureCollection = useMemo(() => {
		if (mapOverlay == null) {
			console.debug('No map overlay data')
			return { type: 'FeatureCollection', features: [] }
		}

		const rooms = mapOverlay.features.flatMap((feature) => {
			const { type, id, geometry, properties } = feature

			if (
				geometry == null ||
				properties == null ||
				geometry.type !== 'Polygon' ||
				!('coordinates' in geometry) ||
				geometry.coordinates == null ||
				geometry.coordinates.length === 0 ||
				geometry.coordinates[0]?.length === 0
			) {
				return []
			}

			const originalFloor =
				typeof properties.Ebene === 'string' ? properties.Ebene : 'EG'
			const floor = FLOOR_SUBSTITUTES[originalFloor] ?? originalFloor
			const normalizedProperties = {
				...properties,
				Ebene: floor
			}
			return {
				type,
				id,
				properties: {
					...normalizedProperties,
					rtype: SEARCH_TYPES.ROOM,
					center: getCenterSingle(geometry.coordinates),
					icon: getIcon(SEARCH_TYPES.ROOM, {
						result: { item: { properties: normalizedProperties } }
					})
				} as unknown as FeatureProperties,
				geometry
			}
		})
		const buildings = getBuildingCodes(
			rooms.map((room) => room.properties?.Gebaeude)
		)
			.map((building) => {
				const buildingRooms = rooms.filter(
					(room) => room.properties.Gebaeude === building
				)
				if (buildingRooms.length === 0) {
					return null
				}
				const floorCount = Array.from(
					new Set(buildingRooms.map((room) => room.properties.Ebene))
				).length
				const location = buildingRooms[0].properties.Standort
				const center = getCenter(
					buildingRooms.map((x) => x.geometry.coordinates)
				)
				return {
					type: 'Feature',
					id: building,
					properties: {
						Raum: building,
						Funktion_en: t('buildingLabel', { lng: 'en' }),
						Funktion_de: t('buildingLabel', { lng: 'de' }),
						Gebaeude: building,
						Ebene: 'EG', // Dummy value to not break the floor picker
						Etage: floorCount.toString(),
						Standort: location,
						rtype: SEARCH_TYPES.BUILDING,
						center,
						icon: getIcon(SEARCH_TYPES.BUILDING)
					},
					geometry: {
						type: 'Point' as const,
						coordinates: center
					}
				} satisfies Feature
			})
			.filter(
				(building): building is NonNullable<typeof building> =>
					building !== null
			)
		return {
			type: 'FeatureCollection',
			features: [...rooms, ...buildings]
		}
	}, [i18n.language, mapOverlay, t])

	const buildingGeoJSON: FeatureCollection = useMemo(() => {
		return {
			type: 'FeatureCollection',
			features: allRooms.features.filter(
				(f) => f.properties?.rtype === SEARCH_TYPES.BUILDING
			)
		}
	}, [allRooms])

	return {
		mapOverlay,
		overlayError,
		timetable,
		lecturers,
		allRooms,
		buildingGeoJSON
	}
}
