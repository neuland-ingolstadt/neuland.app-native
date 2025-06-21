/** biome-ignore-all lint/correctness/useHookAtTopLevel: TODO */
import { useEffect } from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Easing,
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
		ios: 'party.popper',
		android: 'celebration',
		web: 'PartyPopper',
		delay: 0,
		position: { x: 0.8, y: -0.6 }
	},
	{
		ios: 'ticket.fill',
		android: 'airplane_ticket',
		web: 'Ticket',
		delay: 400,
		position: { x: -0.85, y: -0.45 }
	},
	{
		ios: 'megaphone.fill',
		android: 'campaign',
		web: 'Megaphone',
		delay: 800,
		position: { x: 0.45, y: 0.9 }
	}
]

export const CalendarAnimation = ({
	size = 120
}: CalendarAnimationProps): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)

	const calendarScale = useSharedValue(0.9)
	const calendarOpacity = useSharedValue(0)
	const calendarRotation = useSharedValue(0)
	const calendarPressPulse = useSharedValue(0)

	const iconsArray = EVENT_ICONS.map(() => ({
		opacity: useSharedValue(0),
		scale: useSharedValue(0.6),
		floatY: useSharedValue(0),
		rotation: useSharedValue(Math.random() * 0.05 - 0.025)
	}))

	const tapGesture = Gesture.Tap().onBegin(() => {
		calendarPressPulse.value = withSequence(
			withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
			withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) })
		)

		iconsArray.forEach((icon, index) => {
			const randomDelay = index * 50
			icon.floatY.value = withDelay(
				randomDelay,
				withSequence(
					withTiming(-8, { duration: 300, easing: Easing.out(Easing.quad) }),
					withTiming(0, { duration: 500, easing: Easing.bounce })
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
			icon.opacity.value = withDelay(
				delay,
				withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
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
		const tapScale = 1 - calendarPressPulse.value * 0.05
		return {
			transform: [
				{ scale: calendarScale.value * tapScale },
				{ rotate: `${calendarRotation.value}rad` }
			],
			opacity: calendarOpacity.value
		}
	})

	const calendarPulseStyle = useAnimatedStyle(() => ({
		opacity: calendarPressPulse.value * 0.3,
		transform: [{ scale: 1 + calendarPressPulse.value * 0.2 }]
	}))

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
						ios={{ name: eventIcon.ios, size: size * 0.25 }}
						android={{
							name: eventIcon.android as MaterialIcon,
							size: size * 0.25,
							variant: 'outlined'
						}}
						web={{ name: eventIcon.web, size: size * 0.25 }}
						style={styles.icon}
					/>
				</Animated.View>
			))}

			<GestureDetector gesture={tapGesture}>
				<Animated.View style={[styles.calendarContainer, calendarStyle]}>
					<Animated.View style={[styles.calendarPulse, calendarPulseStyle]} />
					<PlatformIcon
						ios={{ name: 'calendar', size: size * 0.8 }}
						android={{
							name: 'calendar_month' as MaterialIcon,
							size: size * 0.8,
							variant: 'outlined'
						}}
						web={{ name: 'Calendar', size: size * 0.8 }}
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
		justifyContent: 'center'
	},
	calendarPulse: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		borderRadius: 999,
		backgroundColor: theme.colors.primary,
		opacity: 0
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
