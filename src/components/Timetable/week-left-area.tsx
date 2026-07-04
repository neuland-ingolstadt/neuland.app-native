import {
	getWeekNumberOfYear,
	parseDateTime,
	useCalendar,
	useTheme,
	useTimezone
} from '@howljs/calendar-kit'
// @ts-expect-error no types since it is an internal dependency
import { DateTime } from 'luxon'
import type React from 'react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { runOnJS, useAnimatedReaction } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

export default function WeekLeftArea(): React.JSX.Element {
	const { visibleDateUnixAnim } = useCalendar()
	const { timeZone } = useTimezone()
	const textColor = toColor(useCSSVariable('--color-text'))
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
			className="mx-2 mt-2 rounded-xs py-0.5 items-center"
			style={[
				{ backgroundColor: theme.weekNumberBackgroundColor },
				theme.weekNumberContainer
			]}
		>
			<Text
				className="text-[11px] text-center"
				style={[theme.weekNumber, { color: textColor }]}
			>
				{`${t('weekNumberPrefix')}${week}`}
			</Text>
			<Text
				className="text-xs text-center leading-[13px] font-medium"
				style={[theme.weekNumber, { color: textColor }]}
			>
				{month}
			</Text>
		</View>
	)
}
