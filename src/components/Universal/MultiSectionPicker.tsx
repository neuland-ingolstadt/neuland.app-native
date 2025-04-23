import Divider from '@/components/Universal/Divider'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
					<Pressable
						onPress={() => {
							if (!item.disabled) {
								action(item.key)
							}
						}}
						style={({ pressed }) => [
							styles.button,
							item.disabled && styles.disabled,
							pressed && !item.disabled && { opacity: 0.8 }
						]}
						disabled={item.disabled}
					>
						<View style={styles.container}>
							<Text style={[styles.text, item.disabled && styles.textDisabled]}>
								{item.title}
							</Text>
							{selectedItems.includes(item.key) ? (
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
									style={item.disabled ? styles.iconDisabled : undefined}
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
	button: {
		padding: 8
	},
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

export default MultiSectionPicker
