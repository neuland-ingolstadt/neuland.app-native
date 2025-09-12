/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO */

import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { LucideIcon } from '@/components/Universal/Icon'
import PlatformIcon from '@/components/Universal/Icon'
import type { MaterialIcon } from '@/types/material-icons'

interface CalendarAnimationProps {
	size?: number
}

interface EventIcon {
	ios: string
	android: MaterialIcon
	web: LucideIcon
	delay: number
	position: { x: number; y: number }
}

const EVENT_ICONS: readonly EventIcon[] = [
	{
		ios: 'party.popper.fill',
		android: 'celebration',
		web: 'PartyPopper',
		delay: 0,
		position: { x: 0.8, y: -0.6 }
	},
	{
		ios: 'ticket.fill',
		android: 'confirmation_number',
		web: 'Ticket',
		delay: 400,
		position: { x: -0.85, y: -0.5 }
	},
	{
		ios: 'megaphone.fill',
		android: 'campaign',
		web: 'Megaphone',
		delay: 800,
		position: { x: 0.5, y: 0.9 }
	},
	{
		ios: 'person.2.fill',
		android: 'group',
		web: 'Users',
		delay: 1200,
		position: { x: -0.6, y: 0.7 }
	}
]

export const CalendarAnimation = ({
	size = 120
}: CalendarAnimationProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	const calendarScale = useSharedValue(0.9)
	const calendarOpacity = useSharedValue(0)
	const calendarRotation = useSharedValue(0)
	const calendarTapScale = useSharedValue(1)

	const iconsArray = EVENT_ICONS.map(() => ({
		opacity: useSharedValue(0),
		scale: useSharedValue(0.6),
		floatY: useSharedValue(0),
		rotation: useSharedValue(Math.random() * 0.05 - 0.025)
	}))

	const triggerHaptic = () => {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
	}

	const triggerSuperLightHaptic = () => {
		if (Platform.OS === 'ios') {
			void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
		}
	}

	const tapGesture = Gesture.Tap().onBegin(() => {
		// Add haptic feedback on iOS
		runOnJS(triggerHaptic)()

		// Animate calendar icon zoom
		calendarTapScale.value = withSequence(
			withTiming(0.95, { duration: 100, easing: Easing.out(Easing.quad) }),
			withTiming(1, { duration: 200, easing: Easing.bounce })
		)

		iconsArray.forEach((icon, index) => {
			const randomDelay = index * 80
			icon.floatY.value = withDelay(
				randomDelay,
				withSequence(
					withTiming(-12, {
						duration: 400,
						easing: Easing.out(Easing.back(1.2))
					}),
					withTiming(0, { duration: 600, easing: Easing.bounce })
				)
			)
			icon.scale.value = withDelay(
				randomDelay,
				withSequence(
					withTiming(1.2, {
						duration: 200,
						easing: Easing.out(Easing.back(1.5))
					}),
					withTiming(1, { duration: 400, easing: Easing.bounce })
				)
			)
		})
	})

	useEffect(() => {
		calendarOpacity.value = withTiming(1, {
			duration: 800,
			easing: Easing.out(Easing.quad)
		})
		calendarScale.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
				withTiming(0.97, { duration: 2200, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)
		calendarRotation.value = withRepeat(
			withSequence(
				withTiming(0.05, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
				withTiming(-0.05, { duration: 3000, easing: Easing.inOut(Easing.sin) })
			),
			-1,
			true
		)

		iconsArray.forEach((icon, index) => {
			const delay = EVENT_ICONS[index].delay

			// Add haptic feedback for each icon pop-up on iOS
			icon.opacity.value = withDelay(
				delay,
				withTiming(
					1,
					{
						duration: 800,
						easing: Easing.out(Easing.cubic)
					},
					() => {
						runOnJS(triggerSuperLightHaptic)()
					}
				)
			)
			icon.scale.value = withDelay(
				delay,
				withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) })
			)
			icon.floatY.value = withDelay(
				delay,
				withRepeat(
					withSequence(
						withTiming(4, {
							duration: 3000 + Math.random() * 1000,
							easing: Easing.inOut(Easing.sin)
						}),
						withTiming(-4, {
							duration: 3000 + Math.random() * 1000,
							easing: Easing.inOut(Easing.sin)
						})
					),
					-1,
					true
				)
			)
			icon.rotation.value = withDelay(
				delay,
				withRepeat(
					withSequence(
						withTiming(0.025, {
							duration: 4000 + Math.random() * 1000,
							easing: Easing.inOut(Easing.sin)
						}),
						withTiming(-0.025, {
							duration: 4000 + Math.random() * 1000,
							easing: Easing.inOut(Easing.sin)
						})
					),
					-1,
					true
				)
			)
		})
	}, [])

	const calendarStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ scale: calendarScale.value * calendarTapScale.value },
				{ rotate: `${calendarRotation.value}rad` }
			],
			opacity: calendarOpacity.value
		}
	})

	const iconAnimatedStyles = iconsArray.map((icon, index) =>
		useAnimatedStyle(() => {
			const { x, y } = EVENT_ICONS[index].position
			const baseSize = size * 0.75
			return {
				opacity: icon.opacity.value,
				transform: [
					{ translateX: baseSize * x },
					{ translateY: baseSize * y + icon.floatY.value },
					{ scale: icon.scale.value },
					{ rotate: `${icon.rotation.value}rad` }
				]
			}
		})
	)

	return (
		<View style={[styles.container, { width: size * 2, height: size * 1.8 }]}>
			{EVENT_ICONS.map((eventIcon, index) => (
				<Animated.View
					key={`icon-${index}`}
					style={[
						styles.iconContainer,
						{ width: size * 0.35, height: size * 0.35 },
						iconAnimatedStyles[index]
					]}
				>
					<PlatformIcon
						ios={{ name: eventIcon.ios, size: size * 0.23 }}
						android={{
							name: eventIcon.android as MaterialIcon,
							size: size * 0.3,
							variant: 'outlined'
						}}
						web={{ name: eventIcon.web, size: size * 0.25 }}
						style={styles.icon}
					/>
				</Animated.View>
			))}

			<GestureDetector gesture={tapGesture}>
				<Animated.View style={[styles.calendarContainer, calendarStyle]}>
					<PlatformIcon
						ios={{ name: 'calendar', size: size * 0.8 }}
						android={{
							name: 'calendar_month' as MaterialIcon,
							size: size * 0.85,
							variant: 'outlined'
						}}
						web={{ name: 'Calendar', size: size * 0.8 }}
						style={styles.calendarIcon}
					/>
				</Animated.View>
			</GestureDetector>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		paddingVertical: 0
	},
	calendarContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		width: '100%',
		height: '100%'
	},
	calendarIcon: {
		color: theme.colors.labelColor,
		zIndex: 1
	},
	iconContainer: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 2
	},
	icon: {
		color: theme.colors.primary
	}
}))
