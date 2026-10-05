import type { FeatureCollection } from 'geojson'

/** GeoJSON bundle for indoor navigation map sources (native + web). */
export interface IndoorNavMapLayersData {
	stairsGeoJSON: FeatureCollection
	entrancesGeoJSON: FeatureCollection
	routeProgressGeoJSON: FeatureCollection
	stepMarkersGeoJSON: FeatureCollection
	destinationRoomGeoJSON: FeatureCollection
}

export const EMPTY_INDOOR_MAP_LAYERS: IndoorNavMapLayersData = {
	stairsGeoJSON: { type: 'FeatureCollection', features: [] },
	entrancesGeoJSON: { type: 'FeatureCollection', features: [] },
	routeProgressGeoJSON: { type: 'FeatureCollection', features: [] },
	stepMarkersGeoJSON: { type: 'FeatureCollection', features: [] },
	destinationRoomGeoJSON: { type: 'FeatureCollection', features: [] }
}
