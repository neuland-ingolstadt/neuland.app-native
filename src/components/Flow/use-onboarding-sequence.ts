import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import {
	Easing,
	runOnJS,
	type SharedValue,
	useSharedValue,
	withDelay,
	withSpring,
	withTiming
} from 'react-native-reanimated'

const ONBOARDING_CARD_COUNT = 3

export interface OnboardingAnimationValues {
	ambientOpacity: SharedValue<number>
	cardOpacities: SharedValue<number>[]
	cardScales: SharedValue<number>[]
	cardTranslateYs: SharedValue<number>[]
	cardsViewHeight: SharedValue<number>
	helpOpacity: SharedValue<number>
	heroOpacity: SharedValue<number>
	heroCollapse: SharedValue<number>
	heroProgress: SharedValue<number>
	legalOpacity: SharedValue<number>
	legalTranslateY: SharedValue<number>
	logoScale: SharedValue<number>
	networkProgress: SharedValue<number>
	rippleProgress: SharedValue<number>
	textLogoOpacity: SharedValue<number>
	titleOpacity: SharedValue<number>
	titleTranslateY: SharedValue<number>
}

interface UseOnboardingSequenceOptions {
	onCardsReady: () => void
	onContinueReady: () => void
}

export function useOnboardingSequence({
	onCardsReady,
	onContinueReady
}: UseOnboardingSequenceOptions): OnboardingAnimationValues {
	const { height } = useWindowDimensions()

	const ambientOpacity = useSharedValue(0)
	const networkProgress = useSharedValue(0)
	const logoScale = useSharedValue(0.55)
	const rippleProgress = useSharedValue(0)
	const heroProgress = useSharedValue(0)
	const titleOpacity = useSharedValue(0)
	const titleTranslateY = useSharedValue(24)
	const heroOpacity = useSharedValue(1)
	const heroCollapse = useSharedValue(1)
	const textLogoOpacity = useSharedValue(1)
	const cardsViewHeight = useSharedValue(0)
	const helpOpacity = useSharedValue(0)
	const legalOpacity = useSharedValue(0)
	const legalTranslateY = useSharedValue(20)

	const cardOpacity0 = useSharedValue(0)
	const cardOpacity1 = useSharedValue(0)
	const cardOpacity2 = useSharedValue(0)
	const cardTranslateY0 = useSharedValue(28)
	const cardTranslateY1 = useSharedValue(28)
	const cardTranslateY2 = useSharedValue(28)
	const cardScale0 = useSharedValue(0.9)
	const cardScale1 = useSharedValue(0.9)
	const cardScale2 = useSharedValue(0.9)

	const cardOpacities = [cardOpacity0, cardOpacity1, cardOpacity2]
	const cardTranslateYs = [cardTranslateY0, cardTranslateY1, cardTranslateY2]
	const cardScales = [cardScale0, cardScale1, cardScale2]

	useEffect(() => {
		ambientOpacity.value = withTiming(1, {
			duration: 900,
			easing: Easing.out(Easing.cubic)
		})

		networkProgress.value = withDelay(
			500,
			withTiming(1, { duration: 2200, easing: Easing.out(Easing.cubic) })
		)

		titleOpacity.value = withDelay(
			900,
			withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
		)
		titleTranslateY.value = withDelay(
			900,
			withSpring(0, { damping: 16, stiffness: 120, mass: 0.7 })
		)

		heroProgress.value = withDelay(
			1050,
			withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) })
		)

		heroOpacity.value = withDelay(
			3200,
			withTiming(0, { duration: 700, easing: Easing.inOut(Easing.cubic) })
		)
		heroCollapse.value = withDelay(
			3000,
			withTiming(0, { duration: 800, easing: Easing.inOut(Easing.cubic) })
		)
		textLogoOpacity.value = withDelay(
			3000,
			withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
		)
		ambientOpacity.value = withDelay(
			3100,
			withTiming(0.28, { duration: 900, easing: Easing.out(Easing.cubic) })
		)

		cardsViewHeight.value = withDelay(
			3400,
			withTiming(height * 0.4, {
				duration: 50,
				easing: Easing.out(Easing.quad)
			})
		)

		for (let index = 0; index < ONBOARDING_CARD_COUNT; index++) {
			const delay = 3600 + index * 140

			cardOpacities[index].value = withDelay(
				delay,
				withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
			)
			cardTranslateYs[index].value = withDelay(
				delay,
				withSpring(0, { damping: 15, stiffness: 130, mass: 0.65 })
			)
			cardScales[index].value = withDelay(
				delay,
				withSpring(1, { damping: 14, stiffness: 140, mass: 0.6 })
			)
		}

		helpOpacity.value = withDelay(
			4200,
			withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
		)
		legalOpacity.value = withDelay(
			4200,
			withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
		)
		legalTranslateY.value = withDelay(
			4200,
			withTiming(
				0,
				{ duration: 550, easing: Easing.out(Easing.cubic) },
				(isFinished) => {
					if (isFinished === true) {
						runOnJS(onContinueReady)()
					}
				}
			)
		)

		const cardsReadyTimer = setTimeout(() => {
			onCardsReady()
		}, 3700)

		return () => {
			clearTimeout(cardsReadyTimer)
		}
	}, [
		ambientOpacity,
		cardOpacities,
		cardScales,
		cardTranslateYs,
		cardsViewHeight,
		helpOpacity,
		heroOpacity,
		heroCollapse,
		heroProgress,
		height,
		legalOpacity,
		legalTranslateY,
		logoScale,
		networkProgress,
		onCardsReady,
		onContinueReady,
		rippleProgress,
		textLogoOpacity,
		titleOpacity,
		titleTranslateY
	])

	return {
		ambientOpacity,
		networkProgress,
		logoScale,
		rippleProgress,
		heroProgress,
		titleOpacity,
		titleTranslateY,
		heroOpacity,
		heroCollapse,
		textLogoOpacity,
		cardsViewHeight,
		helpOpacity,
		legalOpacity,
		legalTranslateY,
		cardOpacities,
		cardTranslateYs,
		cardScales
	}
}
