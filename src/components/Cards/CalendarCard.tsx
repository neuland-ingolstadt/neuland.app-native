import { NoSessionError } from '@/api/thi-session-handler'
import PlatformIcon from '@/components/Universal/Icon'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useFlowStore } from '@/hooks/useFlowStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Calendar } from '@/types/data'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { formatFriendlyRelativeTime } from '@/utils/date-utils'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import Divider from '../Universal/Divider'
import BaseCard from './BaseCard'

const CalendarCard = (): React.JSX.Element => {
	type Combined = Calendar | CardExams
	const router = useRouter()
	const time = new Date()
	const { i18n, t } = useTranslation('navigation')
	const [mixedCalendar, setMixedCalendar] = useState<Combined[]>([])
	const isOnboarded = useFlowStore((state) => state.isOnboarded)
	const { userKind = USER_GUEST } = React.useContext(UserKindContext)
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

	const { styles, theme } = useStyles(stylesheet)

	return (
		<BaseCard title="calendar" onPressRoute="/calendar">
			<View style={styles.calendarContainer}>
				{mixedCalendar.map((event, index) => (
					<React.Fragment key={index}>
						<View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
							<View style={styles.verticalLine} />
							<View style={{ flex: 1 }}>
								<Text style={styles.eventTitle} numberOfLines={2}>
									{typeof event.name === 'object'
										? event.name[i18n.language as LanguageKey]
										: event.name}
								</Text>
								<Text style={styles.eventSubtitle}>THI Event</Text>
								<View style={styles.eventTimeRow}>
									<PlatformIcon
										ios={{ name: 'clock', size: 11 }}
										android={{ name: 'schedule', size: 16 }}
										web={{ name: 'Clock', size: 16 }}
										style={{ marginRight: 4, color: theme.colors.primary }}
									/>
									<Text style={styles.eventDate}>
										{event.end != null && event.begin < time
											? t('cards.calendar.ends') +
												formatFriendlyRelativeTime(event.end)
											: formatFriendlyRelativeTime(event.begin)}
									</Text>
								</View>
							</View>
						</View>
						{index < mixedCalendar.length - 1 && (
							<Divider color={theme.colors.border} />
						)}
					</React.Fragment>
				))}
			</View>
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	calendarContainer: {
		gap: 10,
		marginTop: 10
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
		alignItems: 'center'
	},
	eventDate: {
		marginStart: 2,
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: '500'
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

export default CalendarCard
