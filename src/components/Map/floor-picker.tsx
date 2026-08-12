import * as Haptics from 'expo-haptics'
import type React from 'react'
import { memo, use, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useCSSVariable, useUniwind } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { MapContext } from '@/contexts/map'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'
import {
	CELL,
	CLOSE,
	CONTAINER_TOP,
	EXPAND_SPRING,
	floorLabel,
	GAP,
	PICKER_TOP,
	SNAP_SPRING
} from './floor-picker-layout'
import { FloorRow } from './floor-row'

interface FloorPickerProps {
	floors: string[]
	showAllFloors: boolean
	toggleShowAllFloors: () => void
	locationPermissionGranted?: boolean
	onLocate?: () => void
}

function clamp(value: number, min: number, max: number): number {
	'worklet'
	return Math.min(max, Math.max(min, value))
}

function rubberBand(overscroll: number, dimension: number): number {
	'worklet'
	if (dimension <= 0) {
		return 0
	}
	return (overscroll * dimension) / (dimension + Math.abs(overscroll) * 0.65)
}

function rubberClamp(
	value: number,
	min: number,
	max: number,
	dimension: number
): number {
	'worklet'
	if (value < min) {
		return min - rubberBand(min - value, dimension)
	}
	if (value > max) {
		return max + rubberBand(value - max, dimension)
	}
	return value
}

function triggerSelectionHaptic(): void {
	if (Platform.OS !== 'web') {
		void Haptics.selectionAsync()
	}
}

function triggerTickHaptic(): void {
	if (Platform.OS !== 'web') {
		void Haptics.selectionAsync()
	}
}

function triggerToggleHaptic(): void {
	if (Platform.OS !== 'web') {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
	}
}

function triggerResetHaptic(): void {
	if (Platform.OS !== 'web') {
		void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
	}
}

