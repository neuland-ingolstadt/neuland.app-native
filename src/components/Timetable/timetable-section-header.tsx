import type React from 'react'
import { memo } from 'react'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { formatFriendlyDate, formatISODate } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'

interface TimetableSectionHeaderProps {
	title: Date
	today: Date
}

const TimetableSectionHeader = memo(
	({ title, today }: TimetableSectionHeaderProps): React.JSX.Element => {
		const primaryColor = toColor(useCSSVariable('--color-primary'))
		const textColor = toColor(useCSSVariable('--color-text'))
		const labelColor = toColor(useCSSVariable('--color-label'))
		const backgroundColor = toColor(useCSSVariable('--color-background'))

		const isToday = formatISODate(title) === formatISODate(today)
		const formattedDate = formatFriendlyDate(title, { weekday: 'long' })
		const dateParts = formattedDate.split(', ')

		return (
			<View className="py-1 z-10" style={{ backgroundColor }}>
				<View className="py-1.5 pt-page pb-1 mb-1">
					<View className="flex-row items-center justify-between">
						<View className="flex-col">
							<Text
								className="text-[19px] font-bold mb-0.5"
								style={{ color: isToday ? primaryColor : textColor }}
							>
								{dateParts[0]}
							</Text>
							{dateParts.length > 1 && (
								<Text
									className="text-sm"
									style={{
										color: isToday ? primaryColor : labelColor,
										fontWeight: isToday ? '600' : '400'
									}}
								>
									{dateParts[1]}
								</Text>
							)}
						</View>
						{isToday && (
							<View
								className="rounded-full me-1"
								style={{
									width: 8,
									height: 8,
									backgroundColor: primaryColor
								}}
							/>
						)}
					</View>
				</View>
			</View>
		)
	}
)

export default TimetableSectionHeader
