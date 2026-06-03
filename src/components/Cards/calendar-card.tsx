import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { NoSessionError } from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Calendar } from '@/types/data'
import type { Exam } from '@/types/utils'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import EventItem from '../Universal/event-item'
import BaseCard from './base-card'

const CalendarCard = (): React.JSX.Element => {
	type Combined = Calendar | CardExams
	const router = useRouter()
	const time = new Date()
	const { i18n, t } = useTranslation(['navigation', 'common'])
	const [mixedCalendar, setMixedCalendar] = useState<Combined[]>([])
	const isOnboarded = useFlowStore((state) => state.isOnboarded)
	const setExam = useRouteParamsStore((state) => state.setSelectedExam)
	const { userKind = USER_GUEST } = React.use(UserKindContext)

	interface CardExams {
		name: string
		begin: Date
		end?: Date
		isExam?: boolean
		examData?: Exam
	}

	async function loadExams(): Promise<CardExams[]> {
		let exams: CardExams[] = []
		try {
			exams = (await loadExamList()).map((x) => ({
				name: t('navigation:cards.calendar.exam', { name: x.name }),
				begin: new Date(x.date),
				isExam: true,
				examData: x
			}))
		} catch (e) {
			if (e instanceof NoSessionError) {
				if (isOnboarded === true) {
					router.navigate('/login')
				}
			} else if ((e as Error).message === 'Query not possible') {
				// ignore, leaving examList empty
			} else {
				console.error(e as Error)
			}
		}
		return exams
	}

	const { data: exams, isSuccess } = useQuery({
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
		const nowMs = time.getTime()
		// Next relevant moment per event: begin if the event has not started yet, end if it's already ongoing
		const effectiveMs = (item: { begin: Date; end?: Date }) =>
			item.begin.getTime() > nowMs
				? item.begin.getTime()
				: (item.end ?? item.begin).getTime()

		const combined = [
			...calendar.map((item) => ({ ...item, isExam: false })),
			...(exams ?? [])
		]
			.map((item) => ({ ...item, begin: new Date(item.begin) }))
			.filter((x) => x.begin > time || (x.end ?? time) > time)
			.sort((a, b) => {
				// Sort by the next relevant moment
				// For single-day events, this is the date,
				// for multi-day events, this is the start or end date, depending on
				// whether the event is has already started or not.
				const dateComparison = effectiveMs(a) - effectiveMs(b)
				if (dateComparison !== 0) {
					return dateComparison
				}

				// Same effective time: prioritize exams over calendar events
				if (a.isExam && !b.isExam) return -1
				if (!a.isExam && b.isExam) return 1

				return 0
			}) as Combined[]

		// Show the two chronologically next events
		setMixedCalendar(combined.slice(0, 2))
	}, [calendar, exams])

	const { theme, styles } = useStyles(stylesheet)

	const noData = (
		<Text style={styles.noDataText}>{t('common:error.noEvents')}</Text>
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
					<Pressable
						key={index}
						onPress={
							'isExam' in event && 'examData' in event
								? () => {
										if (event.examData) {
											setExam(event.examData)

											router.navigate({
												pathname: '/calendar',
												params: {
													openExam: 'true'
												}
											})
										}
									}
								: 'id' in event
									? () => router.navigate(`/calendar?event=${event.id}`)
									: undefined
						}
					>
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
					</Pressable>
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