const FloorPicker = ({
	floors,
	showAllFloors,
	toggleShowAllFloors,
	locationPermissionGranted = false,
	onLocate = () => {}
}: FloorPickerProps): React.JSX.Element => {
	const { currentFloor, setCurrentFloor } = use(MapContext)
	const { t } = useTranslation(['accessibility'])
	const { theme } = useUniwind()
	const isDark = theme === 'dark'
	const cardColor = String(toColor(useCSSVariable('--color-card')) ?? '#ffffff')
	const borderColor = String(
		toColor(useCSSVariable('--color-border')) ?? '#d8d8d8'
	)
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const textColor = String(toColor(useCSSVariable('--color-text')) ?? '#1c1c30')
	const labelColor = toColor(useCSSVariable('--color-label'))
	const contrastColor = getContrastColor(primaryColor)
	const xIconColor = isDark ? '#b6b6b6ff' : '#4a4a4aff'
	const shadow = isDark
		? '0 4 14 0 rgba(0, 0, 0, 0.45)'
		: '0 4 14 0 rgba(0, 0, 0, 0.12)'

	const floorCount = Math.max(floors.length, 1)
	const currentIndex = Math.max(0, floors.indexOf(currentFloor?.floor ?? 'EG'))
	const didInit = useRef(false)

	const expanded = useSharedValue(showAllFloors ? 1 : 0)
	const scrollY = useSharedValue(currentIndex * CELL)
	const highlightY = useSharedValue(currentIndex * CELL)
	const startY = useSharedValue(currentIndex * CELL)
	const lastTickIndex = useSharedValue(currentIndex)
	const floorCountSV = useSharedValue(floorCount)

	useEffect(() => {
		floorCountSV.set(floorCount)
	}, [floorCount, floorCountSV])

	useEffect(() => {
		expanded.set(withSpring(showAllFloors ? 1 : 0, EXPAND_SPRING))
	}, [expanded, showAllFloors])

	useEffect(() => {
		const target = currentIndex * CELL
		if (!didInit.current) {
			didInit.current = true
			scrollY.set(target)
			highlightY.set(target)
			return
		}
		if (Math.abs(scrollY.get() - target) > 1) {
			scrollY.set(withSpring(target, SNAP_SPRING))
		}
		highlightY.set(withSpring(target, SNAP_SPRING))
	}, [currentIndex, highlightY, scrollY])

	const selectFloorByIndex = useCallback(
		(index: number) => {
			const floor = floors[index]
			if (floor == null || floor === currentFloor?.floor) {
				return
			}
			setCurrentFloor({ floor, manual: true })
		},
		[currentFloor?.floor, floors, setCurrentFloor]
	)

	const handleToggle = useCallback(() => {
		triggerToggleHaptic()
		toggleShowAllFloors()
	}, [toggleShowAllFloors])

	const resetToGroundFloor = useCallback(() => {
		if (currentFloor?.floor === 'EG') {
			return
		}
		setCurrentFloor({ floor: 'EG', manual: true })
	}, [currentFloor?.floor, setCurrentFloor])

	const handleSelectFloor = useCallback(
		(floor: string) => {
			if (floor === currentFloor?.floor) {
				handleToggle()
				return
			}
			triggerSelectionHaptic()
			setCurrentFloor({ floor, manual: true })
			if (showAllFloors) {
				toggleShowAllFloors()
			}
		},
		[
			currentFloor?.floor,
			handleToggle,
			setCurrentFloor,
			showAllFloors,
			toggleShowAllFloors
		]
	)

	const pan = Gesture.Pan()
		.enabled(Platform.OS !== 'web' && !showAllFloors && floors.length > 1)
		.activeOffsetY([-8, 8])
		.failOffsetX([-24, 24])
		.maxPointers(1)
		.onBegin(() => {
			startY.set(scrollY.get())
			lastTickIndex.set(Math.round(scrollY.get() / CELL))
		})
		.onUpdate((event) => {
			const maxScroll = Math.max(floorCountSV.get() - 1, 0) * CELL
			scrollY.set(
				rubberClamp(startY.get() + event.translationY, 0, maxScroll, CELL)
			)
			const index = Math.round(scrollY.get() / CELL)
			if (
				index !== lastTickIndex.get() &&
				index >= 0 &&
				index < floorCountSV.get()
			) {
				lastTickIndex.set(index)
				scheduleOnRN(triggerTickHaptic)
			}
		})
		.onEnd((event) => {
			const maxIndex = Math.max(floorCountSV.get() - 1, 0)
			const projected = scrollY.get() + event.velocityY * 0.14
			const next = clamp(Math.round(projected / CELL), 0, maxIndex)
			scrollY.set(withSpring(next * CELL, SNAP_SPRING))
			if (next !== lastTickIndex.get()) {
				lastTickIndex.set(next)
				scheduleOnRN(triggerTickHaptic)
			}
			scheduleOnRN(selectFloorByIndex, next)
		})

	const tap = Gesture.Tap()
		.enabled(Platform.OS !== 'web' && !showAllFloors)
		.onEnd((_event, success) => {
			if (success) {
				scheduleOnRN(handleToggle)
			}
		})

	const longPress = Gesture.LongPress()
		.enabled(
			Platform.OS !== 'web' && !showAllFloors && currentFloor?.floor !== 'EG'
		)
		.minDuration(400)
		.maxDistance(12)
		.onStart(() => {
			scheduleOnRN(triggerResetHaptic)
			scheduleOnRN(resetToGroundFloor)
		})

	const collapsedGestures = Gesture.Exclusive(Gesture.Race(pan, longPress), tap)

	const closeStyle = useAnimatedStyle(() => ({
		width: CELL,
		height: CLOSE,
		opacity: expanded.get(),
		transform: [
			{
				translateY: interpolate(
					expanded.get(),
					[0, 1],
					[8, 0],
					Extrapolation.CLAMP
				)
			}
		]
	}))

	const clipStyle = useAnimatedStyle(() => {
		const listHeight = Math.max(floorCountSV.get(), 1) * CELL
		return {
			width: CELL,
			height: interpolate(
				expanded.get(),
				[0, 1],
				[CELL, listHeight],
				Extrapolation.CLAMP
			)
		}
	})

	const listStyle = useAnimatedStyle(() => ({
		width: '100%',
		transform: [
			{
				translateY: interpolate(
					expanded.get(),
					[0, 1],
					[-scrollY.get(), 0],
					Extrapolation.CLAMP
				)
			}
		]
	}))

	const pillStyle = useAnimatedStyle(() => ({
		width: '100%',
		height: CELL,
		opacity: interpolate(
			expanded.get(),
			[0.15, 0.7],
			[0, 1],
			Extrapolation.CLAMP
		),
		transform: [{ translateY: highlightY.get() }]
	}))

	const locateStyle = useAnimatedStyle(() => {
		const pickerHeight = interpolate(
			expanded.get(),
			[0, 1],
			[CELL, Math.max(floorCountSV.get(), 1) * CELL],
			Extrapolation.CLAMP
		)
		return {
			width: CELL,
			height: CELL,
			top: PICKER_TOP + pickerHeight + GAP
		}
	})

	const locateBackground = isDark ? 'rgb(18, 18, 18)' : 'rgb(255, 255, 255)'
	const containerHeight =
		PICKER_TOP + floorCount * CELL + (Platform.OS === 'web' ? 0 : GAP + CELL)

	const floorPicker = (
		<Animated.View
			testID="map-floor-picker"
			collapsable={false}
			hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
			accessibilityRole="adjustable"
			accessibilityLabel={t('map.floorPicker')}
			accessibilityHint={t('map.floorPickerHint')}
			accessibilityValue={{
				text: floorLabel(currentFloor?.floor ?? 'EG')
			}}
			accessibilityState={{ expanded: showAllFloors }}
			accessibilityActions={
				floors.length > 1
					? [{ name: 'increment' }, { name: 'decrement' }]
					: undefined
			}
			onAccessibilityAction={(event) => {
				if (floors.length === 0) {
					return
				}
				const delta = event.nativeEvent.actionName === 'increment' ? -1 : 1
				const next = Math.min(
					floors.length - 1,
					Math.max(0, currentIndex + delta)
				)
				selectFloorByIndex(next)
			}}
			className="absolute overflow-hidden rounded-[10px] border"
			style={[
				{
					top: PICKER_TOP,
					width: CELL,
					borderColor,
					backgroundColor: cardColor,
					borderCurve: 'continuous',
					boxShadow: shadow
				},
				clipStyle
			]}
		>
			<Animated.View
				pointerEvents={showAllFloors ? 'auto' : 'none'}
				style={listStyle}
			>
				<Animated.View
					pointerEvents="none"
					className="absolute left-0 right-0"
					style={[
						{
							height: CELL,
							backgroundColor: primaryColor
						},
						pillStyle
					]}
				/>
				{floors.map((floor, index) => (
					<FloorRow
						key={floor}
						floor={floor}
						isCurrent={currentFloor?.floor === floor}
						isLast={index === floors.length - 1}
						interactive={showAllFloors}
						borderColor={borderColor}
						cardColor={cardColor}
						textColor={textColor}
						contrastColor={contrastColor}
						onSelect={handleSelectFloor}
					/>
				))}
			</Animated.View>
			{Platform.OS === 'web' && !showAllFloors && (
				<Pressable
					testID="map-floor-picker-open"
					onPress={handleToggle}
					accessibilityRole="button"
					accessibilityLabel={t('map.floorPicker')}
					accessibilityHint={t('map.floorPickerHint')}
					className="absolute inset-0 cursor-pointer"
				/>
			)}
		</Animated.View>
	)

	return (
		<View
			className="absolute right-0 z-20 mx-2"
			pointerEvents="box-none"
			style={{
				top: CONTAINER_TOP,
				width: CELL,
				height: containerHeight,
				overflow: 'visible'
			}}
		>
			<Animated.View
				pointerEvents={showAllFloors ? 'auto' : 'none'}
				className="absolute left-0 top-0"
				style={closeStyle}
			>
				<Pressable
					testID="map-floor-picker-close"
					onPress={handleToggle}
					accessibilityRole="button"
					accessibilityLabel={t('button.close')}
					className="items-center justify-center"
					style={{ height: CLOSE, width: CELL }}
				>
					<PlatformIcon
						ios={{
							name: 'xmark.circle.fill',
							size: 26
						}}
						android={{
							name: 'cancel',
							size: 26
						}}
						web={{
							name: 'X',
							size: 26
						}}
						style={{ color: xIconColor }}
					/>
				</Pressable>
			</Animated.View>

			{Platform.OS === 'web' ? (
				floorPicker
			) : (
				<GestureDetector gesture={collapsedGestures}>
					{floorPicker}
				</GestureDetector>
			)}

			{Platform.OS !== 'web' && (
				<Animated.View className="absolute right-0" style={locateStyle}>
					<Pressable
						testID="map-current-location"
						onPress={onLocate}
						disabled={!locationPermissionGranted}
						accessibilityState={{ disabled: !locationPermissionGranted }}
						accessibilityLabel={t('map.centerOnCurrentLocation')}
					>
						<View
							className="items-center justify-center rounded-[10px] border"
							style={{
								height: CELL,
								width: CELL,
								borderColor,
								backgroundColor: locateBackground,
								borderCurve: 'continuous',
								boxShadow: shadow
							}}
						>
							<PlatformIcon
								style={{
									color: labelColor,
									opacity: locationPermissionGranted ? 1 : 0.5
								}}
								ios={{
									name: 'location.fill',
									size: 18
								}}
								android={{
									name: 'near_me',
									size: 21,
									variant: 'outlined'
								}}
								web={{
									name: 'Locate',
									size: 18
								}}
							/>
						</View>
					</Pressable>
				</Animated.View>
			)}
		</View>
	)
}

export default memo(FloorPicker)
