import type { FeatureCollection } from 'geojson'
import { useEffect, useRef, useState } from 'react'
import { FLOOR_OVERLAY_FADE_MS } from '@/components/Map/map-config'

interface UseFloorOverlaySlideOptions {
	floor: string
	rooms: FeatureCollection | undefined
	availableRooms: FeatureCollection | undefined
}

interface OverlaySlot {
	rooms: FeatureCollection | undefined
	availableRooms: FeatureCollection | undefined
	opacity: number
	fadeDuration: number
}

export function useFloorOverlaySlide({
	floor,
	rooms,
	availableRooms
}: UseFloorOverlaySlideOptions): {
	incoming: OverlaySlot
	outgoing: OverlaySlot | null
} {
	const floorRef = useRef(floor)
	const roomsRef = useRef(rooms)
	const availableRoomsRef = useRef(availableRooms)
	const incomingRoomsRef = useRef(rooms)
	const incomingAvailableRoomsRef = useRef(availableRooms)
	const animatingRef = useRef(false)

	const [incoming, setIncoming] = useState<OverlaySlot>({
		rooms,
		availableRooms,
		opacity: 1,
		fadeDuration: 0
	})
	const [outgoing, setOutgoing] = useState<OverlaySlot | null>(null)

	roomsRef.current = rooms
	availableRoomsRef.current = availableRooms
	incomingRoomsRef.current = incoming.rooms
	incomingAvailableRoomsRef.current = incoming.availableRooms

	useEffect(() => {
		if (floor === floorRef.current) {
			return
		}

		const previousRooms = incomingRoomsRef.current
		const previousAvailableRooms = incomingAvailableRoomsRef.current
		const nextRooms = roomsRef.current
		const nextAvailableRooms = availableRoomsRef.current
		floorRef.current = floor
		animatingRef.current = true

		setOutgoing({
			rooms: previousRooms,
			availableRooms: previousAvailableRooms,
			opacity: 1,
			fadeDuration: 0
		})
		setIncoming({
			rooms: nextRooms,
			availableRooms: nextAvailableRooms,
			opacity: 0,
			fadeDuration: 0
		})

		const frame = requestAnimationFrame(() => {
			setOutgoing({
				rooms: previousRooms,
				availableRooms: previousAvailableRooms,
				opacity: 0,
				fadeDuration: FLOOR_OVERLAY_FADE_MS
			})
			setIncoming({
				rooms: nextRooms,
				availableRooms: nextAvailableRooms,
				opacity: 1,
				fadeDuration: FLOOR_OVERLAY_FADE_MS
			})
		})

		const timeout = setTimeout(() => {
			animatingRef.current = false
			setOutgoing(null)
			setIncoming({
				rooms: roomsRef.current,
				availableRooms: availableRoomsRef.current,
				opacity: 1,
				fadeDuration: 0
			})
		}, FLOOR_OVERLAY_FADE_MS)

		return () => {
			cancelAnimationFrame(frame)
			clearTimeout(timeout)
			animatingRef.current = false
		}
	}, [floor])

	useEffect(() => {
		if (animatingRef.current) {
			return
		}
		setIncoming((current) => ({
			...current,
			rooms,
			availableRooms
		}))
	}, [availableRooms, rooms])

	return { incoming, outgoing }
}
