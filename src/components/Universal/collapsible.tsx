import type React from 'react'
import { useEffect, useRef } from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'

interface CollapsibleProps {
	collapsed: boolean
	children: React.ReactNode
	duration?: number
	style?: StyleProp<ViewStyle>
}

/** Height-animated expand/collapse (drop-in for react-native-collapsible's `collapsed` API). */
export default function Collapsible({
	collapsed,
	children,
	duration = 300,
	style
}: CollapsibleProps): React.JSX.Element {
	const contentHeight = useSharedValue(0)
	// `undefined` keeps natural height until the first measure (initially expanded).
	const height = useSharedValue<number | undefined>(collapsed ? 0 : undefined)
	const isInitial = useRef(true)

	useEffect(() => {
		if (contentHeight.get() === 0) {
			return
		}

		const target = collapsed ? 0 : contentHeight.get()

		if (isInitial.current) {
			height.set(target)
			isInitial.current = false
			return
		}

		height.set(
			withTiming(target, {
				duration,
				easing: Easing.out(Easing.cubic)
			})
		)
	}, [collapsed, duration, contentHeight, height])

	const animatedStyle = useAnimatedStyle(() => {
		const currentHeight = height.get()
		if (currentHeight === undefined) {
			return { overflow: 'hidden' as const }
		}
		return {
			height: currentHeight,
			overflow: 'hidden' as const
		}
	})

	return (
		<Animated.View
			style={[animatedStyle, style]}
			pointerEvents={collapsed ? 'none' : 'auto'}
		>
			<View
				// Absolute while collapsed so Yoga still reports natural height.
				style={
					collapsed
						? { position: 'absolute', top: 0, left: 0, right: 0 }
						: undefined
				}
				onLayout={(event) => {
					const next = Math.ceil(event.nativeEvent.layout.height)
					if (next <= 0 || next === contentHeight.get()) {
						return
					}

					contentHeight.set(next)

					if (isInitial.current) {
						height.set(collapsed ? 0 : next)
						isInitial.current = false
						return
					}

					if (!collapsed) {
						height.set(next)
					}
				}}
			>
				{children}
			</View>
		</Animated.View>
	)
}
