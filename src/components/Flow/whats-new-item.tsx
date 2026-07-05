import { ImpactFeedbackStyle, impactAsync } from 'expo-haptics'
import type React from 'react'
import { useEffect } from 'react'
import { Platform, Pressable } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import type { Version } from '@/types/data'
import WhatsNewBox from './whats-new-box'

interface WhatsNewItemProps {
	title: string
	description: string
	icon: Version['icon']
	index: number
}

export function WhatsNewItem({
	title,
	description,
	icon,
	index
}: WhatsNewItemProps): React.JSX.Element {
	const opacity = useSharedValue(0)
	const rotation = useSharedValue(0)

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				opacity.value = withTiming(1, {
					duration: 800,
					easing: Easing.linear
				})
			},
			200 + index * 400
		)

		return () => {
			clearTimeout(timeout)
		}
	}, [index, opacity])

	const opacityStyle = useAnimatedStyle(() => ({
		opacity: opacity.value
	}))

	const rotationStyle = useAnimatedStyle(() => ({
		transform: [{ rotateZ: `${rotation.value}deg` }]
	}))

	const handlePress = (): void => {
		if (Platform.OS === 'ios') {
			void impactAsync(ImpactFeedbackStyle.Light)
		}
		const direction = Math.random() > 0.5 ? 1 : -1
		rotation.value = withSequence(
			withTiming(direction * -1.5, {
				duration: 100,
				easing: Easing.linear
			}),
			withTiming(direction * 1, {
				duration: 100,
				easing: Easing.linear
			}),
			withTiming(direction * -0.5, {
				duration: 100,
				easing: Easing.linear
			}),
			withTiming(0, {
				duration: 100,
				easing: Easing.linear
			})
		)
	}

	return (
		<Animated.View style={[opacityStyle, rotationStyle]}>
			<Pressable onPress={handlePress}>
				<WhatsNewBox title={title} description={description} icon={icon} />
			</Pressable>
		</Animated.View>
	)
}
