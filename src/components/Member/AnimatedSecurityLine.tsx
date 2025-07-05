import type React from 'react'
import { useEffect, useRef } from 'react'
import { Animated as RNAnimated, View } from 'react-native'

export function AnimatedSecurityLine(): React.JSX.Element {
	const animatedValue = useRef(new RNAnimated.Value(0)).current

	useEffect(() => {
		const startAnimation = () => {
			RNAnimated.loop(
				RNAnimated.sequence([
					RNAnimated.timing(animatedValue, {
						toValue: 1,
						duration: 3000,
						useNativeDriver: false
					}),
					RNAnimated.timing(animatedValue, {
						toValue: 0,
						duration: 3000,
						useNativeDriver: false
					})
				])
			).start()
		}

		startAnimation()
	}, [animatedValue])

	const translateX = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [-90, 90]
	})

	return (
		<View
			style={{ height: 2, overflow: 'hidden', marginTop: 6, width: '100%' }}
		>
			<RNAnimated.View
				style={{
					height: 2,
					width: '100%',
					backgroundColor: '#00ff33',
					transform: [{ translateX }],
					opacity: 0.8
				}}
			/>
		</View>
	)
}
