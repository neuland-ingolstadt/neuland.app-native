import { trackEvent } from '@aptabase/react-native'
import type { FeatureCollection, Position } from 'geojson'
import React, { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { MapContext } from '@/contexts/map'
import { SEARCH_TYPES } from '@/types/map'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { isValidRoom } from '@/utils/timetable-utils'
import { getContrastColor, roomNotFoundToast } from '@/utils/ui-utils'

import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'

interface NextLectureSuggestionsProps {
	allRooms: FeatureCollection
	handlePresentModalPress: () => void
}

const NextLectureSuggestion: React.FC<NextLectureSuggestionsProps> = ({
	allRooms,
	handlePresentModalPress
}) => {
	const { setClickedElement, nextLecture, setCurrentFloor } = use(MapContext)
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation('common')
	if (nextLecture == null || nextLecture.length === 0) {
		return null
	}
	return (
		<View style={styles.suggestionContainer}>
			<View style={styles.suggestionSectionHeaderContainer}>
				<Text style={styles.suggestionSectionHeader}>
					{t('pages.map.details.room.nextLecture')}
				</Text>
				<Text style={styles.suggestionMoreDateText}>
					{formatFriendlyDate(nextLecture[0].date)}
				</Text>
			</View>
			<View style={styles.radiusBg}>
				{nextLecture.map((lecture, key) => (
					<React.Fragment key={key}>
						<Pressable
							disabled={
								lecture.rooms.length === 0 || !isValidRoom(lecture.rooms[0])
							}
							style={styles.suggestionRow}
							onPress={() => {
								const details = allRooms.features.find(
									(x) => x.properties?.Raum === lecture.rooms[0]
								)
								if (details == null) {
									roomNotFoundToast(lecture.rooms[0], theme.colors.notification)
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
							<View style={styles.suggestionInnerRow}>
								<View style={styles.suggestionIconContainer}>
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
										style={styles.primaryContrast}
									/>
								</View>

								<View style={styles.suggestionContent}>
									<Text style={styles.suggestionTitle} numberOfLines={2}>
										{lecture.name}
									</Text>
									<Text style={styles.suggestionSubtitle}>
										{lecture.rooms.join(', ')}
									</Text>
								</View>
							</View>
							<View style={styles.suggestionRightContainer}>
								<Text style={styles.timeLabel}>
									{formatFriendlyTime(lecture.startDate)}
								</Text>
								<Text style={styles.time}>
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

const stylesheet = createStyleSheet((theme) => ({
	primaryContrast: {
		color: getContrastColor(theme.colors.primary)
	},

	radiusBg: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 14,
		overflow: 'hidden'
	},
	suggestionContainer: {
		marginBottom: 10
	},
	suggestionContent: {
		flex: 1,
		paddingRight: 14
	},
	suggestionIconContainer: {
		alignItems: 'center',
		backgroundColor: theme.colors.primary,
		borderRadius: 50,
		height: 40,
		justifyContent: 'center',
		marginRight: 14,
		width: 40
	},
	suggestionInnerRow: {
		alignItems: 'center',
		flexDirection: 'row',
		flex: 1,
		justifyContent: 'space-between'
	},
	suggestionMoreDateText: {
		color: theme.colors.labelColor,
		fontSize: 15,
		fontWeight: '500',
		paddingRight: 10,
		textAlign: 'right'
	},
	suggestionRightContainer: {
		flexDirection: 'column',
		justifyContent: 'center'
	},
	suggestionRow: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		paddingVertical: 18
	},
	suggestionSectionHeader: {
		color: theme.colors.text,
		fontSize: 20,
		fontWeight: '600',
		marginBottom: 2,
		paddingTop: 8,
		textAlign: 'left'
	},
	suggestionSectionHeaderContainer: {
		alignItems: 'flex-end',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 4
	},
	suggestionSubtitle: {
		color: theme.colors.text,
		fontSize: 14,
		fontWeight: '400'
	},
	suggestionTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 1
	},
	time: {
		color: theme.colors.text,
		fontVariant: ['tabular-nums']
	},
	timeLabel: {
		color: theme.colors.labelColor,
		fontVariant: ['tabular-nums']
	}
}))
