import { type RelativePathString, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Calendar } from '@/types/data'
import type { Exam } from '@/types/utils'
import {
	formatFriendlyDate,
	formatFriendlyDateRange,
	formatFriendlyDateTime,
	formatFriendlyDateTimeRange,
	formatFriendlyRelativeTime
} from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'

import RelativeTimeLabel from '../Universal/relative-time-label'
import RowEntry from '../Universal/row-entry'

const CalendarRow = ({ event }: { event: Calendar }): React.JSX.Element => {
	const { t, i18n } = useTranslation('common')
	const cardColor = useCSSVariable('--color-card')
	const primaryBackgroundColor = useCSSVariable('--color-primary-background')
	const { event: selectedEventId } = useLocalSearchParams<{
		event: string
	}>()

	const isActive =
		event.begin < new Date() && event.end != null && event.end > new Date()

	const isSelected = selectedEventId === event.id

	return (
		<RowEntry
			title={event.name[i18n.language as LanguageKey]}
			leftChildren={
				<View className="mt-0.5">
					<Text
						className={`text-sm text-label ${isSelected ? 'font-medium text-primary' : ''}`}
						numberOfLines={2}
					>
						{event.hasHours === true
							? formatFriendlyDateTimeRange(event.begin, event.end ?? null)
							: formatFriendlyDateRange(event.begin, event.end)}
					</Text>
				</View>
			}
			rightChildren={
				<RelativeTimeLabel
					showNowDot={isActive}
					highlighted={isActive || isSelected}
					numberOfLines={2}
					label={
						event.begin != null
							? event.end != null && event.begin < new Date()
								? `${t('dates.ends')} ${formatFriendlyRelativeTime(event.end)}`
								: formatFriendlyRelativeTime(event.begin)
							: ''
					}
				/>
			}
			backgroundColor={
				toColor(isSelected ? primaryBackgroundColor : cardColor) as
					| string
					| undefined
			}
		/>
	)
}

const ExamRow = ({ event }: { event: Exam }): React.JSX.Element => {
	const setExam = useRouteParamsStore((state) => state.setSelectedExam)
	const { t } = useTranslation('common')

	const navigateToPage = (): void => {
		setExam(event)
	}

	const showDetails =
		formatFriendlyDateTime(event.date) != null ||
		event.rooms !== '' ||
		event.seat != null

	const examDate = new Date(event.date)
	const now = new Date()
	const isToday =
		examDate.getDate() === now.getDate() &&
		examDate.getMonth() === now.getMonth() &&
		examDate.getFullYear() === now.getFullYear()

	return (
		<RowEntry
			title={event.name}
			leftChildren={
				<View className="mt-0.5 w-full">
					{showDetails ? (
						<>
							<Text className="text-sm font-medium text-text" numberOfLines={2}>
								{formatFriendlyDateTime(event.date)}
							</Text>
							<View className="mt-1 flex-col gap-0.5">
								<Text className="text-[13px] text-label" numberOfLines={1}>
									{`${t('pages.exam.details.room')}: ${event.rooms ?? 'n/a'}`}
								</Text>
								<Text className="text-[13px] text-label" numberOfLines={1}>
									{`${t('pages.exam.details.seat')}: ${event.seat ?? 'n/a'}`}
								</Text>
							</View>
						</>
					) : (
						<Text className="text-sm font-medium text-text" numberOfLines={2}>
							{`${t('pages.exam.about.registration')}: ${formatFriendlyDate(event.enrollment)}`}
						</Text>
					)}
				</View>
			}
			rightChildren={
				<RelativeTimeLabel
					showNowDot={isToday}
					highlighted={isToday}
					numberOfLines={1}
					label={formatFriendlyRelativeTime(new Date(event.date))}
				/>
			}
			onPress={navigateToPage}
			href={'/exam' as RelativePathString}
		/>
	)
}

export { CalendarRow, ExamRow }
