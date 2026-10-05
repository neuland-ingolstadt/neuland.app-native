import { Image } from 'expo-image'
import type React from 'react'
import { IndoorNavStepMarkerPin } from '@/components/Map/indoor-nav-step-marker-pin'
import type { MapMode } from '@/components/Map/map-config'
import { SEARCH_TYPES } from '@/types/map'

interface MapSelectionMarkerProps {
	type: SEARCH_TYPES
	selectionColor: string
	primaryColor: string
	mapMode: MapMode
}

export function MapSelectionMarker({
	type,
	selectionColor,
	primaryColor,
	mapMode
}: MapSelectionMarkerProps): React.JSX.Element {
	if (type === SEARCH_TYPES.BUILDING) {
		return (
			<IndoorNavStepMarkerPin
				kind="entrance"
				state="current"
				primaryColor={primaryColor}
				mapMode={mapMode}
			/>
		)
	}

	return (
		<Image
			source={require('@/assets/map-marker.png')}
			style={{ width: 34, height: 34, tintColor: selectionColor }}
			contentFit="contain"
			accessibilityIgnoresInvertColors
		/>
	)
}
