import {
	type GeolocationPosition,
	LocationManager
} from '@maplibre/maplibre-react-native'
import { useEffect, useState } from 'react'
import type { MapCoordinate } from '@/types/map'

/** Live user position for suggestion ranking and route origin. */
export function useUserMapCoordinate(): MapCoordinate | undefined {
	const [coordinate, setCoordinate] = useState<MapCoordinate | undefined>()

	useEffect(() => {
		let cancelled = false

		const applyPosition = (position: GeolocationPosition | undefined): void => {
			if (cancelled || position == null) {
				return
			}
			setCoordinate([position.coords.longitude, position.coords.latitude])
		}

		void LocationManager.getCurrentPosition()
			.then(applyPosition)
			.catch(() => {
				// Permission denied / unavailable — lecture-room fallback may apply.
			})

		LocationManager.addListener(applyPosition)

		return () => {
			cancelled = true
			LocationManager.removeListener(applyPosition)
		}
	}, [])

	return coordinate
}
