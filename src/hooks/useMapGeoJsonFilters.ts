import type { FeatureCollection } from 'geojson'
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
	const uniqueEtages = sortFloors(
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
	)

	const filteredGeoJSON = (() => {
		if (mapOverlay == null) {
			return undefined
		}
		const filteredFeatures = filterEtage(currentFloor?.floor ?? 'EG', allRooms)
		return {
			...mapOverlay,
			features: filteredFeatures
		}
	})()

	const availableFilteredGeoJSON = (() => {
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
	})()

	return {
		uniqueEtages,
		filteredGeoJSON,
		availableFilteredGeoJSON
	}
}
