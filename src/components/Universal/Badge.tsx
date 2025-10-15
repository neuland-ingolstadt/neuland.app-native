import Color from 'color'
import type React from 'react'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface BadgeProps {
	text: string
	type: 'exam' | 'calendar' | 'campuslife' | 'default' | 'allDay'
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
	const { styles, theme } = useStyles(stylesheet)

	// Determine the style based on the type
	const getBadgeStyle = () => {
		switch (type) {
			case 'exam':
				return {
					containerStyle: [
						styles.badge,
						{
							backgroundColor:
								backgroundColor ||
								Color(theme.colors.notification).alpha(0.15).string()
						}
					],
					textStyle: [
						styles.badgeText,
						{ color: textColor || theme.colors.notification }
					]
				}
			case 'calendar':
				return {
					containerStyle: [
						styles.badge,
						{ backgroundColor: backgroundColor || theme.colors.cardButton }
					],
					textStyle: [
						styles.badgeText,
						{ color: textColor || theme.colors.labelColor }
					]
				}
			case 'campuslife':
				return {
					containerStyle: [
						styles.badge,
						{
							backgroundColor:
								backgroundColor ||
								Color(theme.colors.labelTertiaryColor).alpha(0.15).string()
						}
					],
					textStyle: [
						styles.badgeText,
						{ color: textColor || theme.colors.labelTertiaryColor }
					]
				}
			case 'allDay':
				return {
					containerStyle: [
						styles.allDayBadge,
						{ backgroundColor: backgroundColor || theme.colors.cardButton }
					],
					textStyle: [
						styles.allDayBadgeText,
						{ color: textColor || theme.colors.text }
					]
				}
			default:
				return {
					containerStyle: [
						styles.badge,
						{ backgroundColor: backgroundColor || theme.colors.cardButton }
					],
					textStyle: [
						styles.badgeText,
						{ color: textColor || theme.colors.labelColor }
					]
				}
		}
	}

	const { containerStyle, textStyle } = getBadgeStyle()

	return (
		<View style={containerStyle}>
			<Text style={textStyle}>{text}</Text>
		</View>
	)
}

const stylesheet = createStyleSheet(() => ({
	badge: {
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6
	},
	badgeText: {
		fontSize: 12,
		fontWeight: '500'
	},
	allDayBadge: {
		paddingHorizontal: 6,
		paddingVertical: 4,
		borderRadius: 8
	},
	allDayBadgeText: {
		fontSize: 12,
		fontWeight: '500'
	}
}))

export default Badge
