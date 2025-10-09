import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from './Icon'

interface SectionPickerProps {
	title: string
	selectedItem: boolean
	action: (state: boolean) => void
	disabled?: boolean
}

/**
 * A component that renders a single selectable item with a title and a checkmark icon.
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
	return (
		<View style={styles.itemContainer}>
			<Pressable
				onPress={() => {
					if (!disabled) {
						if (Platform.OS === 'ios') {
							void selectionAsync()
						}
						action(!selectedItem)
					}
				}}
				style={({ pressed }) => [
					styles.itemContent,
					disabled && styles.disabled,
					pressed && !disabled && { opacity: 0.8 }
				]}
				disabled={disabled}
			>
				<Text style={[styles.itemText, disabled && styles.textDisabled]}>
					{title}
				</Text>
				{selectedItem && (
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
						style={disabled ? styles.iconDisabled : styles.checkIcon}
					/>
				)}
			</Pressable>
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
