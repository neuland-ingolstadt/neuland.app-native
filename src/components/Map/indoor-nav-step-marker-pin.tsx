import {
	ArrowDown,
	ArrowUp,
	Check,
	CircleDot,
	DoorOpen,
	Flag,
	type LucideIcon
} from 'lucide-react-native'
import type React from 'react'
import { Platform, View } from 'react-native'
import { MAP_COLORS, type MapMode } from '@/components/Map/map-config'
import type { StepProgressState } from '@/utils/indoor-nav/journey-visualization'

export type IndoorNavStepMarkerKind =
	| 'entry'
	| 'exit'
	| 'stairs_up'
	| 'stairs_down'
	| 'stairs_arrive'
	| 'stairs_arrive_up'
	| 'stairs_arrive_down'
	| 'destination'
	| 'entrance'
	| 'start'

interface IndoorNavStepMarkerPinProps {
	kind: IndoorNavStepMarkerKind | string
	state: StepProgressState
	primaryColor: string
	mapMode: MapMode
}

function markerIconForKind(kind: string): LucideIcon {
	switch (kind) {
		case 'entry':
		case 'exit':
		case 'entrance':
			return DoorOpen
		case 'destination':
			return Flag
		case 'start':
			return CircleDot
		case 'stairs_up':
		case 'stairs_arrive_up':
			return ArrowUp
		case 'stairs_down':
		case 'stairs_arrive':
		case 'stairs_arrive_down':
			return ArrowDown
		default:
			return DoorOpen
	}
}

function markerIconColor(
	kind: string,
	state: StepProgressState,
	primaryColor: string,
	mapMode: MapMode
): string {
	if (state === 'done') {
		return MAP_COLORS.indoorProgressDoneColor
	}
	if (kind === 'entry' || kind === 'exit' || kind === 'entrance') {
		return MAP_COLORS.indoorEntranceColor
	}
	if (kind === 'destination' || kind === 'start') {
		return primaryColor
	}
	return MAP_COLORS.indoorStairsMono[mapMode]
}

function markerBorderColor(
	state: StepProgressState,
	primaryColor: string,
	mapMode: MapMode
): string {
	if (state === 'current') {
		return primaryColor
	}
	if (state === 'done') {
		return MAP_COLORS.indoorProgressDoneColor
	}
	return mapMode === 'dark'
		? MAP_COLORS.roomOutline.dark
		: MAP_COLORS.roomOutline.light
}

function markerSurfaceColor(
	state: StepProgressState,
	mapMode: MapMode
): string {
	if (state === 'done') {
		return MAP_COLORS.indoorStepMarkerDoneSurface[mapMode]
	}
	return mapMode === 'dark' ? 'rgb(28, 28, 30)' : 'rgb(255, 255, 255)'
}

const markerElevationStyle = Platform.select({
	ios: {
		shadowColor: '#000000',
		shadowOpacity: 0.22,
		shadowRadius: 2.5,
		shadowOffset: { width: 0, height: 1 }
	},
	android: {
		elevation: 3
	},
	default: {
		boxShadow: '0 1px 4px rgba(0, 0, 0, 0.22)'
	}
})

export function IndoorNavStepMarkerPin({
	kind,
	state,
	primaryColor,
	mapMode
}: IndoorNavStepMarkerPinProps): React.JSX.Element {
	const Icon = state === 'done' ? Check : markerIconForKind(kind)
	const size = MAP_COLORS.indoorStepMarkerSize
	const iconSize = MAP_COLORS.indoorStepMarkerIconSize
	const iconColor = markerIconColor(kind, state, primaryColor, mapMode)
	const borderWidth = MAP_COLORS.indoorStepMarkerBorderWidth
	const iconOpacity =
		state === 'done' ? MAP_COLORS.indoorStepMarkerDoneIconOpacity : 1

	return (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: markerSurfaceColor(state, mapMode),
				borderWidth,
				borderColor: markerBorderColor(state, primaryColor, mapMode),
				...markerElevationStyle
			}}
		>
			<Icon
				color={iconColor}
				size={iconSize}
				strokeWidth={2.25}
				opacity={iconOpacity}
			/>
		</View>
	)
}
