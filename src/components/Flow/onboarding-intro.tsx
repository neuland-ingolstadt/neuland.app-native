import type React from 'react'
import { useEffect } from 'react'
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSpring
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import AnimatedText from '@/components/Flow/svgs/animated-text'
import LogoSVG from '@/components/Flow/svgs/logo'
import { toColor } from '@/utils/uniwind-utils'

interface OnboardingIntroProps {
	brandName: string
	fontSize: number
	heroMargin: SharedValue<number>
	logoOpacity: SharedValue<number>
	screenHeight: number
	shimmerActive: boolean
	textOpacity: SharedValue<number>
	textTranslateY: SharedValue<number>
	welcomeTitle: string
}

export function OnboardingIntro({
	brandName,
	fontSize,
	heroMargin,
	logoOpacity,
	screenHeight,
	shimmerActive,
	textOpacity,
	textTranslateY,
	welcomeTitle
}: OnboardingIntroProps): React.JSX.Element {
	const textColor = toColor(useCSSVariable('--color-text'))
	const primaryColor = String(useCSSVariable('--color-primary') ?? '#007aff')
	const intro = useSharedValue(0)

	useEffect(() => {
		intro.value = withDelay(
			120,
			withSpring(1, {
				damping: 18,
				stiffness: 110,
				mass: 0.85
			})
		)
	}, [intro])

	const heroContainerStyle = useAnimatedStyle(() => ({
		alignItems: 'center',
		justifyContent: 'center',
		opacity: logoOpacity.value,
		height: 150 * heroMargin.value,
		marginTop: heroMargin.value * screenHeight * 0.5,
		marginBottom: heroMargin.value * 40
	}))

	const logoStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: interpolate(intro.value, [0, 1], [0.72, 1]) },
			{ rotate: `${interpolate(intro.value, [0, 1], [-4, 0])}deg` }
		]
	}))

	const haloStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		width: 190,
		height: 190,
		borderRadius: 95,
		backgroundColor: primaryColor,
		opacity: interpolate(intro.value, [0, 0.5, 1], [0, 0.1, 0.06])
	}))

	const textStyle = useAnimatedStyle(() => ({
		opacity: textOpacity.value,
		transform: [{ translateY: textTranslateY.value }]
	}))

	const titleBlockStyle = {
		fontSize,
		color: textColor,
		fontWeight: 'bold' as const,
		textAlign: 'center' as const
	}

	return (
		<Animated.View style={heroContainerStyle}>
			<Animated.View
				className="items-center justify-center mb-7"
				style={logoStyle}
			>
				<Animated.View style={haloStyle} />
				<LogoSVG size={160} />
			</Animated.View>

			<Animated.Text style={[titleBlockStyle, textStyle]}>
				{welcomeTitle}
			</Animated.Text>

			<AnimatedText
				speed={900}
				text={brandName}
				disabled={!shimmerActive}
				// @ts-expect-error wrong types
				textStyles={[titleBlockStyle, textStyle]}
			/>
		</Animated.View>
	)
}
