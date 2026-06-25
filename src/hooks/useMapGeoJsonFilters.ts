import type { FeatureCollection } from 'geojson'
import { useMemo } from 'react'
import type { AvailableRoom } from '@/types/utils'
import { filterAvailableRooms, filterEtage } from '@/utils/map-screen-utils'
import { FLOOR_ORDER } from '@/utils/map-utils'

interface UseMapGeoJsonFiltersOptions {
	mapOverlay: FeatureCollection | undefined
	allRooms: FeatureCollection
	currentFloor: { floor: string; manual: boolean } | null
	availableRooms: AvailableRoom[] | null
}

export function useMapGeoJsonFilters({
	mapOverlay,
	allRooms,
	currentFloor,
	availableRooms
}: UseMapGeoJsonFiltersOptions): {
	uniqueEtages: string[]
	filteredGeoJSON: FeatureCollection | undefined
	availableFilteredGeoJSON: FeatureCollection | undefined
	hasFilteredRooms: boolean
	hasAvailableFilteredRooms: boolean
} {
	const uniqueEtages = useMemo(
		() =>
			Array.from(
				new Set(
					allRooms.features
						.map((room) => {
							const ebene = room.properties?.Ebene
							return typeof ebene === 'string' ? ebene : ''
						})
						.filter((etage) => etage !== '')
				)
			).sort(
				(a: string, b: string) =>
					FLOOR_ORDER.indexOf(a) - FLOOR_ORDER.indexOf(b)
			),
		[allRooms]
	)

	const filteredGeoJSON = useMemo(() => {
		if (mapOverlay == null) {
			return undefined
		}
		const filteredFeatures = filterEtage(currentFloor?.floor ?? 'EG', allRooms)
		return {
			...mapOverlay,
			features: filteredFeatures
		}
	}, [currentFloor, allRooms, mapOverlay])

	const availableFilteredGeoJSON = useMemo(() => {
		if (mapOverlay == null) {
			return undefined
		}
		const filteredFeatures = filterAvailableRooms(
			filteredGeoJSON,
			availableRooms
		)
		return {
			type: 'FeatureCollection' as const,
			features: filteredFeatures
		}
	}, [availableRooms, filteredGeoJSON, mapOverlay])

	const hasFilteredRooms =
		filteredGeoJSON != null && filteredGeoJSON.features.length > 0
	const hasAvailableFilteredRooms =
		availableFilteredGeoJSON != null &&
		availableFilteredGeoJSON.features.length > 0

	return {
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON,
		hasFilteredRooms,
		hasAvailableFilteredRooms
	}
}
