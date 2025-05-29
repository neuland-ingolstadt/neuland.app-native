import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { NoSessionError } from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Calendar } from '@/types/data'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import EventItem from '../Universal/EventItem'
import BaseCard from './BaseCard'

const CalendarCard = (): React.JSX.Element => {
	type Combined = Calendar | CardExams
	const router = useRouter()
	const time = new Date()
	const { i18n, t } = useTranslation('navigation')
	const [mixedCalendar, setMixedCalendar] = useState<Combined[]>([])
	const isOnboarded = useFlowStore((state) => state.isOnboarded)
	const { userKind = USER_GUEST } = React.use(UserKindContext)

	interface CardExams {
		name: string
		begin: Date
		end?: Date
		isExam?: boolean
	}

	async function loadExams(): Promise<CardExams[]> {
		let exams: CardExams[] = []
		try {
			exams = (await loadExamList()).map((x) => ({
				name: t('cards.calendar.exam', { name: x.name }),
				begin: new Date(x.date),
				isExam: true
			}))
		} catch (e) {
			if (e instanceof NoSessionError) {
				if (isOnboarded === true) {
					router.navigate('/login')
				}
			} else if ((e as Error).message === 'Query not possible') {
				// ignore, leaving examList empty
			} else {
				console.log(e as Error)
			}
		}
		return exams
	}

	const { data: exams } = useQuery({
		queryKey: ['cardExams'],
		queryFn: loadExams,
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				router.navigate('/login')
				return false
			}
			return failureCount < 2
		},
		enabled: userKind === USER_STUDENT
	})

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

	return (
		<BaseCard title="calendar" onPressRoute="/calendar">
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

const stylesheet = createStyleSheet(() => ({
	calendarContainer: {
		gap: 12,
		marginTop: 10
	}
}))

export default CalendarCard
