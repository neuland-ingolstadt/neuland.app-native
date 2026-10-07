import { Marker } from '@maplibre/maplibre-react-native'
import type { FeatureCollection, Point } from 'geojson'
import type React from 'react'
import { IndoorNavStepMarkerPin } from '@/components/Map/indoor-nav-step-marker-pin'
import type { MapMode } from '@/components/Map/map-config'
import type { StepProgressState } from '@/utils/indoor-nav/journey-visualization'

interface IndoorNavStepMarkersProps {
	stepMarkersGeoJSON: FeatureCollection
	primaryColor: string
	mapMode: MapMode
}

function renderMarkerFeatures(
	features: FeatureCollection['features'],
	idPrefix: string,
	primaryColor: string,
	mapMode: MapMode,
	defaultKind: string,
	defaultState: StepProgressState
): React.JSX.Element[] {
	return features
		.filter((feature) => feature.geometry.type === 'Point')
		.map((feature, index) => {
			const geometry = feature.geometry as Point
			const [longitude, latitude] = geometry.coordinates
			const kind = String(feature.properties?.kind ?? defaultKind)
			const state = (feature.properties?.state ??
				defaultState) as StepProgressState

			return (
				<Marker
					key={`${idPrefix}-${kind}-${index}-${longitude}-${latitude}`}
					id={`${idPrefix}-${index}`}
					lngLat={[longitude, latitude]}
					anchor="center"
				>
					<IndoorNavStepMarkerPin
						kind={kind}
						state={state}
						primaryColor={primaryColor}
						mapMode={mapMode}
					/>
				</Marker>
			)
		})
}

export function IndoorNavStepMarkers({
	stepMarkersGeoJSON,
	primaryColor,
	mapMode
}: IndoorNavStepMarkersProps): React.JSX.Element {
	return (
		<>
			{renderMarkerFeatures(
				stepMarkersGeoJSON.features,
				'indoor-step',
				primaryColor,
				mapMode,
				'entry',
				'todo'
			)}
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
	return (
		<>
			{entrancesGeoJSON.features
				.filter((feature) => feature.geometry.type === 'Point')
				.map((feature, index) => {
					const geometry = feature.geometry as Point
					const [longitude, latitude] = geometry.coordinates
					const rawId = String(feature.properties?.id ?? '')
					return (
						<Marker
							key={`indoor-entrance-${rawId}-${index}`}
							id={`indoor-entrance-${index}`}
							lngLat={[longitude, latitude]}
							anchor="center"
							onPress={
								onEntrancePress != null && rawId !== ''
									? () => onEntrancePress(rawId)
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
					)
				})}
		</>
	)
}
