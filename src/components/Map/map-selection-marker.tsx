import { Image } from 'expo-image'
import type React from 'react'

interface MapSelectionMarkerProps {
	selectionColor: string
}

export function MapSelectionMarker({
	selectionColor
}: MapSelectionMarkerProps): React.JSX.Element {
	return (
		<Image
			source={require('@/assets/map-marker.png')}
			style={{ width: 34, height: 34, tintColor: selectionColor }}
			contentFit="contain"
			accessibilityIgnoresInvertColors
		/>
	)
}
