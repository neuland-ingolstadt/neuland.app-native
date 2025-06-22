import {
	getWeekNumberOfYear,
	parseDateTime,
	useCalendar,
	useTheme,
	useTimezone
} from '@howljs/calendar-kit'
import { DateTime } from 'luxon'
import type React from 'react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function WeekLeftArea(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { visibleDateUnixAnim } = useCalendar()
	const { timeZone } = useTimezone()
	const theme = useTheme((state) => ({
		weekNumberBackgroundColor: state.colors.surface,
		weekNumber: state.weekNumber,
		weekNumberContainer: state.weekNumberContainer
	}))
	const { t } = useTranslation('timetable')
	const [week, setWeek] = useState<string | number>('')
	const [month, setMonth] = useState('')

	const updateValues = useCallback(
		(unix: number) => {
			const date = parseDateTime(unix).setZone(timeZone)
			setWeek(getWeekNumberOfYear(unix, timeZone))
			setMonth(date.setLocale(DateTime.local().locale).toFormat('MMM'))
		},
		[timeZone]
	)

	useAnimatedReaction(
		() => visibleDateUnixAnim.value,
		(value, prev) => {
			if (value !== prev) {
				runOnJS(updateValues)(value)
			}
		},
		[]
	)

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: theme.weekNumberBackgroundColor },
				theme.weekNumberContainer
			]}
		>
			<Text style={[styles.weekText, theme.weekNumber]}>
				{`${t('weekNumberPrefix')}${week}`}
			</Text>
			<Text style={[styles.monthText, theme.weekNumber]}>{month}</Text>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		backgroundColor: '#DADADA',
		marginHorizontal: 8,
		borderRadius: 4,
		marginTop: 8,
		paddingVertical: 2,
		alignItems: 'center'
	},
	weekText: {
		fontSize: 12,
		textAlign: 'center',
		color: theme.colors.text
	},
	monthText: {
		fontSize: 10,
		textAlign: 'center',
		lineHeight: 12,
		color: theme.colors.text
	}
}))
