import Color from 'color'
import type React from 'react'
import { Pressable, Text, View } from 'react-native'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/drag-view'
import ColorBand from '@/components/Universal/color-band'
import TimeDisplay from '@/components/Universal/time-display'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDateTime, formatFriendlyTime } from '@/utils/date-utils'
import { hairlineBorder } from '@/utils/uniwind-utils'

interface TimetableLectureEntryProps {
	item: FriendlyTimetableEntry
	primaryColor: string
	onPress: (item: FriendlyTimetableEntry) => void
}

export default function TimetableLectureEntry({
	item,
	primaryColor,
	onPress
}: TimetableLectureEntryProps): React.JSX.Element {
	return (
		<DragDropView
			mode="drag"
			scope="system"
			dragValue={`${item.name} in ${item.rooms.join(
				', '
			)} (${formatFriendlyDateTime(
				item.startDate
			)} - ${formatFriendlyTime(item.endDate)})`}
		>
			<Pressable
				onPress={() => {
					onPress(item)
				}}
				className="mb-2.5 rounded-md overflow-hidden"
				android_ripple={{
					color: Color(primaryColor).alpha(0.1).string()
				}}
			>
				<View
					className="flex-row bg-card rounded-md overflow-hidden min-h-[70px] border-border"
					style={hairlineBorder}
				>
					<ColorBand color={primaryColor} />
					<View className="flex-1 p-3.5 relative">
						<View className="flex-row justify-between items-start mb-2">
							<Text
								className="text-[15.5px] font-semibold text-text flex-1 me-2"
								numberOfLines={1}
							>
								{item.name}
							</Text>
						</View>
						<View className="flex-row justify-between items-center mt-1">
							<View className="flex-row items-center">
								<Text className="text-sm text-label">
									{item.rooms.length > 0 ? item.rooms.join(', ') : ''}
								</Text>
							</View>
							<TimeDisplay
								startTime={formatFriendlyTime(item.startDate)}
								endTime={formatFriendlyTime(item.endDate)}
							/>
						</View>
					</View>
				</View>
			</Pressable>
		</DragDropView>
	)
}
