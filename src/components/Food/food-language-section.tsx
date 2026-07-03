import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import Divider from '@/components/Universal/divider'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from '../Universal/icon'

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
					<View className="h-[52px]">
						<Pressable
							onPress={() => {
								if (Platform.OS === 'ios') {
									void selectionAsync()
								}
								action(item.key)
							}}
							className="bg-card ios:rounded-ios android:rounded-lg p-4 flex-row items-center justify-between h-full active:opacity-80"
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
