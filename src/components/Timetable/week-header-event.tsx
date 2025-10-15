import type { PackedEvent } from '@howljs/calendar-kit'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { getContrastColor } from '@/utils/ui-utils'

const WeekHeaderEvent = ({
	event
}: {
	event: PackedEvent
}): React.JSX.Element | null => {
	const { styles, theme } = useStyles(stylesheet)

	const eventName = event?.name ?? event?.title ?? ''
	if (!eventName) {
		return null
	}

	const backgroundColor =
		event.eventType === 'exam'
			? theme.colors.notification
			: event.eventType === 'calendar'
				? theme.colors.calendarItem
				: event.eventType === 'campus-life'
					? theme.colors.campusLife
					: theme.colors.primary

	return (
		<View style={[styles.headerEventContainer, { backgroundColor }]}>
			<Text
				style={[
					styles.headerEventTitle,
					{ color: getContrastColor(backgroundColor) }
				]}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{eventName}
			</Text>
		</View>
	)
}

const stylesheet = createStyleSheet(() => ({
	headerEventContainer: {
		marginHorizontal: -2,
		marginVertical: -1,
		paddingHorizontal: 6,
		flex: 1,
		justifyContent: 'center'
	},
	headerEventTitle: {
		fontSize: 12,
		fontWeight: '600'
	}
}))

export default WeekHeaderEvent
