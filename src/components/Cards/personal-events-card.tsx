import { router } from 'expo-router'
import type React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import BaseCard from '@/components/Cards/base-card'
import EventItem from '@/components/Universal/event-item'
import { useIsFeatureEnabled } from '@/hooks/useFeatureFlag'
import { useNow } from '@/hooks/useNow'
import { usePersonalEventsStore } from '@/hooks/usePersonalEventsStore'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import { getUpcomingPersonalOccurrences } from '@/utils/personal-events-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function PersonalEventsCard(): React.JSX.Element {
	const { t } = useTranslation('timetable')
	const enabled = useIsFeatureEnabled(FeatureFlagKeys.personalEvents)
	const events = usePersonalEventsStore((state) => state.events)
	const now = useNow(enabled)
	const upcoming = useMemo(
		() => (enabled ? getUpcomingPersonalOccurrences(events, now, 3) : []),
		[enabled, events, now]
	)
	const color = String(
		toColor(useCSSVariable('--color-personal-event')) ?? '#30b0c7'
	)
	return (
		<BaseCard
			title="personalEvents"
			onPressRoute="/timetable"
			hasInteractiveContent
			noDataPredicate={() => upcoming.length === 0}
			noDataComponent={
				<View className="gap-3 mt-2.5">
					<Text className="text-text">{t('personalEvents.emptyHint')}</Text>
					<Pressable
						testID="personal-events-card-add"
						accessibilityRole="button"
						onPress={() =>
							router.navigate({
								pathname: '/personal-event-edit',
								params: { origin: 'DashboardCard' }
							})
						}
					>
						<Text className="text-primary font-semibold">
							{t('personalEvents.add')}
						</Text>
					</Pressable>
				</View>
			}
		>
			<View className="gap-3 mt-2.5">
				{upcoming.map((event) => (
					<Pressable
						key={event.id}
						accessibilityRole="button"
						onPress={() =>
							router.navigate({
								pathname: '/personal-event',
								params: {
									id: event.seriesId,
									start: event.startDate.toISOString()
								}
							})
						}
					>
						<EventItem
							title={event.name}
							subtitle={event.location ?? t('personalEvents.badge')}
							startDateTime={event.startDate}
							endDateTime={event.endDate}
							showEndTime
							color={color}
						/>
					</Pressable>
				))}
			</View>
		</BaseCard>
	)
}
