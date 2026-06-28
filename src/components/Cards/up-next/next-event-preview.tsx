import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'

interface NextEventPreviewProps {
	event: FriendlyTimetableEntry
}

export default function NextEventPreview({
	event
}: NextEventPreviewProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.nextEventContainer}>
			<Text style={styles.nextEventTime}>
				{formatFriendlyTime(event.startDate)}
			</Text>
			<Text style={styles.nextEventName} numberOfLines={1}>
				{'· '}
				{event.name}{' '}
				{event.rooms.length > 0 && (
					<Text style={styles.nextEventRoom}>· {event.rooms.join(', ')}</Text>
				)}
			</Text>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	nextEventContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		marginTop: 2
	},
	nextEventTime: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '600',
		fontVariant: ['tabular-nums']
	},
	nextEventName: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		marginLeft: 4,
		flex: 1
	},
	nextEventRoom: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 14,
		fontWeight: '400'
	}
}))
