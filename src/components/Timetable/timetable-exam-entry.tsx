import Color from 'color'
import type React from 'react'
import { Pressable, Text, View } from 'react-native'
// @ts-expect-error no types available
import DragDropView from '@/components/Exclusive/drag-view'
import Badge from '@/components/Universal/badge'
import ColorBand from '@/components/Universal/color-band'
import TimeDisplay from '@/components/Universal/time-display'
import type { ExamEntry } from '@/types/utils'
import { formatFriendlyDateTime, formatFriendlyTime } from '@/utils/date-utils'
import { hairlineBorder } from '@/utils/uniwind-utils'

interface TimetableExamEntryProps {
	exam: ExamEntry
	notificationColor: string
	onPress: (exam: ExamEntry) => void
}

export default function TimetableExamEntry({
	exam,
	notificationColor,
	onPress
}: TimetableExamEntryProps): React.JSX.Element {
	return (
		<DragDropView
			mode="drag"
			scope="system"
			dragValue={`${exam.name} in ${exam.rooms} (${formatFriendlyDateTime(exam.date)})`}
		>
			<Pressable
				onPress={() => {
					onPress(exam)
				}}
				className="mb-2.5 rounded-md overflow-hidden"
				android_ripple={{
					color: Color(notificationColor).alpha(0.1).string()
				}}
			>
				<View
					className="flex-row bg-card rounded-md overflow-hidden min-h-[70px] border-border"
					style={hairlineBorder}
				>
					<ColorBand color={notificationColor} />
					<View className="flex-1 p-3.5 relative">
						<View className="flex-row justify-between items-start mb-2">
							<Text
								className="text-[15.5px] font-semibold text-text flex-1 me-2"
								numberOfLines={2}
							>
								{exam.name}
							</Text>
						</View>
						<View className="flex-row justify-between items-center mt-1">
							<View className="flex-row items-center gap-2">
								{(exam.seat ?? exam.rooms) != null && (
									<Text className="text-sm text-label">
										{exam.seat ?? exam.rooms}
									</Text>
								)}
								<Badge text="Exam" type="exam" />
							</View>
							<TimeDisplay
								startTime={formatFriendlyTime(exam.date)}
								endTime={formatFriendlyTime(exam.endDate)}
							/>
						</View>
					</View>
				</View>
			</Pressable>
		</DragDropView>
	)
}
