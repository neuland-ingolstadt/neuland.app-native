import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import type { ThemeColor } from '@/hooks/usePreferencesStore'
import { themeColorMap } from '@/styles/theme-colors'
import { toColor } from '@/utils/uniwind-utils'

interface AccentOption {
	key: ThemeColor
	title: string
}

interface ColorOptionProps {
	option: AccentOption
	selected: ThemeColor
	onSelect: (color: ThemeColor) => void
}

const ColorOption = ({
	option,
	selected,
	onSelect
}: ColorOptionProps): React.JSX.Element => {
	const { theme } = useUniwind()
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	const colors = themeColorMap[option.key]
	const isSelected = option.key === selected
	const scale = useSharedValue(1)

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }]
	}))

	return (
		<Pressable
			accessibilityLabel={option.title}
			onPress={() => onSelect(option.key)}
			onPressIn={() => {
				scale.value = withSpring(0.95, { damping: 15 })
			}}
			onPressOut={() => {
				scale.value = withSpring(1, { damping: 15 })
			}}
			className="items-center flex-1 active:opacity-80"
		>
			<Animated.View
				className={`w-14 h-14 rounded-2xl mb-2 ${isSelected ? 'border-2 border-text' : ''}`}
				style={[
					{
						backgroundColor: theme === 'dark' ? colors.dark : colors.light,
						shadowColor: textColor,
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: isSelected ? 0.2 : 0.1,
						shadowRadius: isSelected ? 6 : 4
					},
					animatedStyle
				]}
			/>
			<Text
				className="text-sm font-medium text-center"
				style={{ color: labelColor }}
			>
				{option.title}
			</Text>
		</Pressable>
	)
}

interface AccentColorPickerProps {
	options: AccentOption[]
	selected: ThemeColor
	onSelect: (color: ThemeColor) => void
}

const AccentColorPicker = ({
	options,
	selected,
	onSelect
}: AccentColorPickerProps): React.JSX.Element => {
	return (
		<View className="flex-row items-center py-[18px] justify-evenly">
			{options.map((option) => (
				<ColorOption
					key={option.key}
					option={option}
					selected={selected}
					onSelect={onSelect}
				/>
			))}
		</View>
	)
}

export default AccentColorPicker
