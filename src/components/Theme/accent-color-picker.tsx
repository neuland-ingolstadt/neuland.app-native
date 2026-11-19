import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import type { ThemeColor } from '@/hooks/usePreferencesStore'
import { themeColorMap } from '@/styles/theme-colors'
import { toColor } from '@/utils/uniwind-utils'

export interface AccentOption {
	key: ThemeColor
	title: string
	unlocked: boolean
	lockHint?: string
}

interface ColorOptionProps {
	option: AccentOption
	selected: ThemeColor
	onSelect: (color: ThemeColor) => void
	onLockedPress?: (option: AccentOption) => void
}

const ColorOption = ({
	option,
	selected,
	onSelect,
	onLockedPress
}: ColorOptionProps): React.JSX.Element => {
	const { theme } = useUniwind()
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	const labelSecondary = toColor(useCSSVariable('--color-label-secondary'))
	const colors = themeColorMap[option.key]
	const isSelected = option.unlocked && option.key === selected
	const scale = useSharedValue(1)

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.get() }]
	}))

	return (
		<Pressable
			accessibilityLabel={
				option.unlocked
					? option.title
					: `${option.title}, ${option.lockHint ?? 'locked'}`
			}
			accessibilityState={{ disabled: !option.unlocked, selected: isSelected }}
			onPress={() => {
				if (option.unlocked) {
					onSelect(option.key)
					return
				}
				onLockedPress?.(option)
			}}
			onPressIn={() => {
				scale.set(withSpring(0.95, { damping: 15 }))
			}}
			onPressOut={() => {
				scale.set(withSpring(1, { damping: 15 }))
			}}
			className="items-center flex-1 active:opacity-80"
		>
			<Animated.View
				className={`w-14 h-14 rounded-2xl mb-2 items-center justify-center ${
					isSelected ? 'border-2 border-text' : ''
				}`}
				style={[
					{
						backgroundColor: theme === 'dark' ? colors.dark : colors.light,
						opacity: option.unlocked ? 1 : 0.35,
						shadowColor: textColor,
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: isSelected ? 0.2 : 0.1,
						shadowRadius: isSelected ? 6 : 4
					},
					animatedStyle
				]}
			>
				{!option.unlocked && (
					<PlatformIcon
						ios={{ name: 'lock.fill', size: 16 }}
						android={{ name: 'lock', size: 18 }}
						web={{ name: 'Lock', size: 16 }}
						style={{ color: textColor }}
					/>
				)}
			</Animated.View>
			<Text
				className="text-sm font-medium text-center"
				style={{ color: labelColor }}
			>
				{option.title}
			</Text>
			{!option.unlocked && option.lockHint != null && (
				<Text
					className="text-[11px] text-center mt-0.5 px-0.5"
					style={{ color: labelSecondary }}
				>
					{option.lockHint}
				</Text>
			)}
		</Pressable>
	)
}

interface AccentColorPickerProps {
	options: AccentOption[]
	selected: ThemeColor
	onSelect: (color: ThemeColor) => void
	onLockedPress?: (option: AccentOption) => void
}

const AccentColorPicker = ({
	options,
	selected,
	onSelect,
	onLockedPress
}: AccentColorPickerProps): React.JSX.Element => {
	return (
		<View className="flex-row items-start py-[18px] justify-evenly">
			{options.map((option) => (
				<ColorOption
					key={option.key}
					option={option}
					selected={selected}
					onSelect={onSelect}
					onLockedPress={onLockedPress}
				/>
			))}
		</View>
	)
}

export default AccentColorPicker
