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
} {
	const floor = currentFloor?.floor ?? 'EG'

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
		return {
			...mapOverlay,
			features: filterEtage(floor, allRooms)
		}
	}, [allRooms, floor, mapOverlay])

	const availableFilteredGeoJSON = useMemo(() => {
		if (mapOverlay == null) {
			return undefined
		}
		return {
			type: 'FeatureCollection' as const,
			features: filterAvailableRooms(filteredGeoJSON, availableRooms)
		}
	}, [availableRooms, filteredGeoJSON, mapOverlay])

	return {
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON
	}
}
