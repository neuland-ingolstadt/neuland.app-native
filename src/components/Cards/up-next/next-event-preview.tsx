import { Text, View } from 'react-native'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyTime } from '@/utils/date-utils'

interface NextEventPreviewProps {
	event: FriendlyTimetableEntry
}

export default function NextEventPreview({
	event
}: NextEventPreviewProps): React.JSX.Element {
	return (
		<View className="flex-row items-center flex-wrap mt-0.5">
			<Text className="text-label text-sm font-semibold tabular-nums">
				{formatFriendlyTime(event.startDate)}
			</Text>
			<Text
				className="text-label-secondary text-sm ml-1 flex-1"
				numberOfLines={1}
			>
				{'· '}
				{event.name}{' '}
				{event.rooms.length > 0 && (
					<Text className="text-label-secondary text-sm font-normal">
						· {event.rooms.join(', ')}
					</Text>
				)}
			</Text>
		</View>
	)
}
