import type React from 'react'
import { Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { CalendarAnimation } from './CalendarAnimation'

/**
 * An enhanced empty state component for the events screens that displays
 * a polished animation and guidance for the user.
 */
export const EmptyEventsAnimation = ({
	title,
	subtitle
}: {
	title: string
	subtitle: string
}): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	return (
		<Animated.View
			style={styles.container}
			entering={FadeIn.duration(600).delay(300)}
		>
			<View style={styles.contentWrapper}>
				<View style={styles.animationContainer}>
					<CalendarAnimation size={130} />
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.title}>{title}</Text>
					<Text style={styles.subtitle}>{subtitle}</Text>
				</View>
			</View>
		</Animated.View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-start',
		width: '100%',
		paddingHorizontal: 20,
		paddingTop: 100,
		paddingBottom: 10
	},
	contentWrapper: {
		width: '100%',
		maxWidth: 480,
		alignItems: 'center',
		paddingVertical: 8
	},
	animationContainer: {
		marginBottom: 40,
		alignItems: 'center'
	},
	textContainer: {
		alignItems: 'center',
		width: '100%'
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		color: theme.colors.text,
		marginBottom: 12,
		textAlign: 'center'
	},
	subtitle: {
		fontSize: 16,
		color: theme.colors.labelColor,
		textAlign: 'center',
		marginBottom: 24,
		lineHeight: 22,
		maxWidth: '90%'
	}
}))
