import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import Badge from '@/components/Universal/badge'
import ColorBand from '@/components/Universal/color-band'
import TimeDisplay from '@/components/Universal/time-display'
import type { PersonalEventOccurrence } from '@/types/personal-events'
import { formatFriendlyTime } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'

interface TimetablePersonalEntryProps {
	item: PersonalEventOccurrence
}

export default function TimetablePersonalEntry({
	item
}: TimetablePersonalEntryProps): React.JSX.Element {
	const { t } = useTranslation('timetable')
	const color = String(
		toColor(useCSSVariable('--color-personal-event')) ?? '#30b0c7'
	)
	return (
		<Pressable
			testID={`personal-event-${item.id}`}
			accessibilityRole="button"
			onPress={() =>
				router.navigate({
					pathname: '/personal-event',
					params: { id: item.seriesId, start: item.startDate.toISOString() }
				})
			}
			className="mb-2.5 rounded-md overflow-hidden"
		>
			<View className="flex-row bg-card rounded-md overflow-hidden min-h-[70px] border-hairline border-border">
				<ColorBand color={color} />
				<View className="flex-1 p-3.5 gap-2">
					<Text
						className="text-[15.5px] font-semibold text-text"
						numberOfLines={2}
					>
						{item.name}
					</Text>
					{item.location ? (
						<Text className="text-sm text-label" numberOfLines={1}>
							{item.location}
						</Text>
					) : null}
					<View className="flex-row justify-between items-center gap-2">
						<Badge text={t('personalEvents.badge')} type="personal" />
						<TimeDisplay
							startTime={formatFriendlyTime(item.startDate)}
							endTime={formatFriendlyTime(item.endDate)}
						/>
					</View>
				</View>
			</View>
		</Pressable>
	)
}
