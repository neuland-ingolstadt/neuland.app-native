import type { Feature, FeatureCollection, GeoJsonProperties } from 'geojson'
import type { i18n, TFunction } from 'i18next'
import type { FeatureProperties } from '@/types/asset-api'
import {
	type ClickedMapElement,
	type MapCoordinate,
	type RoomData,
	SEARCH_TYPES
} from '@/types/map'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { MAP_CAMERA } from '@/utils/map-constants'
import { getPolygonArea } from '@/utils/map-geometry-utils'
import type { RoomOpenings } from '@/utils/map-room-utils'

export interface MapCameraPadding {
	top: number
	right: number
	bottom: number
	left: number
}

const ZERO_MAP_CAMERA_PADDING: MapCameraPadding = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0
}

export function getMapFocusPadding(sheetHeightPx: number): MapCameraPadding {
	if (!(sheetHeightPx > 0)) {
		return ZERO_MAP_CAMERA_PADDING
	}

	return {
		top: 0,
		right: 0,
		bottom: sheetHeightPx + MAP_CAMERA.focusPaddingGap,
		left: 0
	}
}

export function getSelectionFocusZoom(currentZoom: number | undefined): number {
	if (currentZoom == null || !Number.isFinite(currentZoom)) {
		return MAP_CAMERA.focusZoom
	}

	return Math.max(currentZoom, MAP_CAMERA.focusZoom)
}

export function parseMapCoordinate(value: unknown): MapCoordinate | undefined {
	let parsedValue = value

	if (typeof parsedValue === 'string') {
		try {
			parsedValue = JSON.parse(parsedValue) as unknown
		} catch {
			return undefined
		}
	}

	if (!Array.isArray(parsedValue) || parsedValue.length < 2) {
		return undefined
	}

	const [longitude, latitude] = parsedValue
	if (
		typeof longitude !== 'number' ||
		typeof latitude !== 'number' ||
		!Number.isFinite(longitude) ||
		!Number.isFinite(latitude) ||
		longitude < -180 ||
		longitude > 180 ||
		latitude < -90 ||
		latitude > 90
	) {
		return undefined
	}

	return [longitude, latitude]
}

export function getRoomSelectionFromProperties(
	properties: GeoJsonProperties | null | undefined
): { room: string; center?: MapCoordinate } | undefined {
	const room = properties?.Raum
	if (typeof room !== 'string' || room.length === 0) {
		return undefined
	}

	return {
		room,
		center: parseMapCoordinate(properties?.center)
	}
}

function isRoomPolygonFeature(feature: Feature): boolean {
	if (feature.geometry != null && feature.geometry.type !== 'Polygon') {
		return false
	}

	const rtype = feature.properties?.rtype
	if (rtype != null && rtype !== SEARCH_TYPES.ROOM) {
		return false
	}

	const room = feature.properties?.Raum
	return typeof room === 'string' && room.length > 0
}

function polygonAreaOf(feature: Feature): number {
	if (feature.geometry?.type !== 'Polygon') {
		return Number.POSITIVE_INFINITY
	}
	const area = getPolygonArea(feature.geometry.coordinates)
	return area > 0 ? area : Number.POSITIVE_INFINITY
}

export function getRoomSelectionFromFeatures(
	features: Feature[] | undefined
): { room: string; center?: MapCoordinate } | undefined {
	if (features == null || features.length === 0) {
		return undefined
	}

	const byRoom = new Map<string, Feature>()
	for (const feature of features) {
		if (!isRoomPolygonFeature(feature)) {
			continue
		}
		const room = feature.properties?.Raum
		if (typeof room !== 'string') {
			continue
		}
		const existing = byRoom.get(room)
		if (existing == null || polygonAreaOf(feature) < polygonAreaOf(existing)) {
			byRoom.set(room, feature)
		}
	}

	let best: Feature | undefined
	for (const feature of byRoom.values()) {
		if (best == null || polygonAreaOf(feature) < polygonAreaOf(best)) {
			best = feature
		}
	}

	return getRoomSelectionFromProperties(best?.properties)
}

/**
 * Get the ongoing event or next upcoming event from a timetable
 */
