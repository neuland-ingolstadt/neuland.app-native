import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime, formatNearDate } from '@/utils/date-utils'
import type { EventStatus } from '@/utils/up-next-utils'

interface EventStatusTextProps {
	event: FriendlyTimetableEntry
	status: EventStatus
}

export default function EventStatusText({
	event,
	status
}: EventStatusTextProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['navigation', 'timetable'])

	let statusText = ''

	if (status.isOngoing) {
		statusText = status.isEndingSoon
			? t('cards.timetable.endingSoon', { count: status.timeRemaining })
			: t('cards.timetable.ongoing', {
					time: formatFriendlyTime(event.endDate)
				})
	} else if (status.isSoon) {
		statusText = t('cards.timetable.startingSoon', {
			count: status.timeRemaining
		})
	} else {
		statusText = formatNearDate(event.startDate) ?? ''
	}

	return <Text style={styles.eventDate}>{statusText}</Text>
}

const stylesheet = createStyleSheet((theme) => ({
	eventDate: {
		color: theme.colors.secondary,
		fontSize: 14,
		fontWeight: '500'
	}
}))
