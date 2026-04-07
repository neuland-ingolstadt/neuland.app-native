import type { Feature, FeatureCollection } from 'geojson'
import { type FeatureProperties, Gebaeude } from '@/types/asset-api'
import { type RoomData, SEARCH_TYPES } from '@/types/map'
import type { AvailableRoom } from '@/types/utils'
import { filterAvailableRooms, filterEtage } from '@/utils/map-screen-utils'
import {
	BUILDINGS,
	FLOOR_ORDER,
	FLOOR_SUBSTITUTES,
	getCenter,
	getCenterSingle,
	getIcon
} from '@/utils/map-utils'

export function getAllRooms(
	mapOverlay: FeatureCollection | undefined
): FeatureCollection {
	if (mapOverlay == null) {
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
			geometry.coordinates.length === 0
		) {
			return []
		}

		if (properties.Ebene in FLOOR_SUBSTITUTES) {
			properties.Ebene = FLOOR_SUBSTITUTES[properties.Ebene as string]
		}
		if (!FLOOR_ORDER.includes(properties.Ebene as string)) {
			FLOOR_ORDER.push(properties.Ebene as string)
		}
		return {
			type,
			id,
			properties: {
				...properties,
				rtype: SEARCH_TYPES.ROOM,
				center: getCenterSingle(geometry.coordinates),
				icon: getIcon(SEARCH_TYPES.ROOM, {
					result: { item: { properties } }
				})
			} as unknown as FeatureProperties,
			geometry
		}
	})

	const buildings = BUILDINGS.map((building) => {
		const buildingRooms = rooms.filter(
			(room) => room.properties.Gebaeude === (building as Gebaeude)
		)
		if (buildingRooms.length === 0) {
			return null
		}
		const floorCount = Array.from(
			new Set(buildingRooms.map((room) => room.properties.Ebene))
		).length
		const location = buildingRooms[0].properties.Standort
		const center = getCenter(buildingRooms.map((x) => x.geometry.coordinates))
		return {
			type: 'Feature',
			id: building,
			properties: {
				Raum: building,
				Funktion_en: 'Building',
				Funktion_de: 'Gebäude',
				Gebaeude: Gebaeude[building as keyof typeof Gebaeude],
				Ebene: 'EG',
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
	}).filter(
		(building): building is NonNullable<typeof building> => building !== null
	)

	return {
		type: 'FeatureCollection',
		features: [...rooms, ...buildings]
	}
}

export function getBuildingGeoJson(
	allRooms: FeatureCollection
): FeatureCollection {
	return {
		type: 'FeatureCollection',
		features: allRooms.features.filter(
			(feature) => feature.properties?.rtype === SEARCH_TYPES.BUILDING
		)
	}
}

export function getUniqueEtages(allRooms: FeatureCollection): string[] {
	return Array.from(
		new Set(
			(Array.isArray(allRooms.features)
				? allRooms.features
				: Object.values(allRooms.features)
			)
				.map((room) => {
					const properties = (room as RoomData).properties
					return typeof properties?.Ebene === 'string' ? properties.Ebene : ''
				})
				.filter((etage) => etage != null)
		)
	).sort((a, b) => FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b))
}

export function getFilteredGeoJson(
	mapOverlay: FeatureCollection | undefined,
	floor: string,
	allRooms: FeatureCollection
): FeatureCollection | undefined {
	if (mapOverlay == null) {
		return undefined
	}

	return {
		...mapOverlay,
		features: filterEtage(floor, allRooms)
	}
}

export function getAvailableFilteredGeoJson(
	filteredGeoJSON: FeatureCollection | undefined,
	availableRooms: AvailableRoom[] | null
): FeatureCollection | undefined {
	if (filteredGeoJSON == null) {
		return undefined
	}

	return {
		type: 'FeatureCollection',
		features: filterAvailableRooms(filteredGeoJSON, availableRooms)
	}
}
