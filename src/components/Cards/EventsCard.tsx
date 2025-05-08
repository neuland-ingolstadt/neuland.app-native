import type { LanguageKey } from '@/localization/i18n'
import { loadCampusLifeEvents } from '@/utils/events-utils'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import Divider from '../Universal/Divider'
import BaseCard from './BaseCard'

const EventsCard = (): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)
	const { t, i18n } = useTranslation('navigation')

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
							<View style={styles.eventItem}>
								<View style={styles.eventContent}>
									<View style={styles.eventHeader}>
										<Text style={styles.eventTitle} numberOfLines={2}>
											{event.titles[i18n.language as LanguageKey]}
										</Text>
										{event.startDateTime && (
											<View style={styles.dateContainer}>
												<Text style={styles.eventDate}>
													{formatFriendlyRelativeTime(
														new Date(event.startDateTime)
													)}
												</Text>
											</View>
										)}
									</View>
									<View style={styles.eventFooter}>
										<Text style={styles.eventDetails} numberOfLines={1}>
											{t('cards.events.by', {
												name: event.host.name
											})}
										</Text>
										{event.location && (
											<Text style={styles.eventLocation} numberOfLines={1}>
												{event.location}
											</Text>
										)}
									</View>
								</View>
							</View>
							{index < data.slice(0, 2).length - 1 && (
								<Divider color={theme.colors.border} />
							)}
						</React.Fragment>
					))}
				</View>
			)}
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	eventsContainer: {
		paddingTop: -4
	},
	eventItem: {
		paddingVertical: 12
	},
	eventContent: {
		gap: 6
	},
	eventHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		gap: 8
	},
	eventTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '600',
		flex: 1
	},
	dateContainer: {
		backgroundColor: `${theme.colors.primary}15`,
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: theme.radius.sm
	},
	eventDate: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: '500'
	},
	eventFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: 8
	},
	eventDetails: {
		color: theme.colors.labelColor,
		fontSize: 14,
		flex: 1
	},
	eventLocation: {
		color: theme.colors.labelColor,
		fontSize: 14
	},
	moreContainer: {
		paddingTop: 4
	},
	moreText: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '500'
	}
}))

export default EventsCard
