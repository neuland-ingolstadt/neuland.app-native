import PlatformIcon from '@/components/Universal/Icon'
import VerticalLine from '@/components/Universal/VerticalLine'
import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface EventItemProps {
	title: string
	subtitle?: string
	startDateTime?: Date
	endDateTime?: Date
	location?: string
	showEndTime?: boolean
	subtitleTranslationKey?: string
	subtitleTranslationParams?: Record<string, string>
}

const EventItem = ({
	title,
	subtitle,
	startDateTime,
	endDateTime,
	location,
	showEndTime = false,
	subtitleTranslationKey,
	subtitleTranslationParams
}: EventItemProps): React.JSX.Element => {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation('navigation')

	return (
		<View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
			<VerticalLine />
			<View style={{ flex: 1 }}>
				<Text style={styles.eventTitle} numberOfLines={2}>
					{title}
				</Text>
				{subtitle && (
					<Text style={styles.eventSubtitle} numberOfLines={1}>
						{subtitleTranslationKey && subtitleTranslationParams
							? (t as (key: string, params?: Record<string, string>) => string)(
									subtitleTranslationKey,
									subtitleTranslationParams
								)
							: subtitle}
					</Text>
				)}
				<View style={styles.eventTimeRow}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<PlatformIcon
							ios={{ name: 'clock', size: 11 }}
							android={{
								name: 'schedule',
								size: 12,
								variant: 'outlined'
							}}
							web={{ name: 'Clock', size: 13 }}
							style={{ marginRight: 4, color: theme.colors.primary }}
						/>
						<Text style={styles.eventDate}>
							{showEndTime &&
							endDateTime &&
							startDateTime &&
							startDateTime < new Date()
								? t('cards.calendar.ends') +
									formatFriendlyRelativeTime(endDateTime)
								: startDateTime
									? formatFriendlyRelativeTime(startDateTime)
									: ''}
						</Text>
					</View>
					{location && (
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Text style={styles.eventLocation} numberOfLines={1}>
								{location}
							</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
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
	}
}))

export default EventItem
