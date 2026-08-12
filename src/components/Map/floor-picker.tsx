import * as Haptics from 'expo-haptics'
import type React from 'react'
import { memo, use, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Extrapolation,
	interpolate,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withSpring
} from 'react-native-reanimated'
import { useCSSVariable, useUniwind } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { MapContext } from '@/contexts/map'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

const CELL = 38
const GAP = 5
const CLOSE = 38
const PICKER_TOP = CLOSE + GAP
const CONTAINER_TOP = 110 - PICKER_TOP

const EXPAND_SPRING = { damping: 18, stiffness: 220, mass: 0.8 }
const SNAP_SPRING = { damping: 24, stiffness: 280, mass: 0.7 }

interface FloorPickerProps {
	floors: string[]
	showAllFloors: boolean
	toggleShowAllFloors: () => void
	locationPermissionGranted?: boolean
	onLocate?: () => void
}

interface FloorRowProps {
	floor: string
	isCurrent: boolean
	isLast: boolean
	interactive: boolean
	borderColor: string
	cardColor: string
	textColor: string
	contrastColor: string
	onSelect: (floor: string) => void
}

function floorLabel(floor: string): string {
	return floor === 'EG' ? '0' : floor
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

const FloorRow = memo(function FloorRow({
	floor,
	isCurrent,
	isLast,
	interactive,
	borderColor,
	cardColor,
	textColor,
	contrastColor,
	onSelect
}: FloorRowProps): React.JSX.Element {
	return (
		<Pressable
			testID={`map-floor-${floor}`}
			onPress={() => {
				onSelect(floor)
			}}
			disabled={!interactive}
			accessibilityRole="button"
			accessibilityState={{ selected: isCurrent }}
			accessibilityLabel={floorLabel(floor)}
			className="items-center justify-center"
			style={{
				height: CELL,
				width: CELL,
				backgroundColor: isCurrent && interactive ? 'transparent' : cardColor,
				borderBottomColor: borderColor,
				borderBottomWidth: isLast || !interactive ? 0 : 1
			}}
		>
			<Text
				className="font-medium text-[15px]"
				style={{
					color: isCurrent && interactive ? contrastColor : textColor,
					fontVariant: ['tabular-nums']
				}}
			>
				{floorLabel(floor)}
			</Text>
		</Pressable>
	)
})

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
		floorCountSV.value = floorCount
	}, [floorCount, floorCountSV])

	useEffect(() => {
		expanded.value = withSpring(showAllFloors ? 1 : 0, EXPAND_SPRING)
	}, [expanded, showAllFloors])

	useEffect(() => {
		const target = currentIndex * CELL
		if (!didInit.current) {
			didInit.current = true
			scrollY.value = target
			highlightY.value = target
			return
		}
		if (Math.abs(scrollY.value - target) > 1) {
			scrollY.value = withSpring(target, SNAP_SPRING)
		}
		highlightY.value = withSpring(target, SNAP_SPRING)
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

	const handleLongPress = useCallback(() => {
		if (currentFloor?.floor === 'EG') {
			handleToggle()
			return
		}
		setCurrentFloor({ floor: 'EG', manual: true })
		triggerSelectionHaptic()
	}, [currentFloor?.floor, handleToggle, setCurrentFloor])

	const handleSelectFloor = useCallback(
		(floor: string) => {
			if (floor === currentFloor?.floor) {
				handleToggle()
				return
			}
			triggerSelectionHaptic()
			setCurrentFloor({ floor, manual: true })
		},
		[currentFloor?.floor, handleToggle, setCurrentFloor]
	)

	const pan = Gesture.Pan()
		.enabled(!showAllFloors && floors.length > 1)
		.activeOffsetY([-8, 8])
		.failOffsetX([-24, 24])
		.maxPointers(1)
		.onBegin(() => {
			startY.value = scrollY.value
			lastTickIndex.value = Math.round(scrollY.value / CELL)
		})
		.onUpdate((event) => {
			const maxScroll = Math.max(floorCountSV.value - 1, 0) * CELL
			scrollY.value = rubberClamp(
				startY.value + event.translationY,
				0,
				maxScroll,
				CELL
			)
			const index = Math.round(scrollY.value / CELL)
			if (
				index !== lastTickIndex.value &&
				index >= 0 &&
				index < floorCountSV.value
			) {
				lastTickIndex.value = index
				runOnJS(triggerTickHaptic)()
			}
		})
		.onEnd((event) => {
			const maxIndex = Math.max(floorCountSV.value - 1, 0)
			const projected = scrollY.value + event.velocityY * 0.14
			const next = clamp(Math.round(projected / CELL), 0, maxIndex)
			scrollY.value = withSpring(next * CELL, SNAP_SPRING)
			if (next !== lastTickIndex.value) {
				lastTickIndex.value = next
				runOnJS(triggerTickHaptic)()
			}
			runOnJS(selectFloorByIndex)(next)
		})

	const tap = Gesture.Tap()
		.enabled(!showAllFloors)
		.onEnd((_event, success) => {
			if (success) {
				runOnJS(handleToggle)()
			}
		})

	const longPress = Gesture.LongPress()
		.enabled(!showAllFloors)
		.minDuration(450)
		.onStart(() => {
			runOnJS(handleLongPress)()
		})

	const collapsedGestures = Gesture.Exclusive(pan, longPress, tap)

	const closeStyle = useAnimatedStyle(() => ({
		width: CELL,
		height: CLOSE,
		opacity: expanded.value,
		transform: [
			{
				translateY: interpolate(
					expanded.value,
					[0, 1],
					[8, 0],
					Extrapolation.CLAMP
				)
			}
		]
	}))

	const clipStyle = useAnimatedStyle(() => {
		const listHeight = Math.max(floorCountSV.value, 1) * CELL
		return {
			width: CELL,
			height: interpolate(
				expanded.value,
				[0, 1],
				[CELL, listHeight],
				Extrapolation.CLAMP
			)
		}
	})

	const listStyle = useAnimatedStyle(() => ({
		width: CELL,
		transform: [
			{
				translateY: interpolate(
					expanded.value,
					[0, 1],
					[-scrollY.value, 0],
					Extrapolation.CLAMP
				)
			}
		]
	}))

	const pillStyle = useAnimatedStyle(() => ({
		width: CELL,
		height: CELL,
		opacity: interpolate(
			expanded.value,
			[0.15, 0.7],
			[0, 1],
			Extrapolation.CLAMP
		),
		transform: [{ translateY: highlightY.value }]
	}))

	const locateStyle = useAnimatedStyle(() => {
		const pickerHeight = interpolate(
			expanded.value,
			[0, 1],
			[CELL, Math.max(floorCountSV.value, 1) * CELL],
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

			<GestureDetector gesture={collapsedGestures}>
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
				</Animated.View>
			</GestureDetector>

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
