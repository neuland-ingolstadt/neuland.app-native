import type React from 'react'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming
} from 'react-native-reanimated'

export function AnimatedSecurityLine(): React.JSX.Element {
	const translateX = useSharedValue(-90)

	useEffect(() => {
		translateX.value = -90

		translateX.value = withRepeat(
			withTiming(90, {
				duration: 3000,
				easing: Easing.inOut(Easing.ease)
			}),
			-1,
			true
		)

		return () => {
			translateX.value = -90
		}
	}, [])

	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: translateX.value }]
		}
	})

	return (
		<View
			style={{ height: 2, overflow: 'hidden', marginTop: 6, width: '100%' }}
		>
			<Animated.View
				style={[
					{
						height: 2,
						width: '100%',
						backgroundColor: '#00ff33',
						opacity: 0.8
					},
					animatedStyle
				]}
			/>
		</View>
	)
}
