import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useEffect } from 'react'
import { Platform, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Toggle, useBinding } from 'swiftui-react-native'

interface SectionPickerProps {
	title: string
	selectedItem: boolean
	action: (state: boolean) => void
	disabled?: boolean
}

/**
 * A component that renders a single selectable item with a title and a native SwiftUI toggle.
 * @param {string} title - The title of the item.
 * @param {boolean} selectedItem - Whether the item is selected.
 * @param {() => void} action - The function to be called when the item is selected.
 * @param {boolean} state - The state of the item.
 * @param {boolean} disabled - Whether the item is disabled.
 * @returns {JSX.Element} - The SingleSectionPicker component.
 * @example
 * <SingleSectionPicker
 *      title={'Title'}
 *      selectedItem={selected}
 *      action={() => {
 *         setSelected(!selected)
 *    }}
 *    disabled={false}
 * />
 */
const SingleSectionPicker: React.FC<SectionPickerProps> = ({
	title,
	selectedItem,
	action,
	disabled = false
}) => {
	const { styles } = useStyles(stylesheet)
	const isOn = useBinding(selectedItem)

	useEffect(() => {
		isOn.setValue(selectedItem)
	}, [selectedItem])

	const handleToggleChange = (value?: boolean) => {
		if (!disabled) {
			if (Platform.OS === 'ios') {
				void selectionAsync()
			}
			action(value ?? !selectedItem)
		}
	}

	return (
		<View style={styles.itemContainer}>
			<View style={[styles.itemContent, disabled && styles.disabled]}>
				<Text style={[styles.itemText, disabled && styles.textDisabled]}>
					{title}
				</Text>
				<Toggle
					isOn={isOn}
					onChange={handleToggleChange}
					style={disabled && styles.toggleDisabled}
				/>
			</View>
		</View>
	)
}

export default SingleSectionPicker

const stylesheet = createStyleSheet((theme) => ({
	itemContainer: {
		height: 52
	},
	itemContent: {
		backgroundColor: theme.colors.card,
		borderRadius: 26,
		padding: 16,
		marginRight: 2,
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
	toggleDisabled: {
		opacity: 0.5
	},
	disabled: {
		opacity: 0.5
	},
	textDisabled: {
		color: theme.colors.labelColor
	}
}))
