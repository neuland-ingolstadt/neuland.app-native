import { trackEvent } from '@aptabase/react-native'
import type { FeatureCollection, Position } from 'geojson'
import React, { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { MapContext } from '@/contexts/map'
import { SEARCH_TYPES } from '@/types/map'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { isValidRoom } from '@/utils/timetable-utils'
import { getContrastColor, roomNotFoundToast } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

import Divider from '../Universal/divider'
import PlatformIcon from '../Universal/icon'

interface NextLectureSuggestionsProps {
	allRooms: FeatureCollection
	handlePresentModalPress: () => void
}

const NextLectureSuggestion = ({
	allRooms,
	handlePresentModalPress
}: NextLectureSuggestionsProps): React.JSX.Element | null => {
	const { setClickedElement, nextLecture, setCurrentFloor } = use(MapContext)
	const { t } = useTranslation('common')
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const notificationColor = String(
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	)
	const labelColor = toColor(useCSSVariable('--color-label'))
	const contrastOnPrimary = getContrastColor(primaryColor)

	if (nextLecture == null || nextLecture.length === 0) {
		return null
	}
	return (
		<View className="mb-2.5">
			<View className="items-end flex-row justify-between mb-1">
				<Text className="text-text text-label-secondary ios:text-base ios:font-semibold android:text-[13px] android:font-normal android:uppercase web:text-base web:font-semibold mb-0.5 pt-2 text-left">
					{t('pages.map.details.room.nextLecture')}
				</Text>
				<Text
					className="text-[15px] font-medium pe-2.5 text-right"
					style={{ color: labelColor }}
				>
					{formatFriendlyDate(nextLecture[0].date)}
				</Text>
			</View>
			<View
				className="bg-card ios:rounded-[18px] android:rounded-lg web:rounded-lg overflow-hidden border-border"
				style={hairlineBorder}
			>
				{nextLecture.map((lecture, key) => (
					<React.Fragment key={key}>
						<Pressable
							disabled={
								lecture.rooms.length === 0 || !isValidRoom(lecture.rooms[0])
							}
							className="flex-row px-3 py-[18px]"
							onPress={() => {
								const details = allRooms.features.find(
									(x) => x.properties?.Raum === lecture.rooms[0]
								)
								if (details == null) {
									roomNotFoundToast(lecture.rooms[0], notificationColor)
									return
								}
								const etage = (details?.properties?.Ebene as string) ?? 'EG'
								setCurrentFloor({
									floor: etage,
									manual: false
								})
								setClickedElement({
									data: lecture.rooms[0],
									type: SEARCH_TYPES.ROOM,
									center: details?.properties?.center as Position | undefined,
									manual: false
								})
								trackEvent('Room', {
									room: lecture.rooms[0],
									origin: 'NextLecture'
								})

								handlePresentModalPress()
							}}
						>
							<View className="items-center flex-row flex-1 justify-between">
								<View
									className="items-center rounded-full h-10 justify-center me-3.5 w-10"
									style={{ backgroundColor: primaryColor }}
								>
									<PlatformIcon
										ios={{
											name: 'clock.fill',
											size: 18
										}}
										android={{
											name: 'school',
											size: 20
										}}
										web={{
											name: 'Clock',
											size: 20
										}}
										style={{ color: contrastOnPrimary }}
									/>
								</View>

								<View className="flex-1 pe-3.5">
									<Text
										className="text-text text-base font-semibold mb-px"
										numberOfLines={2}
									>
										{lecture.name}
									</Text>
									<Text className="text-text text-sm font-normal">
										{lecture.rooms.join(', ')}
									</Text>
								</View>
							</View>
							<View className="flex-col justify-center">
								<Text
									className="text-label"
									style={{ fontVariant: ['tabular-nums'] }}
								>
									{formatFriendlyTime(lecture.startDate)}
								</Text>
								<Text
									className="text-text"
									style={{ fontVariant: ['tabular-nums'] }}
								>
									{formatFriendlyTime(lecture.endDate)}
								</Text>
							</View>
						</Pressable>
						{key !== nextLecture.length - 1 && <Divider />}
					</React.Fragment>
				))}
			</View>
		</View>
	)
}

export default NextLectureSuggestion
