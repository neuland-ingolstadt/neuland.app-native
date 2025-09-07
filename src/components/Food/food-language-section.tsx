import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import Divider from '@/components/Universal/Divider'
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
					<View style={styles.itemContainer}>
						<Pressable
							onPress={() => {
								if (Platform.OS === 'ios') {
									void selectionAsync()
								}
								action(item.key)
							}}
							style={({ pressed }) => [
								styles.itemContent,
								pressed && { opacity: 0.8 }
							]}
						>
							<Text style={styles.itemText}>{item.title}</Text>
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
									style={styles.checkIcon}
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

const stylesheet = createStyleSheet((theme) => ({
	itemContainer: {
		height: 52
	},
	itemContent: {
		backgroundColor: theme.colors.card,
		borderRadius: 16,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: '100%'
	},
	itemText: {
		color: theme.colors.text,
		fontSize: 16,
		flex: 1,
		marginRight: 8
	},
	checkIcon: {
		color: theme.colors.primary
	}
}))

export default MultiSectionRadio
