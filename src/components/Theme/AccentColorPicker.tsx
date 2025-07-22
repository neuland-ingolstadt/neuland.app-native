import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import {
	createStyleSheet,
	UnistylesRuntime,
	useStyles
} from 'react-native-unistyles'
import { accentColorMap } from '@/components/provider'
import type { AccentColor } from '@/hooks/usePreferencesStore'

interface AccentOption {
	key: AccentColor
	title: string
}

interface ColorOptionProps {
	option: AccentOption
	selected: AccentColor
	onSelect: (color: AccentColor) => void
}

const ColorOption = ({
	option,
	selected,
	onSelect
}: ColorOptionProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const colors = accentColorMap[option.key]
	const isSelected = option.key === selected
	const scale = useSharedValue(1)

	// Safety check - this shouldn't happen if option.key is valid, but just in case
	if (!colors) {
		console.warn(`Unknown accent color in ColorOption: ${option.key}`)
		return <View />
	}

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
			style={({ pressed }) => [
				styles.optionContainer,
				pressed && { opacity: 0.8 }
			]}
		>
			<Animated.View
				style={[
					styles.swatch,
					{
						backgroundColor:
							UnistylesRuntime.themeName === 'dark' ? colors.dark : colors.light
					},
					isSelected && styles.selected,
					animatedStyle
				]}
			/>
			<Text style={styles.label}>{option.title}</Text>
		</Pressable>
	)
}

interface AccentColorPickerProps {
	options: AccentOption[]
	selected: AccentColor
	onSelect: (color: AccentColor) => void
}

const AccentColorPicker = ({
	options,
	selected,
	onSelect
}: AccentColorPickerProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	return (
		<View style={styles.container}>
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

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 18,
		justifyContent: 'space-evenly'
	},
	optionContainer: {
		alignItems: 'center',
		flex: 1
	},
	swatch: {
		width: 56,
		height: 56,
		borderRadius: 12,
		marginBottom: 8,
		shadowColor: theme.colors.text,
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3
	},
	selected: {
		borderWidth: 2,
		borderColor: theme.colors.text,
		shadowOpacity: 0.2,
		shadowRadius: 6,
		elevation: 5
	},
	label: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '500',
		textAlign: 'center'
	}
}))

export default AccentColorPicker
