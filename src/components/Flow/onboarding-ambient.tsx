import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import type React from 'react'
import { useEffect } from 'react'
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native'
import Animated, {
	Easing,
	interpolate,
	type SharedValue,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming
} from 'react-native-reanimated'
import Svg, { Circle, Line } from 'react-native-svg'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

const AnimatedLine = Animated.createAnimatedComponent(Line)
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const NODES = [
	{ x: 0.1, y: 0.16 },
	{ x: 0.9, y: 0.1 },
	{ x: 0.94, y: 0.38 },
	{ x: 0.82, y: 0.68 },
	{ x: 0.18, y: 0.74 },
	{ x: 0.06, y: 0.44 },
	{ x: 0.5, y: 0.06 }
] as const

const EDGES: [number, number][] = [
	[0, 5],
	[0, 6],
	[1, 6],
	[1, 2],
	[2, 3],
	[3, 4],
	[4, 5],
	[6, 1]
]

interface OnboardingAmbientProps {
	masterOpacity: SharedValue<number>
	networkProgress: SharedValue<number>
}

interface FloatingOrbProps {
	colors: [string, string]
	size: number
	initialX: number
	initialY: number
	driftDuration: number
}

function FloatingOrb({
	colors,
	size,
	initialX,
	initialY,
	driftDuration
}: FloatingOrbProps): React.JSX.Element {
	const drift = useSharedValue(0)

	useEffect(() => {
		drift.value = withRepeat(
			withSequence(
				withTiming(1, {
					duration: driftDuration,
					easing: Easing.inOut(Easing.sin)
				}),
				withTiming(0, {
					duration: driftDuration,
					easing: Easing.inOut(Easing.sin)
				})
			),
			-1,
			false
		)
	}, [drift, driftDuration])

	const orbStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		left: initialX,
		top: initialY,
		width: size,
		height: size,
		borderRadius: size / 2,
		transform: [
			{ translateX: interpolate(drift.value, [0, 1], [-18, 22]) },
			{ translateY: interpolate(drift.value, [0, 1], [14, -20]) },
			{ scale: interpolate(drift.value, [0, 0.5, 1], [0.94, 1.06, 0.94]) }
		]
	}))

	const gradient = (
		<LinearGradient
			colors={colors}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			style={{ flex: 1, borderRadius: size / 2 }}
		/>
	)

	return (
		<Animated.View style={orbStyle}>
			{Platform.OS === 'ios' ? (
				<BlurView intensity={35} tint="default" style={styles.orbBlur}>
					{gradient}
				</BlurView>
			) : (
				<View
					className="overflow-hidden rounded-full opacity-70"
					style={{ flex: 1 }}
				>
					{gradient}
				</View>
			)}
		</Animated.View>
	)
}

interface ConstellationEdgeProps {
	x1: number
	y1: number
	x2: number
	y2: number
	progress: SharedValue<number>
	stroke: string
}

function ConstellationEdge({
	x1,
	y1,
	x2,
	y2,
	progress,
	stroke
}: ConstellationEdgeProps): React.JSX.Element {
	const length = Math.hypot(x2 - x1, y2 - y1)

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: interpolate(progress.value, [0, 1], [length, 0]),
		opacity: interpolate(progress.value, [0, 0.15, 1], [0, 0.35, 0.55])
	}))

	return (
		<AnimatedLine
			x1={x1}
			y1={y1}
			x2={x2}
			y2={y2}
			stroke={stroke}
			strokeWidth={1}
			strokeDasharray={`${length}`}
			animatedProps={animatedProps}
		/>
	)
}

interface ConstellationNodeProps {
	cx: number
	cy: number
	progress: SharedValue<number>
	fill: string
	delay: number
}

function ConstellationNode({
	cx,
	cy,
	progress,
	fill,
	delay
}: ConstellationNodeProps): React.JSX.Element {
	const animatedProps = useAnimatedProps(() => {
		const local = interpolate(
			progress.value,
			[delay, Math.min(delay + 0.35, 1)],
			[0, 1],
			'clamp'
		)
		return {
			r: interpolate(local, [0, 1], [0, 3.5]),
			opacity: interpolate(local, [0, 0.4, 1], [0, 0.5, 0.9])
		}
	})

	return (
		<AnimatedCircle cx={cx} cy={cy} fill={fill} animatedProps={animatedProps} />
	)
}

export function OnboardingAmbient({
	masterOpacity,
	networkProgress
}: OnboardingAmbientProps): React.JSX.Element {
	const { width, height } = useWindowDimensions()
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const secondaryColor = String(
		toColor(useCSSVariable('--color-secondary')) ?? '#0a61be'
	)
	const neulandGreen = String(
		toColor(useCSSVariable('--color-neuland-green')) ?? '#00ff3c'
	)

	const containerStyle = useAnimatedStyle(() => ({
		opacity: masterOpacity.value
	}))

	const nodePoints = NODES.map((node) => ({
		x: node.x * width,
		y: node.y * height
	}))

	return (
		<Animated.View
			pointerEvents="none"
			style={[StyleSheet.absoluteFill, containerStyle]}
		>
			<FloatingOrb
				colors={[`${primaryColor}55`, `${primaryColor}10`]}
				size={width * 0.55}
				initialX={-width * 0.12}
				initialY={height * 0.02}
				driftDuration={5200}
			/>
			<FloatingOrb
				colors={[`${secondaryColor}40`, `${secondaryColor}08`]}
				size={width * 0.42}
				initialX={width * 0.58}
				initialY={height * 0.52}
				driftDuration={6400}
			/>
			<FloatingOrb
				colors={[`${neulandGreen}28`, `${neulandGreen}05`]}
				size={width * 0.34}
				initialX={width * 0.08}
				initialY={height * 0.58}
				driftDuration={4800}
			/>

			<Svg width={width} height={height} style={StyleSheet.absoluteFill}>
				{EDGES.map(([from, to]) => (
					<ConstellationEdge
						key={`${from}-${to}`}
						x1={nodePoints[from].x}
						y1={nodePoints[from].y}
						x2={nodePoints[to].x}
						y2={nodePoints[to].y}
						progress={networkProgress}
						stroke={primaryColor}
					/>
				))}
				{nodePoints.map((point, index) => (
					<ConstellationNode
						key={NODES[index].x}
						cx={point.x}
						cy={point.y}
						progress={networkProgress}
						fill={primaryColor}
						delay={index * 0.08}
					/>
				))}
			</Svg>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	orbBlur: {
		flex: 1,
		borderRadius: 9999,
		overflow: 'hidden'
	}
})
