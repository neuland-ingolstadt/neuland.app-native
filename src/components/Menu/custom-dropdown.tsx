import type React from 'react'
import { useState } from 'react'
import type { ViewStyle } from 'react-native'
import { Modal, Pressable, Text, View } from 'react-native'

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
	const [isOpen, setIsOpen] = useState(false)

	const selectedOption = options.find((option) => option.value === value)

	return (
		<>
			<Pressable
				className="bg-input-background rounded-md border-border h-10 justify-center px-2.5"
				style={[{ borderWidth: 1 }, style]}
				onPress={() => setIsOpen(true)}
			>
				<Text className="text-text text-[17px]">
					{selectedOption ? selectedOption.label : placeholder}
				</Text>
			</Pressable>

			<Modal
				visible={isOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setIsOpen(false)}
			>
				<Pressable
					className="flex-1 bg-black/50 justify-center items-center"
					onPress={() => setIsOpen(false)}
				>
					<View className="bg-card rounded-lg p-2.5 w-[80%] max-h-[80%]">
						{options.map((option) => (
							<Pressable
								key={String(option.value)}
								className={`py-3 px-4 rounded-md ${
									option.value === value ? 'bg-primary' : ''
								}`}
								onPress={() => {
									onChange(option.value)
									setIsOpen(false)
								}}
							>
								<Text
									className={`text-base ${
										option.value === value
											? 'text-contrast font-medium'
											: 'text-text'
									}`}
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
