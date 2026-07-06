import Color from 'color'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/drag-view'
import Badge from '@/components/Universal/badge'
import ColorBand from '@/components/Universal/color-band'
import TimeDisplay from '@/components/Universal/time-display'
import i18n from '@/localization/i18n'
import type { CalendarEntry } from '@/types/timetable'
import { formatCompactDateRange, formatFriendlyTime } from '@/utils/date-utils'
import { hairlineBorder } from '@/utils/uniwind-utils'

interface TimetableCalendarEntryProps {
	item: CalendarEntry
	calendarItemColor: string
}

export default function TimetableCalendarEntry({
	item,
	calendarItemColor
}: TimetableCalendarEntryProps): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation('timetable')

	const eventName =
		typeof item.name === 'object'
			? item.name[i18n.language as 'en' | 'de'] ||
				item.name.en ||
				item.name.de ||
				''
			: String(item.name || '')

	const isMultiDayEvent =
		item.originalEndDate &&
		item.originalStartDate &&
		new Date(item.originalEndDate).getTime() !==
			new Date(item.originalStartDate).getTime()

	const infoText =
		isMultiDayEvent && item.originalStartDate
			? formatCompactDateRange(
					item.originalStartDate || item.startDate,
					item.originalEndDate || null
				)
			: ''

	const timeElement = item.isAllDay ? (
		<Badge text={t('dates.allDay', { ns: 'common' })} type="allDay" />
	) : (
		<TimeDisplay
			startTime={formatFriendlyTime(item.startDate)}
			endTime={item.endDate ? formatFriendlyTime(item.endDate) : undefined}
		/>
	)

	return (
		<DragDropView
			mode="drag"
			scope="system"
			dragValue={`${eventName} (${infoText})`}
		>
			<Pressable
				onPress={() => {
					router.push({
						pathname: '/calendar',
						params: { event: item.id }
					})
				}}
				className="mb-2.5 rounded-md overflow-hidden"
				android_ripple={{
					color: Color(calendarItemColor).alpha(0.1).string()
				}}
			>
				<View
					className="flex-row bg-card rounded-md overflow-hidden min-h-[70px] border-border"
					style={hairlineBorder}
				>
					<ColorBand color={calendarItemColor} />
					<View className="flex-1 p-3.5 relative">
						<View className="flex-row justify-between items-start mb-2">
							<Text
								className="text-[15.5px] font-semibold text-text flex-1 me-2"
								numberOfLines={1}
							>
								{eventName}
							</Text>
						</View>
						<View className="flex-row justify-between items-center mt-1">
							<View className="flex-row items-center gap-2.5">
								{infoText && (
									<Text className="text-sm text-label">{infoText}</Text>
								)}
								<Badge text="THI" type="calendar" />
							</View>
							{timeElement}
						</View>
					</View>
				</View>
			</Pressable>
		</DragDropView>
	)
}
