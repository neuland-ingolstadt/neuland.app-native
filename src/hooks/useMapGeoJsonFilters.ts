import type { FeatureCollection } from 'geojson'
import { useMemo } from 'react'
import type { AvailableRoom } from '@/types/utils'
import { sortFloors } from '@/utils/map-constants'
import { filterAvailableRooms, filterEtage } from '@/utils/map-screen-utils'

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
			sortFloors(
				Array.from(
					new Set(
						allRooms.features
							.map((room) => {
								const ebene = room.properties?.Ebene
								return typeof ebene === 'string' ? ebene : ''
							})
							.filter((etage) => etage !== '')
					)
				)
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
