import AnimatedLogoText from '@/components/Flow/svgs/AnimatedLogoText'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import {
	animatedHapticFeedback,
	useRandomColor,
	withBouncing
} from '@/utils/animation-utils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import Animated, {
	cancelAnimation,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface SettingsLogoProps {
	scrollY: number
	width: number
	height: number
}

export default function SettingsLogo({
	scrollY,
	width,
	height
}: SettingsLogoProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])
	const [tapCount, setTapCount] = React.useState(0)
	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)
	const logoRotation = useSharedValue(0)
	const velocity = 110
	const { color, randomizeColor } = useRandomColor()
	const logoWidth = 159
	const logoHeight = 15
	const bottomBoundX = 0
	const topBoundX = width - logoWidth

	React.useEffect(() => {
		const { bottomBoundY, topBoundY } = getBounds()
		if (isBouncing) {
			translateX.value = withBouncing(
				velocity,
				bottomBoundX,
				topBoundX,
				randomizeColor
			) as unknown as number
			translateY.value = withBouncing(
				velocity,
				bottomBoundY,
				topBoundY,
				randomizeColor
			) as unknown as number
		} else {
			cancelAnimation(translateX)
			cancelAnimation(translateY)
		}
	}, [tapCount])

	const logoBounceAnimation = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value }
			]
		}
	})

	const wobbleAnimation = useAnimatedStyle(() => {
		return {
			transform: [{ rotateZ: `${logoRotation.value}deg` }]
		}
	})

	const getBounds = (): { topBoundY: number; bottomBoundY: number } => {
		const topBoundY = height - logoHeight + scrollY - 5
		const bottomBoundY = scrollY
		return { topBoundY, bottomBoundY }
	}

	const handlePress = (): void => {
		setTapCount(tapCount + 1)
		animatedHapticFeedback()
		if (tapCount < 1) {
			const rotationDegree = 5

			logoRotation.value = withSequence(
				withTiming(-rotationDegree, { duration: 50 }),
				withTiming(rotationDegree, { duration: 100 }),
				withTiming(0, { duration: 50 })
			)
		}
	}

	const isBouncing = tapCount === 2
	const logoInactiveOpacity = isBouncing ? 0 : 1
	const logoActiveOpacity = isBouncing ? 1 : 0
	const logoActiveHeight = isBouncing ? 18 : 0

	return (
		<>
			<Animated.View
				style={[
					styles.bounceContainer,
					logoBounceAnimation,
					{
						opacity: logoActiveOpacity,
						height: logoActiveHeight
					}
				]}
			>
				<Pressable
					onPress={() => {
						setTapCount(0)
					}}
					disabled={!isBouncing}
					hitSlop={{
						top: 10,
						right: 10,
						bottom: 10,
						left: 10
					}}
				>
					<LogoTextSVG
						size={15}
						color={isBouncing ? color : theme.colors.text}
					/>
				</Pressable>
			</Animated.View>

			<Animated.View
				style={[
					wobbleAnimation,
					styles.whobbleContainer,
					{
						opacity: logoInactiveOpacity
					}
				]}
			>
				<Pressable
					onPress={() => {
						handlePress()
					}}
					disabled={isBouncing || Platform.OS === 'web'}
					accessibilityLabel={t('button.settingsLogo', {
						ns: 'accessibility'
					})}
					hitSlop={{
						top: 10,
						right: 10,
						bottom: 10,
						left: 10
					}}
				>
					<AnimatedLogoText
						dimensions={{
							logoWidth,
							logoHeight
						}}
						speed={3.5}
					/>
				</Pressable>
			</Animated.View>
		</>
	)
}

const stylesheet = createStyleSheet(() => ({
	bounceContainer: {
		position: 'absolute',
		zIndex: 10
	},
	whobbleContainer: {
		alignItems: 'center',
		paddingTop: 20
	}
}))
