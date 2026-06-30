import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import SelectDropdown from 'react-native-select-dropdown'
import { useResolveClassNames } from 'uniwind'

interface Props {
	data: string[]
	defaultValue: string
	onSelect: (selectedItem: string) => void
	reset?: boolean
	width?: number
}

/**
 * A dropdown component that uses `react-native-select-dropdown` library.
 *
 * @param data - An array of strings that represents the dropdown options.
 * @param defaultValue - The default value of the dropdown.
 * @param onSelect - A function that is called when an option is selected.
 * @param selected - The currently selected option.
 * @param width - The width of the dropdown.
 */
const Dropdown = ({
	data,
	defaultValue,
	onSelect,
	reset = false,
	width = 100
}: Props): React.JSX.Element => {
	const ref = React.createRef<SelectDropdown>()
	const dropdownStyle = useResolveClassNames('bg-card rounded-md')
	const dropdownButtonStyle = useResolveClassNames(
		'items-center bg-date-picker-background rounded-md h-8 justify-center px-2.5'
	)
	const itemTextStyle = useResolveClassNames('text-text')
	const buttonTextStyle = useResolveClassNames(
		'text-text text-[15px] text-center'
	)
	const selectedTextStyle = useResolveClassNames('font-medium')
	const rowStyle = useResolveClassNames(
		'bg-card h-[38px] justify-center border-b border-border'
	)

	useEffect(() => {
		if (ref.current != null && reset) {
			ref.current?.selectIndex(0)
		}
	}, [reset])

	return (
		<SelectDropdown
			ref={ref}
			data={data}
			defaultValue={defaultValue}
			dropdownStyle={[
				dropdownStyle,
				{
					shadowOffset: { width: 0.1, height: 0.1 },
					shadowOpacity: 0.3
				}
			]}
			onSelect={(selectedItem: string) => {
				onSelect(selectedItem)
			}}
			renderButton={(selectedItem) => {
				return (
					<View
						style={[
							dropdownButtonStyle,
							{
								width
							}
						]}
					>
						<Text
							numberOfLines={1}
							allowFontScaling={false}
							style={itemTextStyle}
						>
							{selectedItem}
						</Text>
					</View>
				)
			}}
			renderItem={(item, _index, isSelected) => {
				return (
					<View style={rowStyle}>
						<Text
							style={
								isSelected
									? [buttonTextStyle, selectedTextStyle]
									: buttonTextStyle
							}
						>
							{item}
						</Text>
					</View>
				)
			}}
		/>
	)
}

export default Dropdown

export const DropdownButton = ({
	children,
	onPress
}: {
	children: React.ReactNode
	onPress: () => void
}): React.JSX.Element => {
	const dropdownButtonStyle = useResolveClassNames(
		'items-center bg-date-picker-background rounded-md h-8 justify-center px-2.5'
	)
	const textStyle = useResolveClassNames('text-text')

	return (
		<TouchableOpacity onPress={onPress}>
			<View style={dropdownButtonStyle}>
				<Text numberOfLines={1} allowFontScaling={false} style={textStyle}>
					{children}
				</Text>
			</View>
		</TouchableOpacity>
	)
}
