import type { FeatureCollection } from 'geojson'
import { useEffect, useState } from 'react'
import { FLOOR_OVERLAY_FADE_HALF_MS } from '@/components/Map/map-config'

interface UseFloorOverlayFadeOptions {
	floor: string
	rooms: FeatureCollection | undefined
	availableRooms: FeatureCollection | undefined
}

export function useFloorOverlayFade({
	floor,
	rooms,
	availableRooms
}: UseFloorOverlayFadeOptions): {
	displayedRooms: FeatureCollection | undefined
	displayedAvailableRooms: FeatureCollection | undefined
	overlayOpacity: number
} {
	const [displayedFloor, setDisplayedFloor] = useState(floor)
	const [displayedRooms, setDisplayedRooms] = useState(rooms)
	const [displayedAvailableRooms, setDisplayedAvailableRooms] =
		useState(availableRooms)
	const [overlayOpacity, setOverlayOpacity] = useState(1)

	useEffect(() => {
		if (floor !== displayedFloor) {
			return
		}
		setDisplayedRooms(rooms)
		setDisplayedAvailableRooms(availableRooms)
	}, [availableRooms, displayedFloor, floor, rooms])

	useEffect(() => {
		if (floor === displayedFloor) {
			return
		}

		setOverlayOpacity(0)
		const timeout = setTimeout(() => {
			setDisplayedRooms(rooms)
			setDisplayedAvailableRooms(availableRooms)
			setDisplayedFloor(floor)
			setOverlayOpacity(1)
		}, FLOOR_OVERLAY_FADE_HALF_MS)

		return () => {
			clearTimeout(timeout)
		}
	}, [availableRooms, displayedFloor, floor, rooms])

	return {
		displayedRooms,
		displayedAvailableRooms,
		overlayOpacity
	}
}
