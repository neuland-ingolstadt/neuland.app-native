import type { LanguageKey } from '@/localization/i18n'
import { loadCampusLifeEvents } from '@/utils/events-utils'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import EventItem from '../Universal/EventItem'
import BaseCard, { cardColors } from './BaseCard'

const EventsCard = (): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const { i18n } = useTranslation('navigation')
	const cardColor = cardColors.events

	const { data, isSuccess } = useQuery({
		queryKey: ['campusLifeEventsV2'],
		queryFn: loadCampusLifeEvents,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	})

	return (
		<BaseCard title="events" onPressRoute="/cl-events">
			{Boolean(isSuccess) && data !== undefined && (
				<View style={styles.eventsContainer}>
					{data.slice(0, 2).map((event, index) => (
						<React.Fragment key={index}>
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
								color={cardColor}
							/>
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
