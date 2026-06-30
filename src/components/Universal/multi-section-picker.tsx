import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
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

	return (
		<>
			{elements.map((item, index) => (
				<React.Fragment key={index}>
					<View className="h-[52px]">
						<Pressable
							onPress={() => {
								if (!item.disabled) {
									if (Platform.OS === 'ios') void selectionAsync()
									action(item.key)
								}
							}}
							className="bg-card ios:rounded-ios android:rounded-md p-4 flex-row items-center justify-between h-full"
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
							{selectedItems.includes(item.key) && (
								<PlatformIcon
									ios={{ name: 'checkmark.circle.fill', size: 18 }}
									android={{ name: 'check_circle', size: 21 }}
									web={{ name: 'Check', size: 18 }}
									style={{ color: item.disabled ? labelColor : primaryColor }}
								/>
							)}
						</Pressable>
					</View>
					{index < elements.length - 1 && (
						<Divider paddingLeft={Platform.OS === 'ios' ? 16 : 0} />
					)}
				</React.Fragment>
			))}
		</>
	)
}

export default MultiSectionPicker
