import type { FeatureCollection } from 'geojson'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useCSSVariable } from 'uniwind'
import type { SelectMapElement } from '@/types/map'
import type { AvailableRoom } from '@/types/utils'
import { selectRoomOnMap } from '@/utils/map-room-select'
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
				selectRoomOnMap(
					allRooms,
					room.room,
					'AvailableRoomsSuggestion',
					selectMapElement,
					notificationColor
				)
			}}
		/>
	)
}
