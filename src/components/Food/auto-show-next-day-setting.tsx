import DateTimePicker, {
	type DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import type React from 'react'
import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import SingleSectionPicker from '@/components/Universal/single-section-picker'
import { toColor } from '@/utils/uniwind-utils'

interface AutoShowNextDaySettingProps {
	title: string
	timeLabel: string
	enabled: boolean
	onToggle: (state: boolean) => void
	timeMinutes: number
	onTimeMinutesChange: (minutes: number) => void
}

function minutesToTimeString(minutes: number): string {
	const normalized = Math.max(0, Math.min(23 * 60 + 59, minutes))
	const hour = Math.floor(normalized / 60)
	const minute = normalized % 60
	return `${hour.toString().padStart(2, '0')}:${minute
		.toString()
		.padStart(2, '0')}`
}

function parseTimeString(value: string): number | undefined {
	const matches = value.trim().match(/^(\d{1,2}):(\d{2})$/)
	if (matches == null) return undefined
	const hour = Number.parseInt(matches[1], 10)
	const minute = Number.parseInt(matches[2], 10)
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined
	return hour * 60 + minute
}

/**
 * A component that allows users to enable or disable the automatic display of the next day's menu
 */
export default function AutoShowNextDaySetting({
	title,
	timeLabel,
	enabled,
	onToggle,
	timeMinutes,
	onTimeMinutesChange
}: AutoShowNextDaySettingProps): React.JSX.Element {
	const [showAndroidTimePicker, setShowAndroidTimePicker] = useState(false)
	const textColor = useCSSVariable('--color-text') as string | undefined
	const primaryColor = useCSSVariable('--color-primary') as string | undefined
	const cardColor = useCSSVariable('--color-card') as string | undefined
	const borderColor = useCSSVariable('--color-border') as string | undefined

	const time = new Date()
	time.setHours(Math.floor(timeMinutes / 60), timeMinutes % 60, 0, 0)

	const handleSetTime = (event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === 'android') {
			setShowAndroidTimePicker(false)
			if (event.type !== 'set') return
		}

		if (selectedDate == null) return

		onTimeMinutesChange(
			selectedDate.getHours() * 60 + selectedDate.getMinutes()
		)
	}

	const handleWebTimeChange = (value: string) => {
		const parsedMinutes = parseTimeString(value)
		if (parsedMinutes != null) {
			onTimeMinutesChange(parsedMinutes)
		}
	}

	const webTimeInputStyle = {
		backgroundColor: toColor(cardColor),
		borderColor: toColor(borderColor),
		borderRadius: 999,
		borderWidth: 1,
		color: toColor(textColor),
		fontSize: 16,
		height: 36,
		minWidth: 88,
		paddingHorizontal: 14,
		textAlign: 'center' as const
	}

	return (
		<View>
			<SingleSectionPicker
				title={title}
				selectedItem={enabled}
				action={onToggle}
			/>
			{enabled && (
				<View className="border-t border-border px-4 py-2">
					{Platform.OS === 'web' ? (
						<View className="items-center flex-row justify-between py-1">
							<Text className="text-text text-base">{timeLabel}</Text>
							<input
								type={'time'}
								value={minutesToTimeString(timeMinutes)}
								onChange={(event) => {
									handleWebTimeChange(event.currentTarget.value)
								}}
								style={webTimeInputStyle as unknown as React.CSSProperties}
							/>
						</View>
					) : Platform.OS === 'ios' ? (
						<View className="items-center flex-row justify-between py-1">
							<Text className="text-text text-base">{timeLabel}</Text>
							<DateTimePicker
								mode={'time'}
								display={'compact'}
								value={time}
								onChange={handleSetTime}
							/>
						</View>
					) : (
						<>
							<Pressable
								className="items-center flex-row justify-between py-1"
								onPress={() => {
									setShowAndroidTimePicker(true)
								}}
							>
								<Text className="text-text text-base">{timeLabel}</Text>
								<Text
									className="text-primary text-base font-semibold"
									style={{ color: toColor(primaryColor) }}
								>
									{time.toLocaleTimeString(undefined, {
										hour: '2-digit',
										minute: '2-digit'
									})}
								</Text>
							</Pressable>
							{showAndroidTimePicker && (
								<DateTimePicker
									mode={'time'}
									value={time}
									onChange={handleSetTime}
								/>
							)}
						</>
					)}
				</View>
			)}
		</View>
	)
}
