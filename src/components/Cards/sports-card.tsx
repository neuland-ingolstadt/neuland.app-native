import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type {
	UniversitySportsFieldsFragment,
	WeekdayType
} from '@/__generated__/gql/graphql'
import type { LanguageKey } from '@/localization/i18n'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { loadUniversitySportsEvents, QUERY_KEYS } from '@/utils/events-utils'
import EventItem from '../Universal/event-item'
import BaseCard from './base-card'

const SportsCard = (): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)
	const { t, i18n } = useTranslation('common')
	const { data: sportsByWeekday = [], isSuccess } = useQuery({
		queryKey: [QUERY_KEYS.UNIVERSITY_SPORTS],
		queryFn: loadUniversitySportsEvents,
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24
	})

	const sportsEvents = useMemo<UniversitySportsFieldsFragment[]>(
		() => sportsByWeekday.flatMap((section) => section.data).slice(0, 2),
		[sportsByWeekday]
	)

	const handleSportsItemPress = (id: string) => {
		if (Platform.OS !== 'ios') {
			router.navigate({
				pathname: '/events/sports/[id]',
				params: { id }
			})
			return
		}

		router.navigate({
			pathname: '/sports',
			params: {
				openEvent: 'true',
				id
			}
		})
	}

	const noData = (
		<Text style={styles.noDataTitle}>
			{t('pages.clEvents.sports.noEvents.title')}
		</Text>
	)

	return (
		<BaseCard
			title="sports"
			onPressRoute="/sports"
			noDataComponent={noData}
			noDataPredicate={() => isSuccess && sportsEvents.length === 0}
		>
			{isSuccess && sportsEvents.length > 0 && (
				<View style={styles.eventsContainer}>
					{sportsEvents.map((event) => (
						<Pressable
							key={event.id}
							onPress={() => handleSportsItemPress(event.id)}
						>
							<EventItem
								title={event.title[i18n.language as LanguageKey] ?? ''}
								subtitle={t(
									`dates.weekdays.${
										event.weekday.toLowerCase() as Lowercase<WeekdayType>
									}`
								)}
								timeLabel={formatFriendlyTimeRange(
									event.startTime,
									event.endTime
								)}
								location={event.location}
								color={theme.colors.primary}
							/>
						</Pressable>
					))}
				</View>
			)}
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	eventsContainer: {
		marginTop: 10,
		gap: 12,
		borderColor: theme.colors.border
	},
	noDataTitle: {
		marginTop: 10,
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500'
	}
}))

export default SportsCard
