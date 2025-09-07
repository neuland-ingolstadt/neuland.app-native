import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import Divider from '@/components/Universal/Divider'
import PlatformIcon from './Icon'

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

/**
 * A component that renders a list of selectable items with a title and a checkmark icon.
 * @param {Element[]} elements - The list of selectable items.
 * @param {string[]} selectedItems - The list of selected items.
 * @param {(item: string) => void} action - The function to be called when an item is selected.
 * @returns {JSX.Element} - The MultiSectionPicker component.
 */
const MultiSectionPicker: React.FC<SectionPickerProps> = ({
	elements,
	selectedItems,
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
								if (!item.disabled) {
									if (Platform.OS === 'ios') {
										void selectionAsync()
									}
									action(item.key)
								}
							}}
							style={({ pressed }) => [
								styles.itemContent,
								item.disabled && styles.disabled,
								pressed && !item.disabled && { opacity: 0.8 }
							]}
							disabled={item.disabled}
						>
							<Text
								style={[styles.itemText, item.disabled && styles.textDisabled]}
							>
								{item.title}
							</Text>
							{selectedItems.includes(item.key) && (
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
									style={item.disabled ? styles.iconDisabled : styles.checkIcon}
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
	itemContentSelected: {
		backgroundColor: theme.colors.card,
		opacity: 0.8
	},
	itemText: {
		color: theme.colors.text,
		fontSize: 16,
		flex: 1,
		marginRight: 8
	},
	checkIcon: {
		color: theme.colors.primary
	},
	disabled: {
		opacity: 0.5
	},
	textDisabled: {
		color: theme.colors.labelColor
	},
	iconDisabled: {
		color: theme.colors.labelColor
	}
}))
