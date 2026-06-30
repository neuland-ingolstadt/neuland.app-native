import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useEffect } from 'react'
import { Platform, Text, View } from 'react-native'
import { Toggle, useBinding } from 'swiftui-react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

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
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const isOn = useBinding(selectedItem)

	useEffect(() => {
		isOn.setValue(selectedItem)
	}, [selectedItem])

	const handleToggleChange = (value?: boolean) => {
		if (!disabled) {
			if (Platform.OS === 'ios') void selectionAsync()
			action(value ?? !selectedItem)
		}
	}

	return (
		<View className="h-[52px]">
			<View
				className="bg-card rounded-ios p-4 mr-0.5 flex-row items-center justify-between h-full"
				style={disabled ? { opacity: 0.5 } : undefined}
			>
				<Text
					className="text-text text-base flex-1 mr-2"
					style={disabled ? { color: labelColor } : undefined}
				>
					{title}
				</Text>
				<Toggle
					isOn={isOn}
					onChange={handleToggleChange}
					style={disabled ? { opacity: 0.5 } : undefined}
				/>
			</View>
		</View>
	)
}

export default SingleSectionPicker
