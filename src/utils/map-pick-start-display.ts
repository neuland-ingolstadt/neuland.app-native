import type { ClickedMapElement } from '@/types/map'
import { SEARCH_TYPES } from '@/types/map'
import { getIndoorGraph } from '@/utils/indoor-nav'

/** Map pin / highlight for the chosen route start while destination selection stays put. */
export function pickStartMapElement(
	pickStartActive: boolean,
	destinationRoomCode: string | null,
	startFromId: string,
	mapSelection: ClickedMapElement | null
): ClickedMapElement | null {
	if (!pickStartActive) {
		return null
	}
	if (mapSelection != null) {
		if (
			mapSelection.type === SEARCH_TYPES.ROOM &&
			destinationRoomCode != null &&
			mapSelection.data === destinationRoomCode
		) {
			return null
		}
		return mapSelection
	}
	const node = getIndoorGraph().nodes.get(startFromId)
	if (node == null) {
		return null
	}
	if (
		node.roomCode != null &&
		destinationRoomCode != null &&
		node.roomCode === destinationRoomCode
	) {
		return null
	}
	const center = node.coord
	if (node.kind === 'room' && node.roomCode != null) {
		return {
			type: SEARCH_TYPES.ROOM,
			data: node.roomCode,
			center,
			manual: true
		}
	}
	return {
		type: SEARCH_TYPES.BUILDING,
		data: startFromId,
		center,
		manual: true
	}
}
