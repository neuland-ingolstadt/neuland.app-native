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
	const [heldFloor, setHeldFloor] = useState(floor)
	const [heldRooms, setHeldRooms] = useState(rooms)
	const [heldAvailableRooms, setHeldAvailableRooms] = useState(availableRooms)

	const isHoldingPreviousFloor = floor !== heldFloor
	const displayedRooms = isHoldingPreviousFloor ? heldRooms : rooms
	const displayedAvailableRooms = isHoldingPreviousFloor
		? heldAvailableRooms
		: availableRooms
	const overlayOpacity = isHoldingPreviousFloor ? 0 : 1

	useEffect(() => {
		if (floor === heldFloor) {
			return
		}

		const timeout = setTimeout(() => {
			setHeldRooms(rooms)
			setHeldAvailableRooms(availableRooms)
			setHeldFloor(floor)
		}, FLOOR_OVERLAY_FADE_HALF_MS)

		return () => {
			clearTimeout(timeout)
		}
	}, [availableRooms, heldFloor, floor, rooms])

	return {
		displayedRooms,
		displayedAvailableRooms,
		overlayOpacity
	}
}
