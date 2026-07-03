import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

interface ThemePreviewCardProps {
	isDark: boolean
	isActive: boolean
	label: string
	onPress: () => void
}

const ThemePreviewCard = ({
	isDark,
	isActive,
	label,
	onPress
}: ThemePreviewCardProps): React.JSX.Element => {
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const scale = useSharedValue(1)

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }]
	}))

	return (
		<View className="flex-1 gap-2">
			<Text className="text-text text-[13px] font-semibold text-center">
				{label}
			</Text>
			<Pressable
				onPressIn={() => {
					scale.value = withSpring(0.95, { damping: 15 })
				}}
				onPressOut={() => {
					scale.value = withSpring(1, { damping: 15 })
				}}
				onPress={onPress}
				className="flex-1"
			>
				<Animated.View
					className="flex-1 rounded-2xl overflow-hidden border-2"
					style={[
						{
							backgroundColor: isDark ? '#000000' : '#fff',
							borderColor: isActive ? primaryColor : 'transparent'
						},
						animatedStyle
					]}
				>
					<View className="p-2 gap-1">
						<View
							className="h-1 rounded-sm"
							style={{
								backgroundColor: isDark ? '#fff' : '#000',
								opacity: 0.15
							}}
						/>
						<View
							className="h-1 rounded-sm"
							style={{
								backgroundColor: isDark ? '#fff' : '#000',
								opacity: 0.15,
								width: '40%'
							}}
						/>
					</View>
					<View className="flex-1 p-2 gap-2">
						<View
							className="flex-1 rounded-sm overflow-hidden"
							style={{ backgroundColor: isDark ? '#151515' : '#e9e9f0' }}
						>
							<View className="flex-1 p-2 justify-center">
								<View className="gap-1">
									<View
										className="h-[3px] rounded-sm"
										style={{
											backgroundColor: isDark ? '#fff' : '#000',
											opacity: 0.1
										}}
									/>
									<View
										className="h-[3px] rounded-sm"
										style={{
											backgroundColor: isDark ? '#fff' : '#000',
											opacity: 0.1,
											width: '70%'
										}}
									/>
								</View>
							</View>
						</View>
						<View
							className="flex-1 rounded-sm overflow-hidden"
							style={{ backgroundColor: isDark ? '#151515' : '#e9e9f0' }}
						>
							<View className="flex-1 p-2 justify-center">
								<View className="gap-1">
									<View
										className="h-[3px] rounded-sm"
										style={{
											backgroundColor: isDark ? '#fff' : '#000',
											opacity: 0.1
										}}
									/>
									<View
										className="h-[3px] rounded-sm"
										style={{
											backgroundColor: isDark ? '#fff' : '#000',
											opacity: 0.1,
											width: '50%'
										}}
									/>
								</View>
							</View>
						</View>
					</View>
				</Animated.View>
			</Pressable>
		</View>
	)
}

export default ThemePreviewCard
