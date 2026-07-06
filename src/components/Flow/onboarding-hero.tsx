import type React from 'react'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import LogoSVG from '@/components/Flow/svgs/logo'
import { toColor } from '@/utils/uniwind-utils'

interface OnboardingHeroProps {
	brandName: string
	fontSize: number
	heroProgress: SharedValue<number>
	logoScale: SharedValue<number>
	rippleProgress: SharedValue<number>
	titleOpacity: SharedValue<number>
	titleTranslateY: SharedValue<number>
	welcomeTitle: string
}

interface RippleRingProps {
	index: number
	primaryColor: string
	rippleProgress: SharedValue<number>
}

function RippleRing({
	index,
	primaryColor,
	rippleProgress
}: RippleRingProps): React.JSX.Element {
	const ringStyle = useAnimatedStyle(() => {
		const offset = index * 0.22
		const progress = interpolate(
			rippleProgress.value,
			[offset, Math.min(offset + 0.65, 1)],
			[0, 1],
			'clamp'
		)

		return {
			position: 'absolute',
			width: 180,
			height: 180,
			borderRadius: 90,
			borderWidth: 1.5,
			borderColor: primaryColor,
			opacity: interpolate(progress, [0, 0.2, 1], [0, 0.45, 0]),
			transform: [{ scale: interpolate(progress, [0, 1], [0.45, 1.8]) }]
		}
	})

	return <Animated.View style={ringStyle} />
}

interface StaggeredLetterProps {
	char: string
	delay: number
	fontSize: number
	heroProgress: SharedValue<number>
	textColor: string
}

function StaggeredLetter({
	char,
	delay,
	fontSize,
	heroProgress,
	textColor
}: StaggeredLetterProps): React.JSX.Element {
	const letterStyle = useAnimatedStyle(() => {
		const local = interpolate(
			heroProgress.value,
			[delay, Math.min(delay + 0.18, 1)],
			[0, 1],
			'clamp'
		)

		return {
			opacity: local,
			transform: [
				{ translateY: interpolate(local, [0, 1], [18, 0]) },
				{ scale: interpolate(local, [0, 1], [0.82, 1]) }
			]
		}
	})

	return (
		<Animated.Text
			style={[
				{
					fontSize,
					color: textColor,
					fontWeight: 'bold',
					textAlign: 'center'
				},
				letterStyle
			]}
		>
			{char === ' ' ? '\u00A0' : char}
		</Animated.Text>
	)
}

export function OnboardingHero({
	brandName,
	fontSize,
	heroProgress,
	logoScale,
	rippleProgress,
	titleOpacity,
	titleTranslateY,
	welcomeTitle
}: OnboardingHeroProps): React.JSX.Element {
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')
	const glowPulse = useSharedValue(0)

	useEffect(() => {
		glowPulse.value = withDelay(
			400,
			withTiming(1, { duration: 1200 }, () => {
				glowPulse.value = withTiming(0.65, { duration: 900 })
			})
		)
	}, [glowPulse])

	const logoContainerStyle = useAnimatedStyle(() => ({
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 28,
		transform: [{ scale: logoScale.value }]
	}))

	const glowStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		width: 150,
		height: 150,
		borderRadius: 75,
		backgroundColor: primaryColor,
		opacity: interpolate(glowPulse.value, [0, 1], [0, 0.14])
	}))

	const welcomeStyle = useAnimatedStyle(() => ({
		opacity: titleOpacity.value,
		transform: [{ translateY: titleTranslateY.value }]
	}))

	const brandRowStyle = useAnimatedStyle(() => ({
		flexDirection: 'row',
		justifyContent: 'center',
		flexWrap: 'wrap',
		marginTop: 4
	}))

	useEffect(() => {
		logoScale.value = withDelay(
			200,
			withSpring(1, {
				damping: 13,
				stiffness: 95,
				mass: 0.75
			})
		)
		rippleProgress.value = withDelay(350, withTiming(1, { duration: 1800 }))
	}, [logoScale, rippleProgress])

	const letters = brandName.split('')

	return (
		<View className="items-center">
			<Animated.View style={logoContainerStyle}>
				<Animated.View style={glowStyle} />
				{[0, 1, 2].map((index) => (
					<RippleRing
						key={index}
						index={index}
						primaryColor={primaryColor}
						rippleProgress={rippleProgress}
					/>
				))}
				<LogoSVG size={160} />
			</Animated.View>

			<Animated.Text
				style={[
					{
						fontSize,
						color: textColor,
						fontWeight: 'bold',
						textAlign: 'center'
					},
					welcomeStyle
				]}
			>
				{welcomeTitle}
			</Animated.Text>

			<Animated.View style={brandRowStyle}>
				{letters.map((char, index) => (
					<StaggeredLetter
						key={`${char}-${index}`}
						char={char}
						delay={0.42 + index * 0.045}
						fontSize={fontSize}
						heroProgress={heroProgress}
						textColor={textColor}
					/>
				))}
			</Animated.View>
		</View>
	)
}
