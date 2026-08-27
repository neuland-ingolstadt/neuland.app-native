import type { FeatureCollection } from 'geojson'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useCSSVariable } from 'uniwind'
import { SEARCH_TYPES, type SelectMapElement } from '@/types/map'
import type { AvailableRoom } from '@/types/utils'
import { parseMapCoordinate } from '@/utils/map-screen-utils'
import { roomNotFoundToast } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import { MapSuggestionRow } from './map-suggestion-row'

interface AvailableRoomRowProps {
	room: AvailableRoom
	allRooms: FeatureCollection
	selectMapElement: SelectMapElement
}

export const AvailableRoomRow = ({
	room,
	allRooms,
	selectMapElement
}: AvailableRoomRowProps): React.JSX.Element => {
	const { t } = useTranslation('common')
	const notificationColor = String(
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	)

	return (
		<MapSuggestionRow
			testID="map-available-room-row"
			iosIcon="studentdesk"
			androidIcon="school"
			webIcon="Notebook"
			title={room.room}
			subtitle={
				<>
					{room.type}
					{room.capacity !== undefined && (
						<>
							{' '}
							({room.capacity} {t('pages.rooms.options.seats')})
						</>
					)}
				</>
			}
			startTime={room.from}
			endTime={room.until}
			onPress={() => {
				const details = allRooms.features.find(
					(x) => x.properties?.Raum === room.room
				)

				if (details == null) {
					roomNotFoundToast(room.room, notificationColor)
					return
				}

				const etage = details?.properties?.Ebene as string | undefined

				selectMapElement({
					room: room.room,
					type: SEARCH_TYPES.ROOM,
					center: parseMapCoordinate(details.properties?.center),
					origin: 'AvailableRoomsSuggestion',
					manual: false,
					floor: etage ?? 'EG'
				})
			}}
		/>
	)
}
