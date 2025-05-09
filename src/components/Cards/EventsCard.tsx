import type { LanguageKey } from '@/localization/i18n'
import { loadCampusLifeEvents } from '@/utils/events-utils'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '@/components/Universal/Icon'
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
							<View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
								<View style={styles.verticalLine} />
								<View style={{ flex: 1 }}>
									<Text style={styles.eventTitle} numberOfLines={2}>
										{event.titles[i18n.language as LanguageKey]}
									</Text>
									<Text style={styles.eventSubtitle} numberOfLines={1}>
										{t('cards.events.by', { name: event.host.name })}
									</Text>
									<View style={styles.eventTimeRow}>
										<View
											style={{ flexDirection: 'row', alignItems: 'center' }}
										>
											<PlatformIcon
												ios={{ name: 'clock', size: 11 }}
												android={{ name: 'schedule', size: 16 }}
												web={{ name: 'Clock', size: 16 }}
												style={{ marginRight: 4, color: theme.colors.primary }}
											/>
											<Text style={styles.eventDate}>
												{event.startDateTime
													? formatFriendlyRelativeTime(
															new Date(event.startDateTime)
														)
													: ''}
											</Text>
										</View>
										{event.location && (
											<View
												style={{ flexDirection: 'row', alignItems: 'center' }}
											>
												<Text style={styles.eventLocation} numberOfLines={1}>
													{event.location}
												</Text>
											</View>
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
		marginTop: 10,
		gap: 10
	},
	eventTitle: {
		color: theme.colors.text,
		fontSize: 15,
		fontWeight: '700'
	},
	eventSubtitle: {
		color: theme.colors.labelColor,
		fontSize: 14,
		marginTop: 2,
		marginBottom: 4
	},
	eventTimeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	eventDate: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: '500',
		marginStart: 2
	},
	eventLocation: {
		color: theme.colors.labelColor,
		fontSize: 13,
		marginTop: 2
	},
	verticalLine: {
		width: 2,
		height: '100%',
		borderRadius: 2,
		backgroundColor: theme.colors.primary,
		opacity: 0.4,
		marginRight: 10,
		marginTop: 1
	}
}))

export default EventsCard
