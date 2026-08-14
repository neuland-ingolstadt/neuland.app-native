import type {
	BottomSheetProps,
	Detent,
	ModalBottomSheetProps,
	PositionChangeEventData
} from '@swmansion/react-native-bottom-sheet'
import { type ReactNode, useEffect, useMemo } from 'react'
import {
	type NativeSyntheticEvent,
	Pressable,
	StyleSheet,
	useWindowDimensions,
	View
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	type WithSpringConfig,
	withSpring
} from 'react-native-reanimated'

const SHEET_SPRING = {
	damping: 120,
	stiffness: 900,
	mass: 4,
	overshootClamping: true
} as const satisfies WithSpringConfig

export type {
	BottomSheetProps,
	Detent,
	ModalBottomSheetProps,
	PositionChangeEventData
}

export function programmatic(
	value: Exclude<Detent, { value: unknown }>
): Detent {
	return { value, programmatic: true }
}

function isProgrammaticDetent(detent: Detent | undefined): boolean {
	return (
		typeof detent === 'object' &&
		detent != null &&
		'programmatic' in detent &&
		detent.programmatic === true
	)
}

function detentToHeight(detent: Detent, maxHeight: number): number {
	if (typeof detent === 'number') {
		return detent
	}
	if (detent === 'content') {
		return maxHeight * 0.5
	}
	return detentToHeight(detent.value, maxHeight)
}

function snapToDetent(
	position: number,
	heights: number[],
	draggable: boolean[]
): number {
	'worklet'
	let nearest = 0
	let best = Number.POSITIVE_INFINITY
	for (let i = 0; i < heights.length; i++) {
		if (draggable[i] !== true) {
			continue
		}
		const distance = Math.abs(heights[i] - position)
		if (distance < best) {
			best = distance
			nearest = i
		}
	}
	return nearest
}

export function BottomSheetProvider({
	children
}: {
	children: ReactNode
}): React.JSX.Element {
	return <>{children}</>
}

export function BottomSheet({
	children,
	surface,
	style,
	detents = [0, 'content'],
	index,
	onIndexChange,
	onPositionChange
}: BottomSheetProps): React.JSX.Element {
	const { height: windowHeight } = useWindowDimensions()
	const heights = useMemo(
		() => detents.map((detent) => detentToHeight(detent, windowHeight)),
		[detents, windowHeight]
	)
	const draggable = useMemo(
		() => detents.map((detent) => !isProgrammaticDetent(detent)),
		[detents]
	)
	const heightSV = useSharedValue(heights[index] ?? 0)
	const startHeight = useSharedValue(heights[index] ?? 0)
	const collapsedHeight = heights[0] ?? 0
	const minHeight =
		heights.find((_, detentIndex) => draggable[detentIndex] === true) ??
		collapsedHeight
	const maxHeight = heights[heights.length - 1] ?? windowHeight

	useEffect(() => {
		heightSV.set(withSpring(heights[index] ?? 0, SHEET_SPRING))
	}, [heightSV, heights, index])

	useAnimatedReaction(
		() => heightSV.get(),
		(position) => {
			if (onPositionChange == null) {
				return
			}
			runOnJS(onPositionChange)({
				nativeEvent: { position, index }
			} as NativeSyntheticEvent<PositionChangeEventData>)
		}
	)

	const pan = Gesture.Pan()
		.onStart(() => {
			startHeight.set(heightSV.get())
		})
		.onUpdate((event) => {
			const next = Math.min(
				maxHeight,
				Math.max(minHeight, startHeight.get() - event.translationY)
			)
			heightSV.set(next)
		})
		.onEnd(() => {
			const nextIndex = snapToDetent(heightSV.get(), heights, draggable)
			heightSV.set(withSpring(heights[nextIndex] ?? 0, SHEET_SPRING))
			if (onIndexChange != null) {
				runOnJS(onIndexChange)(nextIndex)
			}
		})

	const sheetStyle = useAnimatedStyle(() => ({
		height: heightSV.get()
	}))

	return (
		<GestureDetector gesture={pan}>
			<Animated.View
				pointerEvents={index === 0 && collapsedHeight === 0 ? 'none' : 'auto'}
				style={[styles.sheet, style, sheetStyle]}
			>
				{surface}
				<View style={styles.content}>{children}</View>
			</Animated.View>
		</GestureDetector>
	)
}

export function ModalBottomSheet({
	children,
	index,
	onIndexChange,
	scrimColor = 'rgba(0,0,0,0.3)',
	...sheetProps
}: ModalBottomSheetProps): React.JSX.Element {
	const closed = index === 0

	return (
		<View
			pointerEvents={closed ? 'none' : 'auto'}
			style={StyleSheet.absoluteFill}
		>
			<Pressable
				onPress={() => onIndexChange?.(0)}
				style={[
					styles.scrim,
					{ backgroundColor: closed ? 'transparent' : scrimColor }
				]}
			/>
			<BottomSheet index={index} onIndexChange={onIndexChange} {...sheetProps}>
				{children}
			</BottomSheet>
		</View>
	)
}

const styles = StyleSheet.create({
	sheet: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		overflow: 'hidden',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30
	},
	content: {
		flex: 1
	},
	scrim: {
		...StyleSheet.absoluteFillObject
	}
})
