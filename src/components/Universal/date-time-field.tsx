import DateTimePicker, {
	DateTimePickerAndroid
} from '@react-native-community/datetimepicker'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text } from 'react-native'
import { useCSSVariable } from 'uniwind'
import dayjs from '@/lib/dayjs'
import { toColor } from '@/utils/uniwind-utils'

interface DateTimeFieldProps {
	mode: 'date' | 'time'
	value: Date
	onChange: (date: Date) => void
	minimumDate?: Date
	maximumDate?: Date
	label: string
	testID?: string
}

export default function DateTimeField({
	mode,
	value,
	onChange,
	minimumDate,
	maximumDate,
	label,
	testID
}: DateTimeFieldProps): React.JSX.Element {
	const { i18n } = useTranslation()
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c1e')
	const backgroundColor = String(
		toColor(useCSSVariable('--color-input-background')) ?? '#e9e9e9'
	)
	const format = mode === 'date' ? 'YYYY-MM-DD' : 'HH:mm'
	if (Platform.OS === 'web')
		return (
			<input
				aria-label={label}
				data-testid={testID}
				type={mode}
				value={dayjs(value).format(format)}
				min={minimumDate ? dayjs(minimumDate).format(format) : undefined}
				max={maximumDate ? dayjs(maximumDate).format(format) : undefined}
				onChange={(event) => {
					const input = event.currentTarget.value
					if (!input) return
					const next =
						mode === 'date'
							? dayjs(`${input}T${dayjs(value).format('HH:mm:ss')}`)
							: dayjs(`${dayjs(value).format('YYYY-MM-DD')}T${input}:00`)
					if (next.isValid()) onChange(next.toDate())
				}}
				style={{
					color: textColor,
					backgroundColor,
					border: 0,
					borderRadius: 17,
					padding: 10,
					minHeight: 44,
					font: 'inherit',
					width: '100%',
					boxSizing: 'border-box',
					colorScheme: 'light dark'
				}}
			/>
		)
	const pickerProps = {
		mode,
		value,
		minimumDate,
		maximumDate,
		is24Hour: true,
		onValueChange: (_event: unknown, date: Date) => onChange(date)
	}
	if (Platform.OS === 'android')
		return (
			<Pressable
				testID={testID}
				accessibilityRole="button"
				accessibilityLabel={label}
				className="bg-input-background rounded-md px-2.5 py-3"
				onPress={() => DateTimePickerAndroid.open(pickerProps)}
			>
				<Text className="text-text text-[17px]">
					{dayjs(value)
						.locale(i18n.language)
						.format(mode === 'date' ? 'DD.MM.YYYY' : 'HH:mm')}
				</Text>
			</Pressable>
		)
	return (
		<DateTimePicker
			{...pickerProps}
			testID={testID}
			accessibilityLabel={label}
			display="compact"
			locale={i18n.language}
			accentColor={primaryColor}
		/>
	)
}
