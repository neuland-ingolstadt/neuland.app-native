import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { Platform, Pressable, Text } from 'react-native'
import { useCSSVariable } from 'uniwind'
import Divider from '@/components/Universal/divider'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

export interface FoodLanguageElement {
	title: string
	key: string
}

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
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	return (
		<>
			{elements.map((item, index) => (
				<React.Fragment key={index}>
					<Pressable
						testID={`radio-option-${item.key}`}
						accessibilityRole="radio"
						accessibilityState={{ selected: selectedItem === item.key }}
						onPress={() => {
							if (Platform.OS === 'ios') {
								void selectionAsync()
							}
							action(item.key)
						}}
						className="bg-card ios:rounded-ios android:rounded-lg min-h-[52px] px-4 py-3.5 flex-row items-center justify-between active:opacity-80"
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
								style={{ color: primaryColor }}
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

export default MultiSectionRadio
