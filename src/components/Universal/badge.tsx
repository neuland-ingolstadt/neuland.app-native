import Color from 'color'
import type React from 'react'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

interface BadgeProps {
	text: string
	type: 'exam' | 'calendar' | 'default' | 'allDay'
	backgroundColor?: string
	textColor?: string
}

/**
 * Badge component that displays text within a styled container
 * Used for exam indicators, calendar badges, and other labels
 */
const Badge = ({
	text,
	type = 'default',
	backgroundColor,
	textColor
}: BadgeProps): React.JSX.Element => {
	const notificationColor = useCSSVariable('--color-notification')
	const cardButtonColor = useCSSVariable('--color-card-button')
	const labelColor = useCSSVariable('--color-label')
	const textColorToken = useCSSVariable('--color-text')

	const getBadgeStyle = () => {
		switch (type) {
			case 'exam':
				return {
					containerClassName: 'px-1.5 py-0.5 rounded-base',
					containerStyle: {
						backgroundColor:
							backgroundColor ||
							Color(toColor(notificationColor) ?? '')
								.alpha(0.15)
								.string()
					},
					textStyle: {
						color: textColor || toColor(notificationColor)
					},
					textClassName: 'text-xs font-medium'
				}
			case 'calendar':
				return {
					containerClassName: 'px-1.5 py-0.5 rounded-base',
					containerStyle: {
						backgroundColor: backgroundColor || toColor(cardButtonColor)
					},
					textStyle: {
						color: textColor || toColor(labelColor)
					},
					textClassName: 'text-xs font-medium'
				}
			case 'allDay':
				return {
					containerClassName: 'px-1.5 py-1 rounded-sm',
					containerStyle: {
						backgroundColor: backgroundColor || toColor(cardButtonColor)
					},
					textStyle: {
						color: textColor || toColor(textColorToken)
					},
					textClassName: 'text-xs font-medium'
				}
			default:
				return {
					containerClassName: 'px-1.5 py-0.5 rounded-base',
					containerStyle: {
						backgroundColor: backgroundColor || toColor(cardButtonColor)
					},
					textStyle: {
						color: textColor || toColor(labelColor)
					},
					textClassName: 'text-xs font-medium'
				}
		}
	}

	const { containerClassName, containerStyle, textClassName, textStyle } =
		getBadgeStyle()

	return (
		<View className={containerClassName} style={containerStyle}>
			<Text className={textClassName} style={textStyle}>
				{text}
			</Text>
		</View>
	)
}

export default Badge
