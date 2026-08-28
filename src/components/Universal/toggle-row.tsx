import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'

const ToggleRow = ({
	items,
	selectedElement,
	setSelectedElement,
	testID
}: {
	items: string[]
	selectedElement: number
	setSelectedElement: (element: number) => void
	testID?: string
}): React.JSX.Element => {
	const pressHandler = (index: number) => {
		setSelectedElement(index)
		if (Platform.OS === 'ios') {
			void selectionAsync()
		}
	}

	return (
		<View className="self-center flex-row gap-3 justify-between w-full">
			{items.map((item, index) => {
				const isSelected = selectedElement === index

				return (
					<View key={item} className="flex-1">
						<Pressable
							testID={testID == null ? undefined : `${testID}-${index}`}
							accessibilityRole="tab"
							accessibilityState={{ selected: isSelected }}
							onPress={() => {
								pressHandler(index)
							}}
						>
							<View className="items-center self-center bg-card ios:rounded-ios android:rounded-md web:rounded-md border-hairline border-border overflow-hidden px-page py-2.5 w-full">
								<Text
									className={
										isSelected
											? 'font-medium text-primary text-[15px]'
											: 'font-normal text-text text-[15px]'
									}
								>
									{item}
								</Text>
							</View>
						</Pressable>
					</View>
				)
			})}
		</View>
	)
}

export default ToggleRow
