import type { FeatureCollection } from 'geojson'
import type React from 'react'
import { SEARCH_TYPES, type SelectMapElement } from '@/types/map'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { parseMapCoordinate } from '@/utils/map-screen-utils'
import { isValidRoom } from '@/utils/timetable-utils'
import { roomNotFoundToast } from '@/utils/ui-utils'
import { MapSuggestionRow } from './map-suggestion-row'

interface NextLectureRowProps {
	lecture: FriendlyTimetableEntry
	allRooms: FeatureCollection
	selectMapElement: SelectMapElement
	notificationColor: string
}

export const NextLectureRow = ({
	lecture,
	allRooms,
	selectMapElement,
	notificationColor
}: NextLectureRowProps): React.JSX.Element => {
	return (
		<MapSuggestionRow
			testID="map-next-lecture-row"
			disabled={lecture.rooms.length === 0 || !isValidRoom(lecture.rooms[0])}
			iosIcon="clock.fill"
			androidIcon="school"
			webIcon="Clock"
			title={lecture.name}
			subtitle={lecture.rooms.join(', ')}
			startTime={lecture.startDate}
			endTime={lecture.endDate}
			titleNumberOfLines={2}
			onPress={() => {
				const details = allRooms.features.find(
					(x) => x.properties?.Raum === lecture.rooms[0]
				)
				if (details == null) {
					roomNotFoundToast(lecture.rooms[0], notificationColor)
					return
				}
				const etage = (details?.properties?.Ebene as string) ?? 'EG'
				selectMapElement({
					room: lecture.rooms[0],
					type: SEARCH_TYPES.ROOM,
					center: parseMapCoordinate(details.properties?.center),
					origin: 'NextLecture',
					manual: false,
					floor: etage
				})
			}}
		/>
	)
}
