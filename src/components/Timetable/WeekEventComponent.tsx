/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { formatFriendlyTime } from '@/utils/date-utils'
import { getContrastColor } from '@/utils/ui-utils'
import type { PackedEvent } from '@howljs/calendar-kit'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { Platform, Text, View } from 'react-native'
import {
	type UnistylesTheme,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'

const isIOS =
	Platform.OS === 'ios' ||
	(Platform.OS === 'web' && navigator.userAgent.includes('Safari'))
const EventComponent = ({
	event,
	theme,
	isDark
}: {
	event: PackedEvent
	theme: UnistylesTheme
	isDark: boolean
}): React.JSX.Element | null => {
	const { styles } = useStyles(stylesheet)
	if (event.start.dateTime === undefined || event.end.dateTime === undefined) {
		return null
	}
	const timetableMode = usePreferencesStore((state) => state.timetableMode)
	const isExam = event.eventType === 'exam'
	const isCalendar = event.eventType === 'calendar'
	const begin = new Date(event.start.dateTime)
	const end = new Date(event.end.dateTime)
	const duration = end.getTime() - begin.getTime()
	const isOverflowing = duration < 1000 * 60 * 60
	const nameParts = event.shortName?.split('_')?.slice(1) as string[]
	const background = isExam
		? eventBackgroundColor(theme.colors.notification, isDark)
		: isCalendar
			? eventBackgroundColor(theme.colors.calendarItem, isDark)
			: eventBackgroundColor(theme.colors.primary, isDark)

	const fontColor = isExam
		? textColor(theme.colors.notification, background, isDark)
		: isCalendar
			? textColor(theme.colors.calendarItem, background, isDark)
			: textColor(theme.colors.primary, background, isDark)
	const eventName = event?.name as string
	if (!eventName) {
		console.log('Event name is empty')
		return null
	}
	const nameToDisplay =
		timetableMode === 'timeline-1'
			? eventName
			: eventName.length > 15
				? nameParts?.join('_') !== ''
					? (nameParts?.join('_') ?? eventName)
					: (event.shortName as string)
				: eventName
	// hide ' - ' between time to prevent the date from using 3 lines

	const timeToDisplay =
		timetableMode === 'timeline-7'
			? `${formatFriendlyTime(begin)} ${formatFriendlyTime(end)}`
			: `${formatFriendlyTime(begin)} - ${formatFriendlyTime(end)}`

	const EventLine = ({ color }: { color: string }) => {
		return (
			<LinearGradient
				colors={[color, lineColor(color, background, isDark)]}
				start={[0, 0.2]}
				end={[1, 0.8]}
				style={styles.eventLine}
			/>
		)
	}

	const lineColorByType = isExam
		? theme.colors.notification
		: isCalendar
			? theme.colors.calendarItem
			: theme.colors.primary

	return (
		<View
			style={{
				...styles.eventContainer,
				backgroundColor: background
			}}
		>
			{isIOS && <EventLine color={lineColorByType} />}
			<View style={styles.eventText}>
				<View>
					<Text
						style={{
							...styles.eventTitle,
							color: fontColor
						}}
						numberOfLines={2}
					>
						{nameToDisplay}
					</Text>

					{!isOverflowing && (
						<Text
							style={{
								...styles.eventTime,
								color: fontColor,
								fontVariant: ['tabular-nums']
							}}
						>
							{timeToDisplay}
						</Text>
					)}
				</View>
				<View style={styles.roomRow}>
					{isOverflowing ? null : (
						<Text
							numberOfLines={1}
							ellipsizeMode="tail"
							style={{
								...styles.eventLocation,
								color: fontColor
							}}
						>
							{Array.isArray(event.rooms)
								? event.rooms.join(', ')
								: (event.rooms ?? '')}
						</Text>
					)}
				</View>
			</View>
		</View>
	)
}

const eventBackgroundColor = (color: string, isDark: boolean): string =>
	isIOS
		? Color(color)
				.alpha(0.73)
				.lighten(isDark ? 0 : 0.6)
				.darken(isDark ? 0.65 : 0)
				.rgb()
				.string()
		: color

const textColor = (
	color: string,
	background: string,
	isDark: boolean
): string => {
	let textColor = isIOS
		? Color(color)
				.darken(isDark ? 0 : 0.5)
				.lighten(isDark ? 0.65 : 0)
				.saturate(0.5)
				.hex()
		: getContrastColor(background)

	const contrast = Color(background).contrast(Color(textColor))

	if (contrast < 3.5 && isIOS) {
		textColor = Color(background).isLight() ? '#000000' : '#FFFFFF'
	}
	return textColor
}

const lineColor = (
	color: string,
	eventBackgroundColor: string,
	isDark: boolean
): string =>
	isIOS
		? Color(color)
				.darken(isDark ? 0.2 : 0)
				.lighten(isDark ? 0 : 0.2)
				.hex()
		: eventBackgroundColor

const stylesheet = createStyleSheet(() => ({
	eventContainer: {
		borderRadius: 0,
		flex: 1,
		flexDirection: 'row'
	},
	eventLine: {
		borderBottomStartRadius: 5,
		borderTopStartRadius: 5,
		width: 4
	},
	eventLocation: {
		fontSize: 14
	},
	eventText: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'space-between',
		paddingLeft: isIOS ? 3 : 4,
		paddingRight: 2,
		paddingVertical: 3
	},
	eventTime: {
		fontSize: 14,
		fontWeight: '500'
	},
	eventTitle: {
		fontSize: 15,
		fontWeight: 'bold',
		marginBottom: 1
	},
	roomRow: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 4
	}
}))

export default EventComponent
