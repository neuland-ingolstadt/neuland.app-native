import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { Platform, Pressable, Text } from 'react-native'
import { useCSSVariable } from 'uniwind'
import Divider from '@/components/Universal/divider'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from './icon'

interface Element {
	title: string
	key: string
	disabled?: boolean
}

interface SectionPickerProps {
	elements: Element[]
	selectedItems: string[]
	action: (item: string) => void
}

const MultiSectionPicker = ({
	elements,
	selectedItems,
	action
}: SectionPickerProps): React.JSX.Element => {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const labelColor = String(
		toColor(useCSSVariable('--color-label')) ?? '#606062'
	)
	const selectedItemKeys = new Set(selectedItems)

	return (
		<>
			{elements.map((item, index) => (
				<React.Fragment key={index}>
					<Pressable
						testID={`multi-option-${item.key}`}
						accessibilityRole="checkbox"
						accessibilityState={{
							checked: selectedItemKeys.has(item.key),
							disabled: item.disabled
						}}
						onPress={() => {
							if (!item.disabled) {
								if (Platform.OS === 'ios') void selectionAsync()
								action(item.key)
							}
						}}
						className="bg-card ios:rounded-ios android:rounded-md web:rounded-md min-h-[52px] px-4 py-3.5 flex-row items-center justify-between"
						style={({ pressed }) => [
							item.disabled && { opacity: 0.5 },
							pressed && !item.disabled && { opacity: 0.8 }
						]}
						disabled={item.disabled}
					>
						<Text
							className="text-text text-base flex-1 mr-2"
							style={item.disabled ? { color: labelColor } : undefined}
						>
							{item.title}
						</Text>
						{selectedItemKeys.has(item.key) && (
							<PlatformIcon
								ios={{ name: 'checkmark.circle.fill', size: 18 }}
								android={{ name: 'check_circle', size: 21 }}
								web={{ name: 'Check', size: 18 }}
								style={{ color: item.disabled ? labelColor : primaryColor }}
							/>
						)}
					</Pressable>
					{index < elements.length - 1 && (
						<Divider paddingLeft={Platform.OS === 'ios' ? 16 : 0} />
					)}
				</React.Fragment>
			))}
		</>
	)
}

export default MultiSectionPicker
