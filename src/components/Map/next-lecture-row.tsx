import type { FeatureCollection } from 'geojson'
import type React from 'react'
import type { SelectMapElement } from '@/types/map'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { selectRoomOnMap } from '@/utils/map-room-select'
import { isValidRoom } from '@/utils/timetable-utils'
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
				selectRoomOnMap(
					allRooms,
					lecture.rooms[0],
					'NextLecture',
					selectMapElement,
					notificationColor
				)
			}}
		/>
	)
}
