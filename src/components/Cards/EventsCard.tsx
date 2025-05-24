import type { LanguageKey } from '@/localization/i18n'
import { QUERY_KEYS, loadCampusLifeEvents } from '@/utils/events-utils'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import EventItem from '../Universal/EventItem'
import BaseCard from './BaseCard'
import { router } from 'expo-router'

const EventsCard = (): React.JSX.Element => {
	const { theme, styles } = useStyles(stylesheet)
	const { i18n } = useTranslation('navigation')
	const { data, isSuccess } = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS],
		queryFn: loadCampusLifeEvents,
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

	return (
		<BaseCard title="events" onPressRoute="/cl-events">
			{Boolean(isSuccess) && data !== undefined && (
				<View style={styles.eventsContainer}>
					{data.slice(0, 2).map((event, index) => (
						<React.Fragment key={index}>
							<Pressable onPress={() => handleEventItemPress(event.id)}>
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
						</React.Fragment>
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
	}
}))

export default EventsCard
