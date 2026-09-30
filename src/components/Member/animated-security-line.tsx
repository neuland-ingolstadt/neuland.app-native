import React, { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

interface AnimatedSecurityLineProps {
	color: string
}

const TRACK_WIDTH = 92

export const AnimatedSecurityLine = React.memo(function AnimatedSecurityLine({
	color
}: AnimatedSecurityLineProps): React.JSX.Element {
	const translateX = useRef(new Animated.Value(-TRACK_WIDTH)).current

	useEffect(() => {
		const animation = Animated.loop(
			Animated.sequence([
				Animated.timing(translateX, {
					toValue: TRACK_WIDTH,
					duration: 3000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true
				}),
				Animated.timing(translateX, {
					toValue: -TRACK_WIDTH,
					duration: 3000,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true
				})
			])
		)

		animation.start()

		return () => {
			animation.stop()
			translateX.stopAnimation()
			translateX.setValue(-TRACK_WIDTH)
		}
	}, [translateX])

	return (
		<View
			style={{
				alignSelf: 'flex-end',
				height: 2,
				marginTop: 6,
				overflow: 'hidden',
				width: TRACK_WIDTH
			}}
		>
			<Animated.View
				style={{
					backgroundColor: color,
					height: 2,
					opacity: 0.85,
					transform: [{ translateX }],
					width: TRACK_WIDTH
				}}
			/>
		</View>
	)
})
