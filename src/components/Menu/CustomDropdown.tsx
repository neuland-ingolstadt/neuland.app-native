import type React from 'react'
import { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface CustomDropdownProps<T> {
	value?: T
	onChange: (value: T) => void
	options: Array<{
		label: string
		value: T
	}>
	placeholder: string
	style?: ViewStyle
}

export function CustomDropdown<T>({
	value,
	onChange,
	options,
	placeholder,
	style
}: CustomDropdownProps<T>): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const [isOpen, setIsOpen] = useState(false)

	const selectedOption = options.find((option) => option.value === value)

	return (
		<>
			<Pressable
				style={[styles.trigger, style]}
				onPress={() => setIsOpen(true)}
			>
				<Text style={styles.triggerText}>
					{selectedOption ? selectedOption.label : placeholder}
				</Text>
			</Pressable>

			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsOpen(false)}
			>
				<Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
					<View style={styles.modalContent}>
						{options.map((option) => (
							<Pressable
								key={String(option.value)}
								style={[
									styles.option,
									option.value === value && styles.selectedOption
								]}
								onPress={() => {
									onChange(option.value)
									setIsOpen(false)
								}}
							>
								<Text
									style={[
										styles.optionText,
										option.value === value && styles.selectedOptionText
									]}
								>
									{option.label}
								</Text>
							</Pressable>
						))}
					</View>
				</Pressable>
			</Modal>
		</>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	trigger: {
		backgroundColor: theme.colors.inputBackground,
		borderRadius: theme.radius.md,
		borderColor: theme.colors.border,
		borderWidth: 1,
		height: 40,
		justifyContent: 'center',
		paddingHorizontal: 10
	},
	triggerText: {
		color: theme.colors.text,
		fontSize: 17
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	modalContent: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.lg,
		padding: 10,
		width: '80%',
		maxHeight: '80%'
	},
	option: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: theme.radius.md
	},
	selectedOption: {
		backgroundColor: theme.colors.primary
	},
	optionText: {
		color: theme.colors.text,
		fontSize: 16
	},
	selectedOptionText: {
		color: theme.colors.contrast
	}
}))
