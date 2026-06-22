import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import Divider from '@/components/Universal/Divider'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from '../Universal/Icon'

export interface FoodLanguageElement {
	title: string
	key: string
}

/**
 * A component that renders a list of selectable items with a title and a checkmark icon.
 * @param {FoodLanguageElement[]} elements - The list of selectable items.
 * @param {string[]} selectedItems - The list of selected items.
 * @param {(item: FoodLanguage) => void} action - The function to be called when an item is selected.
 * @returns {React.JSX.Element} - The MultiSectionPicker component.
 */
export interface FoodLanguagePickerProps {
	elements: FoodLanguageElement[]
	selectedItem: string
	action: (item: string) => void
}

const MultiSectionRadio = ({
	elements,
	selectedItem,
	action
}: FoodLanguagePickerProps): React.JSX.Element => {
	const primaryColor = useCSSVariable('--color-primary') as string | undefined

	return (
		<>
			{elements.map((item, index) => (
				<React.Fragment key={index}>
					<View className="h-[52px]">
						<Pressable
							className="bg-card rounded-ios p-4 flex-row items-center justify-between h-full active:opacity-80"
							onPress={() => {
								if (Platform.OS === 'ios') {
									void selectionAsync()
								}
								action(item.key)
							}}
						>
							<Text className="text-text text-base flex-1 mr-2">
								{item.title}
							</Text>
							{selectedItem === item.key && (
								<PlatformIcon
									ios={{
										name: 'checkmark.circle.fill',
										size: 18
									}}
									android={{
										name: 'check_circle',
										size: 21
									}}
									web={{
										name: 'Check',
										size: 18
									}}
									style={{
										color: toColor(primaryColor)
									}}
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

export default MultiSectionRadio
