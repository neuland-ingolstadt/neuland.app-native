import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import EventItem from '@/components/Universal/event-item'
import type { LanguageKey } from '@/localization/i18n'
import type { Sports, WeekdayEnum } from '@/types/university-sports'
import { sportsLocalizedTitle } from '@/types/university-sports'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { loadUniversitySportsEvents, QUERY_KEYS } from '@/utils/events-utils'
import { toColor } from '@/utils/uniwind-utils'
import BaseCard from './base-card'

function handleSportsItemPress(id: number): void {
	const idParam = String(id)
	if (Platform.OS !== 'ios') {
		router.navigate({
			pathname: '/events/sports/[id]',
			params: { id: idParam }
		})
		return
	}

	router.navigate({
		pathname: '/sports',
		params: {
			openEvent: 'true',
			id: idParam
		}
	})
}

const SportsCard = (): React.JSX.Element => {
	const primaryColor = String(toColor(useCSSVariable('--color-primary')) ?? '')
	const { t, i18n } = useTranslation('common')
	const { data: sportsByWeekday = [], isSuccess } = useQuery({
		queryKey: [QUERY_KEYS.UNIVERSITY_SPORTS],
		queryFn: loadUniversitySportsEvents,
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24
	})

	const sportsEvents = useMemo<Sports[]>(
		() => sportsByWeekday.flatMap((section) => section.data).slice(0, 2),
		[sportsByWeekday]
	)

	const noData = (
		<Text className="mt-2.5 text-text text-base font-medium">
			{t('pages.clEvents.sports.noEvents.title')}
		</Text>
	)

	return (
		<BaseCard
			title="sports"
			onPressRoute="/sports"
			hasInteractiveContent
			noDataComponent={noData}
			noDataPredicate={() => isSuccess && sportsEvents.length === 0}
		>
			{isSuccess && sportsEvents.length > 0 && (
				<View className="mt-2.5 gap-3 border-border">
					{sportsEvents.map((event) => (
						<Pressable
							key={event.id}
							onPress={() => handleSportsItemPress(event.id)}
						>
							<EventItem
								title={sportsLocalizedTitle(
									event,
									i18n.language as LanguageKey
								)}
								subtitle={t(
									`dates.weekdays.${
										event.weekday.toLowerCase() as Lowercase<WeekdayEnum>
									}`
								)}
								timeLabel={formatFriendlyTimeRange(
									event.startTime,
									event.endTime
								)}
								location={event.location}
								color={primaryColor}
							/>
						</Pressable>
					))}
				</View>
			)}
		</BaseCard>
	)
}

export default SportsCard
