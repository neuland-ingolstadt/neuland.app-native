import type { FeatureCollection } from 'geojson'
import type { StairMoment } from '@/utils/indoor-nav'

/** GeoJSON bundle for indoor navigation map sources (native + web). */
export interface IndoorNavMapLayersData {
	stairsGeoJSON: FeatureCollection
	entrancesGeoJSON: FeatureCollection
	footpathsGeoJSON: FeatureCollection
	routeProgressGeoJSON: FeatureCollection
	stepMarkersGeoJSON: FeatureCollection
	destinationRoomGeoJSON: FeatureCollection
	ghostFloorsGeoJSON: FeatureCollection
	stairMoment: StairMoment | null
}

export const EMPTY_INDOOR_MAP_LAYERS: IndoorNavMapLayersData = {
	stairsGeoJSON: { type: 'FeatureCollection', features: [] },
	entrancesGeoJSON: { type: 'FeatureCollection', features: [] },
	footpathsGeoJSON: { type: 'FeatureCollection', features: [] },
	routeProgressGeoJSON: { type: 'FeatureCollection', features: [] },
	stepMarkersGeoJSON: { type: 'FeatureCollection', features: [] },
	destinationRoomGeoJSON: { type: 'FeatureCollection', features: [] },
	ghostFloorsGeoJSON: { type: 'FeatureCollection', features: [] },
	stairMoment: null
}

/** Skip mounting MapLibre indoor sources when nothing would be visible. */
export function isEmptyIndoorMapLayers(
	layers: IndoorNavMapLayersData
): boolean {
	const collections = [
		layers.stairsGeoJSON,
		layers.entrancesGeoJSON,
		layers.footpathsGeoJSON,
		layers.routeProgressGeoJSON,
		layers.stepMarkersGeoJSON,
		layers.destinationRoomGeoJSON,
		layers.ghostFloorsGeoJSON
	]
	return (
		collections.every((fc) => fc.features.length === 0) &&
		layers.stairMoment == null
	)
}
