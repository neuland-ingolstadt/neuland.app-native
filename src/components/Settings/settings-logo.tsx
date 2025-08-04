import * as Haptics from 'expo-haptics'
import { useFocusEffect } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable } from 'react-native'
import Animated, {
	cancelAnimation,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import AnimatedLogoText from '@/components/Flow/svgs/animated-logo-text'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import {
	animatedHapticFeedback,
	useRandomColor,
	withBouncing
} from '@/utils/animation-utils'

interface SettingsLogoProps {
	scrollY: number
	size: {
		width: number
		height: number
	}
}

export default function SettingsLogo({
	scrollY,
	size
}: SettingsLogoProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])
	const [tapCount, setTapCount] = React.useState(0)
	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)
	const logoRotation = useSharedValue(0)
	const cornerScale = useSharedValue(1)
	const lastBounceX = React.useRef(0)
	const lastBounceY = React.useRef(0)
	const { color, randomizeColor } = useRandomColor()
	const velocity = 110
	const logoWidth = 175
	const logoHeight = 16

	const BOUNCE_CORNER_TOLERANCE = 150

	const handleBounce = (axis: 'x' | 'y'): void => {
		const now = Date.now()
		if (axis === 'x') {
			lastBounceX.current = now
		} else {
			lastBounceY.current = now
		}

		if (
			Math.abs(lastBounceX.current - lastBounceY.current) <
			BOUNCE_CORNER_TOLERANCE
		) {
			cornerScale.value = withSequence(
				withTiming(1.3, { duration: 100 }),
				withTiming(1, { duration: 100 })
			)
			if (Platform.OS !== 'web') {
				void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
			}
		}
	}

	const isBouncing = tapCount === 2
	const logoInactiveOpacity = isBouncing ? 0 : 1
	const logoActiveOpacity = isBouncing ? 1 : 0
	const logoActiveHeight = isBouncing ? 18 : 0

	React.useEffect(() => {
		if (isBouncing) {
			translateX.value = withBouncing(
				velocity,
				0,
				size.width - logoWidth,
				randomizeColor,
				() => handleBounce('x')
			) as number
			translateY.value = withBouncing(
				velocity,
				0,
				size.height - logoHeight,
				randomizeColor,
				() => handleBounce('y')
			) as number
		} else {
			cancelAnimation(translateX)
			cancelAnimation(translateY)
		}
	}, [isBouncing, size])

	React.useEffect(() => {
		setTapCount(0)
	}, [size])

	useFocusEffect(
		React.useCallback(() => {
			return () => {
				cancelAnimation(translateX)
				cancelAnimation(translateY)
				translateX.value = 0
				translateY.value = 0
				runOnJS(setTapCount)(0)
			}
		}, [])
	)

	const logoBounceAnimation = useAnimatedStyle(() => {
		return {
			transform: [
				{ translateX: translateX.value },
				{ translateY: translateY.value + scrollY },
				{ scale: cornerScale.value }
			]
		}
	})

	const wobbleAnimation = useAnimatedStyle(() => {
		return {
			transform: [{ rotateZ: `${logoRotation.value}deg` }]
		}
	})

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
						size={16.5}
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
					disabled={isBouncing}
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
		paddingTop: 22
	}
}))
