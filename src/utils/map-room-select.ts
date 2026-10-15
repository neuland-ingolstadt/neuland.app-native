import type { FeatureCollection } from 'geojson'
import {
	type MapSelectionOrigin,
	SEARCH_TYPES,
	type SelectMapElement
} from '@/types/map'
import { findRoomFeature, parseMapCoordinate } from '@/utils/map-screen-utils'
import { roomNotFoundToast } from '@/utils/ui-utils'

/** Shared room lookup → toast → selectMapElement for suggestion rows. */
export function selectRoomOnMap(
	allRooms: FeatureCollection,
	roomCode: string | undefined,
	origin: MapSelectionOrigin,
	selectMapElement: SelectMapElement,
	notificationColor: string
): void {
	if (roomCode == null || roomCode === '') {
		roomNotFoundToast(roomCode ?? '', notificationColor)
		return
	}
	const details = findRoomFeature(allRooms, roomCode)
	if (details == null) {
		roomNotFoundToast(roomCode, notificationColor)
		return
	}
	const etage = (details.properties?.Ebene as string | undefined) ?? 'EG'
	selectMapElement({
		room: roomCode,
		type: SEARCH_TYPES.ROOM,
		center: parseMapCoordinate(details.properties?.center),
		origin,
		manual: false,
		floor: etage
	})
}
