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
import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import RowEntry from '../Universal/RowEntry'

const CalendarRow = ({ event }: { event: Calendar }): React.JSX.Element => {
	const { t, i18n } = useTranslation('common')
	const { styles } = useStyles(stylesheet)

	// Determine if event is active (ongoing)
	const isActive =
		event.begin < new Date() && event.end != null && event.end > new Date()

	return (
		<RowEntry
			title={event.name[i18n.language as LanguageKey]}
			leftChildren={
				<View style={styles.leftContainer}>
					<Text style={styles.leftText} numberOfLines={2}>
						{event.hasHours === true
							? formatFriendlyDateTimeRange(event.begin, event.end ?? null)
							: formatFriendlyDateRange(event.begin, event.end)}
					</Text>
				</View>
			}
			rightChildren={
				<View style={styles.rightContainer}>
					{isActive && <View style={styles.statusIndicator} />}
					<Text
						style={[styles.rightText, isActive && styles.highlightText]}
						numberOfLines={2}
					>
						{event.begin != null &&
							(event.end != null && event.begin < new Date()
								? `${t('dates.ends')} ${formatFriendlyRelativeTime(event.end)}`
								: formatFriendlyRelativeTime(event.begin))}
					</Text>
				</View>
			}
		/>
	)
}

const ExamRow = ({ event }: { event: Exam }): React.JSX.Element => {
	const setExam = useRouteParamsStore((state) => state.setSelectedExam)
	const { styles } = useStyles(stylesheet)

	const navigateToPage = (): void => {
		setExam(event)
		router.navigate('/exam')
	}

	const { t } = useTranslation('common')
	const showDetails =
		formatFriendlyDateTime(event.date) != null ||
		event.rooms !== '' ||
		event.seat != null

	// Calculate if the exam is today
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
				<View style={styles.examDetailsContainer}>
					{showDetails ? (
						<>
							<Text style={styles.mainText1} numberOfLines={2}>
								{formatFriendlyDateTime(event.date)}
							</Text>
							<View style={styles.examInfoCol}>
								<Text style={styles.mainText2} numberOfLines={1}>
									{`${t('pages.exam.details.room')}: ${event.rooms ?? 'n/a'}`}
								</Text>
								<Text style={styles.mainText2} numberOfLines={1}>
									{`${t('pages.exam.details.seat')}: ${event.seat ?? 'n/a'}`}
								</Text>
							</View>
						</>
					) : (
						<Text style={styles.mainText1} numberOfLines={2}>
							{`${t('pages.exam.about.registration')}: ${formatFriendlyDate(event.enrollment)}`}
						</Text>
					)}
				</View>
			}
			rightChildren={
				<View style={styles.rightContainer}>
					{isToday && <View style={styles.statusIndicator} />}
					<Text
						style={[styles.rightText, isToday && styles.highlightText]}
						numberOfLines={1}
					>
						{formatFriendlyRelativeTime(new Date(event.date))}
					</Text>
				</View>
			}
			onPress={navigateToPage}
		/>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	leftText: {
		color: theme.colors.labelColor,
		fontSize: 14
	},
	leftContainer: {
		marginTop: 2
	},
	mainText1: {
		color: theme.colors.text,
		fontSize: 14,
		fontWeight: '500'
	},
	mainText2: {
		color: theme.colors.labelColor,
		fontSize: 13
	},
	examInfoCol: {
		flexDirection: 'column',
		gap: 2,
		marginTop: 4
	},
	examDetailsContainer: {
		marginTop: 2,
		width: '100%'
	},
	rightContainer: {
		justifyContent: 'flex-end',
		alignItems: 'center',
		flexDirection: 'row',
		gap: 6
	},
	rightText: {
		color: theme.colors.labelColor,
		textAlign: 'right',
		fontSize: 14,
		fontWeight: '400'
	},
	highlightText: {
		color: theme.colors.primary,
		fontWeight: '500'
	},
	statusIndicator: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: theme.colors.primary,
		marginTop: 2
	}
}))

export { CalendarRow, ExamRow }
