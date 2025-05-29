import type { Feature, FeatureCollection } from 'geojson'
import type { i18n, TFunction } from 'i18next'
import type { FeatureProperties } from '@/types/asset-api'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import type { FriendlyTimetableEntry } from '@/types/utils'

/**
 * Get the ongoing event or next upcoming event from a timetable
 */
export function getOngoingOrNextEvent(
	timetable: FriendlyTimetableEntry[]
): FriendlyTimetableEntry[] {
	const now = new Date()

	// Filter out past events
	const futureEvents = timetable.filter(
		(entry) => new Date(entry.endDate) > now
	)

	// Find currently ongoing events
	const ongoingEvents = futureEvents.filter(
		(entry) =>
			new Date(entry.startDate) <= now && new Date(entry.endDate) >= now
	)

	if (ongoingEvents.length > 0) {
		return ongoingEvents
	}

	// If no ongoing events, find the next event
	futureEvents.sort(
		(a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
	)
	const nextEvent = futureEvents.length > 0 ? [futureEvents[0]] : []

	return nextEvent
}

/**
 * Filter available rooms from a GeoJSON collection
 */
export function filterAvailableRooms(
	rooms: FeatureCollection | undefined,
	availableRooms: Array<{ room: string }> | null
): Feature[] {
	if (rooms == null) {
		return []
	}
	return rooms.features.filter(
		(feature) =>
			feature.properties != null &&
			availableRooms?.find((x) => x.room === feature.properties?.Raum)
	)
}

/**
 * Filter rooms by floor/etage
 */
export function filterEtage(
	etage: string,
	allRooms: FeatureCollection
): Feature[] {
	return allRooms.features.filter(
		(feature) => feature.properties?.Ebene === etage
	)
}

/**
 * Ensures that we're working with an array of features
 */
function ensureFeaturesArray(
	allRoomsFeatures: Feature[] | FeatureCollection
): Feature[] {
	if (Array.isArray(allRoomsFeatures)) {
		return allRoomsFeatures
	}

	return allRoomsFeatures.features || []
}

/**
 * Get room data from a room ID
 */
export function getRoomData(
	room: string,
	availableRooms: Array<{ room: string }> | null,
	allRoomsFeatures: Feature[] | FeatureCollection,
	i18n: i18n,
	t: TFunction<'common', undefined>
): RoomData {
	const features = ensureFeaturesArray(allRoomsFeatures)
	const occupancies = availableRooms?.find((x) => x.room === room)
	const properties = features.find((x) => x.properties?.Raum === room)
		?.properties as FeatureProperties | undefined

	return {
		title: room,
		subtitle:
			properties != null &&
			(i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en') in properties
				? (properties[i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'] ??
					t('misc.unknown'))
				: t('misc.unknown'),
		properties,
		occupancies,
		type: SEARCH_TYPES.ROOM
	} as RoomData
}

/**
 * Get building data from a building ID
 */
export function getBuildingData(
	building: string,
	allRoomsFeatures: Feature[] | FeatureCollection,
	availableRooms: Array<{ room: string }> | null,
	t: TFunction<'common', undefined>
): RoomData {
	const features = ensureFeaturesArray(allRoomsFeatures)
	const buildingDetails = features.find(
		(x) =>
			x.properties?.Gebaeude === building &&
			x.properties.rtype === SEARCH_TYPES.BUILDING
	)
	const numberOfFreeRooms = availableRooms?.filter((x) =>
		x.room.startsWith(building)
	).length
	const numberOfRooms = features.filter(
		(x) =>
			x.properties?.Gebaeude === building &&
			x.properties.rtype === SEARCH_TYPES.ROOM
	).length

	return {
		title: building,
		subtitle: t('pages.map.details.room.building'),
		properties: buildingDetails?.properties,
		occupancies: {
			total: numberOfRooms,
			available: numberOfFreeRooms ?? 0
		},
		type: SEARCH_TYPES.BUILDING
	}
}
