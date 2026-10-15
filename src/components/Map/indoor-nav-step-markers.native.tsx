import { Marker } from '@maplibre/maplibre-react-native'
import type { FeatureCollection } from 'geojson'
import type React from 'react'
import { IndoorNavStepMarkerPin } from '@/components/Map/indoor-nav-step-marker-pin'
import {
	getEntranceMarkerItems,
	getStepMarkerItems
} from '@/components/Map/indoor-nav-step-markers-shared'
import type { MapMode } from '@/components/Map/map-config'

interface IndoorNavStepMarkersProps {
	stepMarkersGeoJSON: FeatureCollection
	primaryColor: string
	mapMode: MapMode
}

export function IndoorNavStepMarkers({
	stepMarkersGeoJSON,
	primaryColor,
	mapMode
}: IndoorNavStepMarkersProps): React.JSX.Element {
	const items = getStepMarkerItems(stepMarkersGeoJSON)
	return (
		<>
			{items.map((item) => (
				<Marker
					key={item.key}
					id={`indoor-step-${item.index}`}
					lngLat={[item.longitude, item.latitude]}
					anchor="center"
				>
					<IndoorNavStepMarkerPin
						kind={item.kind}
						state={item.state}
						primaryColor={primaryColor}
						mapMode={mapMode}
					/>
				</Marker>
			))}
		</>
	)
}

interface IndoorNavEntranceMarkersProps {
	entrancesGeoJSON: FeatureCollection
	primaryColor: string
	mapMode: MapMode
	onEntrancePress?: (entranceRawId: string) => void
}

export function IndoorNavEntranceMarkers({
	entrancesGeoJSON,
	primaryColor,
	mapMode,
	onEntrancePress
}: IndoorNavEntranceMarkersProps): React.JSX.Element {
	const items = getEntranceMarkerItems(entrancesGeoJSON)
	return (
		<>
			{items.map((item) => (
				<Marker
					key={item.key}
					id={`indoor-entrance-${item.index}`}
					lngLat={[item.longitude, item.latitude]}
					anchor="center"
					onPress={
						onEntrancePress != null && item.rawId !== ''
							? () => onEntrancePress(item.rawId)
							: undefined
					}
				>
					<IndoorNavStepMarkerPin
						kind="entrance"
						state="todo"
						primaryColor={primaryColor}
						mapMode={mapMode}
					/>
				</Marker>
			))}
		</>
	)
}
