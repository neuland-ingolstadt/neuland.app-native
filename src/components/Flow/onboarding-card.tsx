import * as Haptics from 'expo-haptics'
import type React from 'react'
import { Platform, Pressable } from 'react-native'
import Animated, {
	Easing,
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import type { OnboardingCardData } from '@/types/data'
import WhatsNewBox from './whats-new-box'

interface OnboardingCardProps {
	title: string
	description: string
	icon: OnboardingCardData['icon']
	opacity: SharedValue<number>
	translateY: SharedValue<number>
	wobbleDisabled: boolean
}

export function OnboardingCard({
	title,
	description,
	icon,
	opacity,
	translateY,
	wobbleDisabled
}: OnboardingCardProps): React.JSX.Element {
	const rotation = useSharedValue(0)

	const wobbleStyle = useAnimatedStyle(() => ({
		transform: [{ rotateZ: `${rotation.value}deg` }]
	}))

	const entranceStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }]
	}))

	const handlePress = (): void => {
		if (wobbleDisabled) {
			return
		}
		if (Platform.OS === 'ios') {
			void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
		<Pressable onPress={handlePress}>
			<Animated.View style={wobbleStyle}>
				<Animated.View style={entranceStyle}>
					<WhatsNewBox title={title} description={description} icon={icon} />
				</Animated.View>
			</Animated.View>
		</Pressable>
	)
}
