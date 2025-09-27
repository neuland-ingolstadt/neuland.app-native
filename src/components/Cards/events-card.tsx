import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { LanguageKey } from '@/localization/i18n'
import type { CampusLifeEvent } from '@/types/campus-life'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'
import EventItem from '../Universal/event-item'
import BaseCard from './base-card'

const EventsCard = (): React.JSX.Element => {
	const { theme, styles } = useStyles(stylesheet)
	const { i18n } = useTranslation('navigation')
	const { t } = useTranslation('common')
	const { data: events = [], isSuccess } = useQuery<CampusLifeEvent[]>({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS],
		queryFn: () => loadCampusLifeEvents(),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 24
	})

	const handleEventItemPress = (id: string) => {
		if (Platform.OS !== 'ios') {
			router.navigate({
				pathname: '/events/cl/[id]',
				params: { id }
			})
		} else {
			router.navigate({
				pathname: '/cl-events',
				params: {
					openEvent: 'true',
					id
				}
			})
		}
	}

	const noData = <Text style={styles.noDataTitle}>{t('error.noEvents')}</Text>

	return (
		<BaseCard
			title="events"
			onPressRoute="/cl-events"
			noDataComponent={noData}
			noDataPredicate={() => isSuccess && events.length === 0}
		>
			{isSuccess && events.length > 0 && (
				<View style={styles.eventsContainer}>
					{events.slice(0, 2).map((event) => (
						<Pressable
							key={event.id}
							onPress={() => handleEventItemPress(event.id)}
						>
							<EventItem
								title={event.titles[i18n.language as LanguageKey] ?? ''}
								subtitle={event.host.name ?? ''}
								startDateTime={
									event.startDateTime
										? new Date(event.startDateTime)
										: undefined
								}
								location={event.location ?? undefined}
								subtitleTranslationKey="cards.events.by"
								subtitleTranslationParams={{ name: event.host.name ?? '' }}
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

export default EventsCard
