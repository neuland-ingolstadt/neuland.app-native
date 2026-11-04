import * as Haptics from 'expo-haptics'
import {
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'

export const useWiggleAnimation = ({
	rotation = 5,
	damping = 3,
	stiffness = 300
}: {
	rotation?: number
	damping?: number
	stiffness?: number
} = {}) => {
	const iconRotation = useSharedValue(0)

	const iconAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${iconRotation.value}deg`
				}
			]
		}
	})

	const triggerWiggle = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		iconRotation.value = withSpring(-rotation, {
			damping,
			stiffness
		})
		setTimeout(() => {
			iconRotation.value = withSpring(rotation, {
				damping,
				stiffness
			})
			setTimeout(() => {
				iconRotation.value = withSpring(0, {
					damping,
					stiffness
				})
			}, 100)
		}, 100)
	}

	return {
		iconAnimatedStyle,
		triggerWiggle
	}
}
