import BaseCard from '@/components/Cards/BaseCard'
import PlatformIcon from '@/components/Universal/Icon'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSequence,
	withRepeat,
	Easing,
	withDelay,
	interpolate,
	cancelAnimation,
	runOnJS
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const REEL_SYMBOLS = ['💰', '🍋', '🍒', '🍇', '🎰', '🔔', '🌟', '🎲', '🎯', '7️⃣']

const SPINNING_SYMBOLS = ['💰', '🍋', '🍒', '🍇', '🎰']

const SlotMachineCard = (): React.JSX.Element => {
	const { t } = useTranslation('navigation')
	const { styles } = useStyles(stylesheet)

	const actualResults = useRef<string[]>(['❓', '❓', '❓'])

	const [isSpinning, setIsSpinning] = useState(false)

	const [displayedResults, setDisplayedResults] = useState<string[]>([
		'❓',
		'❓',
		'❓'
	])

	const spinningIntervalRef = useRef<NodeJS.Timeout | null>(null)

	const [isWin, setIsWin] = useState(false)

	const reelAnimY = [useSharedValue(0), useSharedValue(0), useSharedValue(0)]

	const leverPull = useSharedValue(0)

	const winScale = useSharedValue(1)
	const winRotate = useSharedValue(0)

	const reelAnimatedStyles = reelAnimY.map((y) =>
		useAnimatedStyle(() => ({
			transform: [{ translateY: y.value }]
		}))
	)

	const leverAnimatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateY: interpolate(leverPull.value, [0, 1], [0, 20]) },
			{ rotate: interpolate(leverPull.value, [0, 1], ['0deg', '20deg']) }
		]
	}))

	const winAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: winScale.value }, { rotate: `${winRotate.value}deg` }],
		opacity: isWin ? 1 : 0
	}))

	useEffect(() => {
		return () => {
			if (spinningIntervalRef.current) {
				clearInterval(spinningIntervalRef.current)
			}
		}
	}, [])

	const startVisualSpinning = () => {
		if (spinningIntervalRef.current) {
			clearInterval(spinningIntervalRef.current)
		}

		setDisplayedResults(
			Array(3)
				.fill(0)
				.map(
					() =>
						SPINNING_SYMBOLS[
							Math.floor(Math.random() * SPINNING_SYMBOLS.length)
						]
				)
		)

		spinningIntervalRef.current = setInterval(() => {
			setDisplayedResults((prev) =>
				prev.map(
					() =>
						SPINNING_SYMBOLS[
							Math.floor(Math.random() * SPINNING_SYMBOLS.length)
						]
				)
			)
		}, 100)
	}

	const stopVisualSpinning = (finalResults: string[]) => {
		if (spinningIntervalRef.current) {
			clearInterval(spinningIntervalRef.current)
			spinningIntervalRef.current = null
		}

		setDisplayedResults(finalResults)
	}

	const spinSlotMachine = () => {
		if (isSpinning) return

		setIsSpinning(true)
		setIsWin(false)

		winScale.value = 1
		winRotate.value = 0

		leverPull.value = withSequence(
			withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) }),
			withDelay(
				500,
				withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
			)
		)

		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

		const newResults = Array(3)
			.fill(0)
			.map(() => REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)])

		actualResults.current = newResults

		startVisualSpinning()

		reelAnimY.forEach((position, index) => {
			cancelAnimation(position)

			position.value = withSequence(
				withRepeat(
					withTiming(-15, {
						duration: 100 + index * 50,
						easing: Easing.linear
					}),
					15 + index * 5,
					true
				),
				withTiming(
					0,
					{
						duration: 500 + index * 300,
						easing: Easing.out(Easing.cubic)
					},
					(finished) => {
						if (finished && index === 2) {
							runOnJS(finishSpin)(newResults)
						}
					}
				)
			)
		})

		setTimeout(() => {
			if (isSpinning) {
				finishSpin(newResults)
			}
		}, 4000)
	}

	const finishSpin = (newResults: string[]) => {
		stopVisualSpinning(newResults)

		setIsSpinning(false)

		const isWinResult =
			newResults[0] === newResults[1] && newResults[1] === newResults[2]

		if (isWinResult) {
			setIsWin(true)
			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

			winScale.value = withRepeat(
				withSequence(
					withTiming(1.2, { duration: 200, easing: Easing.out(Easing.quad) }),
					withTiming(1, { duration: 200, easing: Easing.in(Easing.quad) })
				),
				3,
				false
			)

			winRotate.value = withRepeat(
				withSequence(
					withTiming(-5, { duration: 100 }),
					withTiming(5, { duration: 200 }),
					withTiming(0, { duration: 100 })
				),
				4,
				false
			)
		} else {
			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
		}
	}

	const tapGesture = Gesture.Tap().onStart(() => {
		runOnJS(spinSlotMachine)()
	})

	const generateReelContent = (reelIndex: number) => {
		return (
			<Animated.View
				style={[styles.reelContent, reelAnimatedStyles[reelIndex]]}
			>
				<Text style={styles.reelSymbol}>{displayedResults[reelIndex]}</Text>
			</Animated.View>
		)
	}

	return (
		<BaseCard title="slot_machine" onPressRoute={undefined}>
			<View style={styles.slotMachineContainer}>
				<View style={styles.slotMachineBody}>
					<View style={styles.reelsContainer}>
						<View style={styles.reel}>{generateReelContent(0)}</View>
						<View style={styles.reel}>{generateReelContent(1)}</View>
						<View style={styles.reel}>{generateReelContent(2)}</View>
					</View>

					<Animated.View style={[styles.winIndicator, winAnimatedStyle]}>
						<Text style={styles.winText}>{t('slots.win_text', 'WINNER!')}</Text>
						<PlatformIcon
							ios={{
								name: 'sparkles',
								size: 24,
								weight: 'bold'
							}}
							android={{
								name: 'auto_awesome',
								size: 24
							}}
							web={{
								name: 'Sparkles',
								size: 24
							}}
							style={styles.winIcon}
						/>
					</Animated.View>

					<GestureDetector gesture={tapGesture}>
						<View style={styles.leverContainer}>
							<View style={styles.leverBase}>
								<View style={styles.leverKnobShadow} />
								<Animated.View style={[styles.leverArm, leverAnimatedStyle]}>
									<View style={styles.leverKnob} />
								</Animated.View>
							</View>
							<Text style={styles.leverText}>
								{isSpinning
									? t('slots.spinning', 'Spinning...')
									: t('slots.pull', 'Tap to Spin!')}
							</Text>
						</View>
					</GestureDetector>
				</View>
			</View>
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	slotMachineContainer: {
		padding: 8
	},
	slotMachineBody: {
		backgroundColor: theme.colors.cardButton,
		borderColor: theme.colors.border,
		borderWidth: 2,
		borderRadius: theme.radius.md,
		padding: 16,
		alignItems: 'center',
		position: 'relative'
	},
	reelsContainer: {
		flexDirection: 'row',
		backgroundColor: 'black',
		borderRadius: theme.radius.sm,
		borderWidth: 3,
		borderColor: '#B8860B',
		padding: 8,
		marginBottom: 12,
		overflow: 'hidden'
	},
	reel: {
		width: 60,
		height: 70,
		margin: 4,
		backgroundColor: 'white',
		borderRadius: 4,
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center'
	},
	reelContent: {
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: '100%'
	},
	reelSymbol: {
		fontSize: 32,
		textAlign: 'center'
	},
	leverContainer: {
		alignItems: 'center',
		marginTop: 0
	},
	leverBase: {
		width: 20,
		height: 20,
		borderRadius: 10,
		backgroundColor: '#B8860B',
		position: 'relative'
	},
	leverArm: {
		width: 8,
		height: 40,
		backgroundColor: '#C0C0C0',
		position: 'absolute',
		top: 10,
		left: 6,
		borderRadius: 4
	},
	leverKnob: {
		width: 16,
		height: 16,
		borderRadius: 8,
		backgroundColor: '#FF4444',
		position: 'absolute',
		bottom: -8,
		left: -4
	},
	leverKnobShadow: {
		width: 20,
		height: 6,
		borderRadius: 3,
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		position: 'absolute',
		bottom: -14,
		left: 0
	},
	leverText: {
		marginTop: 20,
		color: theme.colors.labelColor,
		fontSize: 14
	},
	winIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 8,
		marginBottom: 8
	},
	winText: {
		color: '#FFD700',
		fontSize: 18,
		fontWeight: 'bold',
		marginRight: 6,
		textShadowColor: 'rgba(0, 0, 0, 0.5)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2
	},
	winIcon: {
		color: '#FFD700'
	}
}))

export default SlotMachineCard
