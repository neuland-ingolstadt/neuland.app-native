import Divider from '@/components/Universal/Divider'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
 * @returns {JSX.Element} - The MultiSectionPicker component.
 */
export interface FoodLanguagePickerProps {
	elements: FoodLanguageElement[]
	selectedItem: string
	action: (item: string) => void
}

// ...

const MultiSectionRadio: React.FC<FoodLanguagePickerProps> = ({
	elements,
	selectedItem,
	action
}) => {
	const { styles } = useStyles(stylesheet)
	return (
		<>
			{elements.map((item, index) => (
				<React.Fragment key={index}>
					<Pressable
						onPress={() => {
							action(item.key)
						}}
						style={({ pressed }) => [
							{ opacity: pressed ? 0.8 : 1 },
							{ padding: 8 }
						]}
					>
						<View style={styles.container}>
							<Text style={styles.text}>{item.title}</Text>

							{selectedItem === item.key ? (
								<PlatformIcon
									ios={{
										name: 'checkmark',
										size: 15
									}}
									android={{
										name: 'check',
										size: 18
									}}
									web={{
										name: 'Check',
										size: 18
									}}
								/>
							) : (
								<></>
							)}
						</View>
					</Pressable>
					{index < elements.length - 1 && <Divider iosPaddingLeft={16} />}
				</React.Fragment>
			))}
		</>
	)
}
const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginRight: 8,
		paddingHorizontal: 6,
		paddingVertical: 6
	},
	text: {
		color: theme.colors.text,
		fontSize: 16,
		paddingVertical: 1
	}
}))

export default MultiSectionRadio
