import { Host, Switch } from '@expo/ui'
import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { Platform, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

interface SectionPickerProps {
	testID?: string
	title: string
	selectedItem: boolean
	action: (state: boolean) => void
	disabled?: boolean
}

const SingleSectionPicker = ({
	testID,
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

	const handleToggleChange = (value: boolean) => {
		if (!disabled) {
			if (Platform.OS === 'ios') void selectionAsync()
			action(value)
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
				<View
					accessible={true}
					accessibilityLabel={title}
					accessibilityRole="switch"
					accessibilityState={{ checked: selectedItem, disabled }}
					onAccessibilityTap={() => {
						handleToggleChange(!selectedItem)
					}}
				>
					<Host matchContents seedColor={primaryColor}>
						<Switch
							testID={testID}
							value={selectedItem}
							onValueChange={handleToggleChange}
							disabled={disabled}
						/>
					</Host>
				</View>
			</View>
		</View>
	)
}

export default SingleSectionPicker
