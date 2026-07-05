import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useEffect } from 'react'
import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Easing,
	runOnJS,
	type SharedValue,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import type { LucideIcon } from '@/components/Universal/icon'
import PlatformIcon from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import { toColor } from '@/utils/uniwind-utils'

function triggerTimetableAnimationHaptic(): void {
	void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

interface TimetableAnimationProps {
	size?: number
}

interface TimetableIcon {
	ios: string
	android: MaterialIcon
	web: LucideIcon
	delay: number
	position: { x: number; y: number }
}

const TIMETABLE_ICONS: readonly TimetableIcon[] = [
	{
		ios: 'book.fill',
		android: 'book',
		web: 'BookOpen',
		delay: 0,
		position: { x: 0.8, y: -0.6 }
	},
	{
		ios: 'person.2.fill',
		android: 'group',
		web: 'Users',
		delay: 400,
		position: { x: -0.85, y: -0.5 }
	},
	{
		ios: 'clock.fill',
		android: 'schedule',
		web: 'Clock',
		delay: 800,
		position: { x: 0.5, y: 0.9 }
	},
	{
		ios: 'building.2.fill',
		android: 'business_center',
		web: 'Building',
		delay: 1200,
		position: { x: -0.6, y: 0.7 }
	}
]

interface FloatingTimetableIconProps {
	timetableIcon: TimetableIcon
	size: number
	index: number
	tapCount: SharedValue<number>
}

const FloatingTimetableIcon = ({
	timetableIcon,
	size,
	index,
	tapCount
}: FloatingTimetableIconProps): React.JSX.Element => {
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	const opacity = useSharedValue(0)
	const scale = useSharedValue(0.6)
	const floatY = useSharedValue(0)
	const rotation = useSharedValue(Math.random() * 0.05 - 0.025)

	useAnimatedReaction(
		() => tapCount.value,
		(current, previous) => {
			if (previous === undefined) return
			if (current === previous) return

			const randomDelay = index * 80
			floatY.value = withDelay(
				randomDelay,
				withSequence(
					withTiming(-12, {
						duration: 400,
						easing: Easing.out(Easing.back(1.2))
					}),
					withTiming(0, { duration: 600, easing: Easing.bounce })
				)
			)
			scale.value = withDelay(
				randomDelay,
				withSequence(
					withTiming(1.2, {
						duration: 200,
						easing: Easing.out(Easing.back(1.5))
					}),
					withTiming(1, { duration: 400, easing: Easing.bounce })
				)
			)
		}
	)

	useEffect(() => {
		const delay = timetableIcon.delay

		opacity.value = withDelay(
			delay,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
		)
		scale.value = withDelay(
			delay,
			withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) })
		)
		floatY.value = withDelay(
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
		rotation.value = withDelay(
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
	}, [timetableIcon.delay])

	const animatedStyle = useAnimatedStyle(() => {
		const { x, y } = timetableIcon.position
		const baseSize = size * 0.75
		return {
			opacity: opacity.value,
			transform: [
				{ translateX: baseSize * x },
				{ translateY: baseSize * y + floatY.value },
				{ scale: scale.value },
				{ rotate: `${rotation.value}rad` }
			]
		}
	})

	return (
		<Animated.View
			className="absolute items-center justify-center z-[2]"
			style={[{ width: size * 0.35, height: size * 0.35 }, animatedStyle]}
		>
			<PlatformIcon
				ios={{ name: timetableIcon.ios, size: size * 0.23 }}
				android={{
					name: timetableIcon.android as MaterialIcon,
					size: size * 0.3,
					variant: 'outlined'
				}}
				web={{ name: timetableIcon.web, size: size * 0.25 }}
				style={{ color: primaryColor }}
			/>
		</Animated.View>
	)
}

export const TimetableAnimation = ({
	size = 120
}: TimetableAnimationProps): React.JSX.Element => {
	const labelColor = toColor(useCSSVariable('--color-label'))

	const calendarScale = useSharedValue(0.9)
	const calendarOpacity = useSharedValue(0)
	const calendarRotation = useSharedValue(0)
	const calendarTapScale = useSharedValue(1)
	const tapCount = useSharedValue(0)

	const tapGesture = Gesture.Tap().onBegin(() => {
		runOnJS(triggerTimetableAnimationHaptic)()

		calendarTapScale.value = withSequence(
			withTiming(0.95, { duration: 100, easing: Easing.out(Easing.quad) }),
			withTiming(1, { duration: 200, easing: Easing.bounce })
		)

		tapCount.value = tapCount.value + 1
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

	return (
		<View
			className="items-center justify-center relative overflow-visible"
			style={{ width: size * 2, height: size * 1.8 }}
		>
			{TIMETABLE_ICONS.map((timetableIcon, index) => (
				<FloatingTimetableIcon
					key={timetableIcon.ios}
					timetableIcon={timetableIcon}
					size={size}
					index={index}
					tapCount={tapCount}
				/>
			))}

			<GestureDetector gesture={tapGesture}>
				<Animated.View
					className="items-center justify-center overflow-visible z-[1]"
					style={[{ width: size, height: size }, calendarStyle]}
				>
					<PlatformIcon
						ios={{ name: 'calendar', size: size * 0.8 }}
						android={{
							name: 'calendar_month' as MaterialIcon,
							size: size * 0.85,
							variant: 'outlined'
						}}
						web={{ name: 'Calendar', size: size * 0.8 }}
						style={{ color: labelColor }}
					/>
				</Animated.View>
			</GestureDetector>
		</View>
	)
}
