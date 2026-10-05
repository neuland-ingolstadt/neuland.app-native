import type { FeatureCollection } from 'geojson'
import type { StairMoment } from '@/utils/indoor-nav'

/** GeoJSON bundle for indoor navigation map sources (native + web). */
export interface IndoorNavMapLayersData {
	stairsGeoJSON: FeatureCollection
	entrancesGeoJSON: FeatureCollection
	routeProgressGeoJSON: FeatureCollection
	stepMarkersGeoJSON: FeatureCollection
	destinationRoomGeoJSON: FeatureCollection
	ghostFloorsGeoJSON: FeatureCollection
	stairMoment: StairMoment | null
}

export const EMPTY_INDOOR_MAP_LAYERS: IndoorNavMapLayersData = {
	stairsGeoJSON: { type: 'FeatureCollection', features: [] },
	entrancesGeoJSON: { type: 'FeatureCollection', features: [] },
	routeProgressGeoJSON: { type: 'FeatureCollection', features: [] },
	stepMarkersGeoJSON: { type: 'FeatureCollection', features: [] },
	destinationRoomGeoJSON: { type: 'FeatureCollection', features: [] },
	ghostFloorsGeoJSON: { type: 'FeatureCollection', features: [] },
	stairMoment: null
}
