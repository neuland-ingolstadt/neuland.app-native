import { getContrastColor } from '@/utils/ui-utils'
import type { PackedEvent } from '@howljs/calendar-kit'
import { Text, View } from 'react-native'
import {
	type UnistylesTheme,
	createStyleSheet,
	useStyles
} from 'react-native-unistyles'

const WeekHeaderEvent = ({
	event
}: {
	event: PackedEvent
	theme: UnistylesTheme
}): React.JSX.Element | null => {
	const { styles } = useStyles(stylesheet)

	const eventName = event?.name ?? event?.title ?? ''
	if (!eventName) {
		return null
	}

	return (
		<View
			style={{
				...styles.headerEventContainer
			}}
		>
			<Text
				style={{
					...styles.headerEventTitle
				}}
				numberOfLines={1}
				ellipsizeMode="tail"
			>
				{eventName}
			</Text>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	headerEventContainer: {
		marginHorizontal: -2,
		marginVertical: -1,
		paddingHorizontal: 6,
		flex: 1,
		justifyContent: 'center',
		backgroundColor: theme.colors.calendarItem
	},
	headerEventTitle: {
		fontSize: 12,
		fontWeight: '600',
		color: getContrastColor(theme.colors.calendarItem)
	}
}))

export default WeekHeaderEvent