export function getOngoingOrNextEvent(
	timetable: FriendlyTimetableEntry[],
	now: Date = new Date()
): FriendlyTimetableEntry[] {
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

export function getSelectedMapFeatures(
	clicked: ClickedMapElement | null,
	rooms: FeatureCollection | undefined
): Feature[] {
	if (clicked == null || rooms == null) {
		return []
	}

	if (clicked.type === SEARCH_TYPES.ROOM) {
		const feature = rooms.features.find(
			(item) =>
				item.geometry?.type === 'Polygon' &&
				item.properties?.rtype === SEARCH_TYPES.ROOM &&
				item.properties?.Raum === clicked.data
		)
		return feature == null ? [] : [feature]
	}

	if (clicked.type === SEARCH_TYPES.BUILDING) {
		return rooms.features.filter(
			(item) =>
				item.geometry?.type === 'Polygon' &&
				item.properties?.rtype === SEARCH_TYPES.ROOM &&
				item.properties?.Gebaeude === clicked.data
		)
	}

	return []
}

/** Exit-only or badge-only entrances use the muted (grey) marker. */
export function isMutedEntrance(
	properties: GeoJsonProperties | null | undefined
): boolean {
	return properties?.kind === 'exit' || properties?.access === 'badge'
}

export function splitEntrancesByStyle(entrances: FeatureCollection): {
	primary: FeatureCollection
	muted: FeatureCollection
} {
	const primary: Feature[] = []
	const muted: Feature[] = []
	for (const feature of entrances.features) {
		if (isMutedEntrance(feature.properties)) {
			muted.push(feature)
		} else {
			primary.push(feature)
		}
	}
	return {
		primary: { type: 'FeatureCollection', features: primary },
		muted: { type: 'FeatureCollection', features: muted }
	}
}

/** ~6–8 m at Ingolstadt latitude — keeps door icons clear of the selection pin. */
const ENTRANCE_MARKER_CLEARANCE = 0.00007

/**
 * Drop entrances that would sit under the selection map marker.
 */
export function excludeEntrancesNearPoint(
	entrances: FeatureCollection,
	point: MapCoordinate | undefined
): FeatureCollection {
	if (point == null) {
		return entrances
	}

	const [longitude, latitude] = point
	const thresholdSq = ENTRANCE_MARKER_CLEARANCE * ENTRANCE_MARKER_CLEARANCE

	return {
		type: 'FeatureCollection',
		features: entrances.features.filter((feature) => {
			if (feature.geometry?.type !== 'Point') {
				return false
			}
			const [x, y] = feature.geometry.coordinates
			if (typeof x !== 'number' || typeof y !== 'number') {
				return false
			}
			const dLon = x - longitude
			const dLat = y - latitude
			return dLon * dLon + dLat * dLat > thresholdSq
		})
	}
}

/**
 * Entrances for the current map selection.
 * Building and room both show every entrance of that building.
 */
export function getSelectedBuildingEntrances(
	clicked: ClickedMapElement | null,
	entrances: FeatureCollection | undefined,
	rooms?: FeatureCollection | undefined
): FeatureCollection {
	if (clicked == null || entrances == null) {
		return { type: 'FeatureCollection', features: [] }
	}

	let building: string | null = null
	if (clicked.type === SEARCH_TYPES.BUILDING) {
		building = clicked.data
	} else if (clicked.type === SEARCH_TYPES.ROOM) {
		const roomFeature = rooms?.features.find(
			(feature) =>
				feature.properties?.rtype === SEARCH_TYPES.ROOM &&
				feature.properties?.Raum === clicked.data
		)
		building =
			typeof roomFeature?.properties?.Gebaeude === 'string'
				? roomFeature.properties.Gebaeude
				: null
	} else if (clicked.type === SEARCH_TYPES.ENTRANCE) {
		const entranceFeature = entrances.features.find(
			(feature) => feature.properties?.id === clicked.data
		)
		building =
			typeof entranceFeature?.properties?.Gebaeude === 'string'
				? entranceFeature.properties.Gebaeude
				: null
	}

	if (building == null) {
		return { type: 'FeatureCollection', features: [] }
	}

	return {
		type: 'FeatureCollection',
		features: entrances.features.filter(
			(feature) =>
				feature.geometry?.type === 'Point' &&
				feature.properties?.Gebaeude === building
		)
	}
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
	t: TFunction<'common', undefined>,
	roomOpenings?: RoomOpenings | null
): RoomData {
	const features = ensureFeaturesArray(allRoomsFeatures)
	const occupancies = availableRooms?.find((x) => x.room === room)
	const properties = features.find((x) => x.properties?.Raum === room)
		?.properties as FeatureProperties | undefined

	const openings = roomOpenings?.[room]
	const now = new Date()
	const nextAvailable = openings?.find((o) => o.from > now) ?? null

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
		nextAvailable,
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

/**
 * Get entrance data from an entrance id
 */
export function getEntranceData(
	entranceId: string,
	entrances: FeatureCollection | undefined,
	i18n: i18n,
	t: TFunction<'common', undefined>
): RoomData {
	const feature = entrances?.features.find(
		(item) => item.properties?.id === entranceId
	)
	const properties = feature?.properties
	const isGerman = i18n.language.startsWith('de')
	const title =
		(isGerman ? properties?.name_de : properties?.name_en) ??
		(typeof properties?.name_en === 'string'
			? properties.name_en
			: typeof properties?.name_de === 'string'
				? properties.name_de
				: entranceId)
	const subtitle =
		typeof properties?.Gebaeude === 'string'
			? t('pages.map.details.entrance.buildingSubtitle', {
					building: properties.Gebaeude
				})
			: t('pages.map.details.entrance.title')

	return {
		title: typeof title === 'string' ? title : entranceId,
		subtitle,
		properties: properties ?? undefined,
		occupancies: null,
		type: SEARCH_TYPES.ENTRANCE
	}
}

export function getEntranceSelectionFromFeatures(
	features: Array<{
		geometry?: { type?: string; coordinates?: unknown } | null
		properties?: GeoJsonProperties | null
	}> | null
): { id: string; center?: MapCoordinate } | undefined {
	if (features == null || features.length === 0) {
		return undefined
	}

	for (const feature of features) {
		const id = feature.properties?.id
		if (typeof id !== 'string' || id.length === 0) {
			continue
		}
		if (feature.geometry?.type !== 'Point') {
			continue
		}
		return {
			id,
			center: parseMapCoordinate(feature.geometry.coordinates)
		}
	}

	return undefined
}
