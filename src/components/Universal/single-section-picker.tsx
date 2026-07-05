import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from './icon'

interface SectionPickerProps {
	title: string
	selectedItem: boolean
	action: (state: boolean) => void
	disabled?: boolean
}

const SingleSectionPicker = ({
	title,
	selectedItem,
	action,
	disabled = false
}: SectionPickerProps): React.JSX.Element => {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)

	return (
		<View className="h-[52px]">
			<Pressable
				onPress={() => {
					if (!disabled) {
						if (Platform.OS === 'ios') void selectionAsync()
						action(!selectedItem)
					}
				}}
				className="bg-card ios:rounded-ios android:rounded-md web:rounded-md p-4 flex-row items-center justify-between h-full"
				style={({ pressed }) => [
					disabled && { opacity: 0.5 },
					pressed && !disabled && { opacity: 0.8 }
				]}
				disabled={disabled}
			>
				<Text
					className="text-text text-base flex-1 mr-2"
					style={disabled ? { color: labelColor } : undefined}
				>
					{title}
				</Text>
				{selectedItem && (
					<PlatformIcon
						ios={{ name: 'checkmark.circle.fill', size: 18 }}
						android={{ name: 'check_circle', size: 21 }}
						web={{ name: 'Check', size: 18 }}
						style={{ color: disabled ? labelColor : primaryColor }}
					/>
				)}
			</Pressable>
		</View>
	)
}

export default SingleSectionPicker
