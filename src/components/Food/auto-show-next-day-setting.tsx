import DateTimePicker, {
	type DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import type React from 'react'
import { useState } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import SingleSectionPicker from '@/components/Universal/single-section-picker'

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
 * @param {string} title: The title
 * @param {string} timeLabel: The label for the time picker
 * @param {boolean} enabled: Whether the setting is enabled or not
 * @param {(state: boolean) => void} onToggle: Function to toggle the setting
 * @param {number} timeMinutes: The time in minutes after midnight when the next day's menu should be shown
 * @param {(minutes: number) => void} onTimeMinutesChange: Function to change the time in minutes
 * @returns {JSX.Element} - The AutoShowNextDaySetting component.
 */
export default function AutoShowNextDaySetting({
	title,
	timeLabel,
	enabled,
	onToggle,
	timeMinutes,
	onTimeMinutesChange
}: AutoShowNextDaySettingProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const [showAndroidTimePicker, setShowAndroidTimePicker] = useState(false)

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

	return (
		<View>
			<SingleSectionPicker
				title={title}
				selectedItem={enabled}
				action={onToggle}
			/>
			{enabled && (
				<View style={styles.timePickerContainer}>
					{Platform.OS === 'web' ? (
						<View style={styles.timePickerButton}>
							<Text style={styles.timePickerLabel}>{timeLabel}</Text>
							<input
								type={'time'}
								value={minutesToTimeString(timeMinutes)}
								onChange={(event) => {
									handleWebTimeChange(event.currentTarget.value)
								}}
								style={styles.webTimeInput as unknown as React.CSSProperties}
							/>
						</View>
					) : Platform.OS === 'ios' ? (
						<View style={styles.timePickerButton}>
							<Text style={styles.timePickerLabel}>{timeLabel}</Text>
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
								onPress={() => {
									setShowAndroidTimePicker(true)
								}}
								style={styles.timePickerButton}
							>
								<Text style={styles.timePickerLabel}>{timeLabel}</Text>
								<Text style={styles.timePickerValue}>
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

const stylesheet = createStyleSheet((theme) => ({
	timePickerButton: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 4
	},
	timePickerContainer: {
		borderTopColor: theme.colors.border,
		borderTopWidth: 1,
		paddingHorizontal: 16,
		paddingVertical: 8
	},
	timePickerLabel: {
		color: theme.colors.text,
		fontSize: 16
	},
	timePickerValue: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: '600'
	},
	webTimeInput: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: 999,
		borderWidth: 1,
		color: theme.colors.text,
		fontSize: 16,
		height: 36,
		minWidth: 88,
		paddingHorizontal: 14,
		textAlign: 'center'
	}
}))
