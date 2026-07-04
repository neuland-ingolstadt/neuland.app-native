import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type { LanguageKey } from '@/localization/i18n'
import {
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	type CampusLifeEvent,
	type CampusLifePublicOrganizerKind
} from '@/types/campus-life'
import { campusLifeEventDetailHref } from '@/utils/campus-life-utils'
import {
	formatFriendlyDateTimeRange,
	formatFriendlyRelativeTime
} from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'
import RelativeTimeLabel from '../Universal/relative-time-label'
import RowEntry from '../Universal/row-entry'

const CLEventRow = ({
	event,
	inSheet = false,
	organizerKind = CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
}: {
	event: CampusLifeEvent
	inSheet?: boolean
	organizerKind?: CampusLifePublicOrganizerKind
}): React.JSX.Element => {
	const cardColor = useCSSVariable('--color-card')
	const cardSheetColor = useCSSVariable('--color-card-sheet')
	const { t, i18n } = useTranslation('common')
	let begin = null
	if (event.startDateTime != null) {
		begin = new Date(event.startDateTime)
	}
	const end = event.endDateTime != null ? new Date(event.endDateTime) : null

	const isActive =
		begin != null && begin < new Date() && end != null && end > new Date()

	const eventHref = campusLifeEventDetailHref(event.id, organizerKind)

	return (
		<RowEntry
			backgroundColor={
				toColor(inSheet ? cardSheetColor : cardColor) as string | undefined
			}
			href={eventHref}
			title={event.titles[i18n.language as LanguageKey] ?? ''}
			leftChildren={
				<View className="mt-0.5">
					<Text
						className="mb-1 text-sm font-medium text-label"
						numberOfLines={2}
					>
						{event.host.name}
					</Text>
					<Text className="text-[13px] text-label" numberOfLines={2}>
						{formatFriendlyDateTimeRange(begin, end)}
					</Text>
				</View>
			}
			rightChildren={
				<View className="p-row">
					<RelativeTimeLabel
						showNowDot={isActive}
						highlighted={isActive}
						label={
							begin != null
								? end != null && begin < new Date()
									? `${t('dates.ends')} ${formatFriendlyRelativeTime(end)}`
									: formatFriendlyRelativeTime(begin)
								: ''
						}
					/>
				</View>
			}
		/>
	)
}

export default CLEventRow
