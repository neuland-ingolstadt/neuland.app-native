import type { PackedEvent } from '@howljs/calendar-kit'
import Color from 'color'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { Text, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import { useTimetableStore } from '@/hooks/useTimetableStore'
import { formatFriendlyTime } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'

const EventLine = ({
	color,
	background,
	isDark
}: {
	color: string
	background: string
	isDark: boolean
}) => (
	<LinearGradient
		colors={[color, lineColor(color, background, isDark)]}
		start={[0, 0.2]}
		end={[1, 0.8]}
		style={{
			borderBottomStartRadius: 5,
			borderTopStartRadius: 5,
			width: 4
		}}
	/>
)

const EventComponent = ({
	event
}: {
	event: PackedEvent
}): React.JSX.Element | null => {
	const { theme } = useUniwind()
	const isDark = theme === 'dark'
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const notificationColor = String(
		toColor(useCSSVariable('--color-notification')) ?? '#ff3b30'
	)
	const calendarItemColor = String(
		toColor(useCSSVariable('--color-calendar-item')) ?? '#5d5d5d'
	)
	const timetableMode = useTimetableStore((state) => state.timetableMode)

	if (event.start.dateTime === undefined || event.end.dateTime === undefined) {
		return null
	}
	const isExam = event.eventType === 'exam'
	const isCalendar = event.eventType === 'calendar'
	const begin = new Date(event.start.dateTime)
	const end = new Date(event.end.dateTime)
	const duration = end.getTime() - begin.getTime()
	const isOverflowing = duration < 1000 * 60 * 60
	const nameParts = event.shortName?.split('_')?.slice(1) as string[]
	const background = isExam
		? eventBackgroundColor(notificationColor, isDark)
		: isCalendar
			? eventBackgroundColor(calendarItemColor, isDark)
			: eventBackgroundColor(primaryColor, isDark)

	const fontColor = isExam
		? textColor(notificationColor, background, isDark)
		: isCalendar
			? textColor(calendarItemColor, background, isDark)
			: textColor(primaryColor, background, isDark)
	const eventName = event?.name as string
	if (!eventName) {
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

	const timeToDisplay = `${formatFriendlyTime(begin)}${timetableMode === 'timeline-7' ? ' ' : ' - '}${formatFriendlyTime(end)}`

	const lineColorByType = isExam
		? notificationColor
		: isCalendar
			? calendarItemColor
			: primaryColor

	return (
		<View
			className="rounded-none flex-1 flex-row"
			style={{ backgroundColor: background }}
		>
			<EventLine
				color={lineColorByType}
				background={background}
				isDark={isDark}
			/>
			<View className="flex-1 flex-col justify-between pl-[3px] pr-0.5 py-[3px]">
				<View>
					<Text
						className="text-[15px] font-bold mb-px"
						style={{ color: fontColor }}
						numberOfLines={2}
					>
						{nameToDisplay}
					</Text>

					{!isOverflowing && (
						<Text
							className="text-sm font-medium"
							style={{
								color: fontColor,
								fontVariant: ['tabular-nums']
							}}
						>
							{timeToDisplay}
						</Text>
					)}
				</View>
				<View className="items-center flex-row gap-1">
					{isOverflowing ? null : (
						<Text
							numberOfLines={1}
							ellipsizeMode="tail"
							className="text-sm"
							style={{ color: fontColor }}
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
	Color(color)
		.alpha(0.73)
		.lighten(isDark ? 0 : 0.6)
		.darken(isDark ? 0.65 : 0)
		.rgb()
		.string()

const textColor = (
	color: string,
	background: string,
	isDark: boolean
): string => {
	let computedTextColor = Color(color)
		.darken(isDark ? 0 : 0.5)
		.lighten(isDark ? 0.65 : 0)
		.saturate(0.5)
		.hex()

	const contrast = Color(background).contrast(Color(computedTextColor))

	if (contrast < 3.5) {
		computedTextColor = Color(background).isLight() ? '#000000' : '#FFFFFF'
	}
	return computedTextColor
}

const lineColor = (color: string, _: string, isDark: boolean): string =>
	Color(color)
		.darken(isDark ? 0.2 : 0)
		.lighten(isDark ? 0 : 0.2)
		.hex()

export default EventComponent
