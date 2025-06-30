import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { transformExamsForCalendar, useExamData } from '@/hooks/useExamData'
import type { LanguageKey } from '@/localization/i18n'
import type { Calendar } from '@/types/data'
import { calendar } from '@/utils/calendar-utils'
import EventItem from '../Universal/EventItem'
import BaseCard from './BaseCard'

const CalendarCard = (): React.JSX.Element => {
	type Combined = Calendar | CardExams
	const time = new Date()
	const { i18n, t } = useTranslation(['navigation', 'common'])
	const [mixedCalendar, setMixedCalendar] = useState<Combined[]>([])
	const { userKind = USER_GUEST } = React.use(UserKindContext)

	interface CardExams {
		name: string
		begin: Date
		end?: Date
		isExam?: boolean
	}

	const { data: examData, isSuccess } = useExamData()

	// Transform exam data for calendar card display
	const exams = React.useMemo(() => {
		if (!examData || !isSuccess) return []
		return transformExamsForCalendar(examData, t)
	}, [examData, isSuccess, t])

	useEffect(() => {
		const combined = [
			...calendar.map((item) => ({ ...item, isExam: false })),
			...(exams ?? [])
		]
			.map((item) => ({ ...item, begin: new Date(item.begin) }))
			.filter((x) => x.begin > time || (x.end ?? time) > time)
			.sort((a, b) => {
				const dateComparison = a.begin.getTime() - b.begin.getTime()
				if (dateComparison === 0) {
					const aIsSingleDay = !a.end
					const bIsSingleDay = !b.end
					return aIsSingleDay ? -1 : bIsSingleDay ? 1 : 0
				}
				return dateComparison
			}) as Combined[]

		setMixedCalendar(combined.slice(0, 2))
	}, [calendar, exams])

	const { theme, styles } = useStyles(stylesheet)

	const noData = (
		<Text style={styles.noDataText}>{t('common:error.noData.title')}</Text>
	)

	return (
		<BaseCard
			title="calendar"
			onPressRoute="/calendar"
			noDataComponent={noData}
			noDataPredicate={() =>
				(userKind === USER_STUDENT ? isSuccess : true) &&
				mixedCalendar.length === 0
			}
		>
			<View style={styles.calendarContainer}>
				{mixedCalendar.map((event, index) => (
					<React.Fragment key={index}>
						<EventItem
							title={
								typeof event.name === 'object'
									? event.name[i18n.language as LanguageKey]
									: event.name
							}
							subtitle="THI Event"
							startDateTime={event.begin}
							endDateTime={event.end}
							showEndTime={true}
							color={theme.colors.primary}
						/>
					</React.Fragment>
				))}
			</View>
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	calendarContainer: {
		gap: 12,
		marginTop: 10
	},
	noDataText: {
		color: theme.colors.text,
		textAlign: 'center',
		marginTop: 10
	}
}))

export default CalendarCard
