import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
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

	return (
		<Text className="text-secondary text-sm font-medium">{statusText}</Text>
	)
}
