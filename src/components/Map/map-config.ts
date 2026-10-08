import type { ExpressionSpecification } from '@maplibre/maplibre-gl-style-spec'
import type { FeatureCollection } from 'geojson'
import { MAP_CAMERA } from '@/utils/map-constants'

export const MAP_STYLE_URLS = {
	light: 'https://tile.neuland.app/styles/light-3d/style.json',
	dark: 'https://tile.neuland.app/styles/dark-3d/style.json'
} as const

export const EMPTY_MAP_FEATURES: FeatureCollection = {
	type: 'FeatureCollection',
	features: []
}

export type MapMode = keyof typeof MAP_STYLE_URLS

export const MAP_IDS = {
	sources: {
		allRooms: 'allRoomsSource',
		allRoomsOutgoing: 'allRoomsOutgoingSource',
		availableRooms: 'availableRoomsSource',
		availableRoomsOutgoing: 'availableRoomsOutgoingSource',
		buildingLabels: 'buildingLettersSource',
		selectedOverlay: 'selectedOverlaySource',
		pickStartOverlay: 'pickStartOverlaySource',
		indoorProgress: 'indoorProgressSource',
		indoorStairs: 'indoorStairsSource',
		indoorDestinationRoom: 'indoorDestinationRoomSource',
		indoorGhostFloors: 'indoorGhostFloorsSource',
		indoorFootpaths: 'indoorFootpathsSource'
	},
	layers: {
		allRoomsFill: 'allRoomsFill',
		allRoomsOutgoingFill: 'allRoomsOutgoingFill',
		allRoomsOutline: 'allRoomsOutline',
		allRoomsOutgoingOutline: 'allRoomsOutgoingOutline',
		availableRoomsFill: 'availableRoomsFill',
		availableRoomsOutgoingFill: 'availableRoomsOutgoingFill',
		availableRoomsOutline: 'availableRoomsOutline',
		availableRoomsOutgoingOutline: 'availableRoomsOutgoingOutline',
		buildingLabels: 'buildingLettersLayer',
		selectedFill: 'selectedRoomFill',
		selectedOutline: 'selectedRoomOutline',
		pickStartFill: 'pickStartRoomFill',
		pickStartOutline: 'pickStartRoomOutline',
		indoorProgressLine: 'indoorProgressLine',
		indoorProgressLineTodo: 'indoorProgressLineTodo',
		indoorStairsFill: 'indoorStairsFill',
		indoorStairsOutline: 'indoorStairsOutline',
		indoorDestinationRoomFill: 'indoorDestinationRoomFill',
		indoorDestinationRoomOutline: 'indoorDestinationRoomOutline',
		indoorGhostRoomsExtrusion: 'indoorGhostRoomsExtrusion',
		indoorGhostStairsExtrusion: 'indoorGhostStairsExtrusion',
		indoorFootpathsLine: 'indoorFootpathsLine'
	}
} as const

export { MAP_CAMERA }

export const ROOM_PRESS_HITBOX = {
	top: 2,
	right: 2,
	bottom: 2,
	left: 2
} as const

export const GEOJSON_TOLERANCE = 0

export const FLOOR_OVERLAY_FADE_MS = 200

const MAP_CORRIDOR_MATCH: ExpressionSpecification = [
	'any',
	['>=', ['index-of', 'Corridor', ['coalesce', ['get', 'Funktion_en'], '']], 0],
	['>=', ['index-of', 'Hallway', ['coalesce', ['get', 'Funktion_en'], '']], 0],
	['>=', ['index-of', 'Stair', ['coalesce', ['get', 'Funktion_en'], '']], 0],
	['>=', ['index-of', 'Korridor', ['coalesce', ['get', 'Funktion_de'], '']], 0],
	['>=', ['index-of', 'Flur', ['coalesce', ['get', 'Funktion_de'], '']], 0],
	['>=', ['index-of', 'Gang', ['coalesce', ['get', 'Funktion_de'], '']], 0],
	[
		'>=',
		['index-of', 'Treppenhaus', ['coalesce', ['get', 'Funktion_de'], '']],
		0
	]
]

const MAP_LINE_OUTLINE_LAYOUT = {
	'line-join': 'round' as const,
	'line-cap': 'round' as const
}

export const MAP_COLORS = {
	roomFill: {
		light: '#fcfcfd',
		dark: '#7c8a9f'
	},
	/** Slightly different from rooms — halls, stairs, Treppenhaus (see MAP_CORRIDOR_MATCH). */
	corridorFill: {
		light: '#e2e4e8',
		dark: '#4a5870'
	},
	roomFillOpacity: {
		light: 0.68,
		dark: 0.29
	},
	corridorFillOpacity: {
		light: 0.5,
		dark: 0.42
	},
	roomOutline: {
		light: '#b3b3b3',
		dark: '#3d4552'
	},
	roomOutlineWidth: {
		light: 2,
		dark: 2
	},
	availableRoomFillOpacity: 0.12,
	buildingLabelSize: 14,
	buildingLabelHaloWidth: 1,
	selectedFillOpacity: 0.14,
	selectedFillOpacityPop: 0.22,
	selectedOutlineWidth: 1,
	selectedOutlineWidthPop: 1.25,
	indoorRouteHaloColor: '#ffffff',
	indoorRouteLineWidth: 4.25,
	indoorProgressDoneColor: '#8e8e8e',
	indoorProgressDoneOpacity: 0.55,
	indoorProgressCurrentOpacity: 1,
	indoorProgressCurrentWidth: 6,
	indoorProgressTodoOpacity: 0.72,
	indoorProgressTodoDash: [2, 1.75] as const,
	indoorStepMarkerBorderWidth: 2.5,
	indoorStepMarkerDoneIconOpacity: 0.85,
	indoorStepMarkerDoneSurface: {
		light: '#ececee',
		dark: '#3a3a3c'
	},
	indoorStepMarkerSize: 30,
	indoorStepMarkerIconSize: 16,
	indoorEntranceColor: '#18b91e',
	indoorStairsColor: '#990eda',
	indoorStairsMono: {
		light: '#000000',
		dark: '#ffffff'
	},
	indoorStairsFillOpacity: 0.35,
	indoorStairsOutlineWidth: 1.25,
	indoorDestinationRoomFillOpacity: 0.38,
	indoorDestinationRoomOutlineWidth: 2.8,
	indoorGhostRoomExtrusion: {
		light: '#b8c4d4',
		dark: '#5a6575'
	},
	indoorGhostRoomExtrusionOpacity: 0.28,
	indoorGhostStairExtrusionOpacity: 0.7,
	indoorFloorPlanDimFillFactor: 0.4,
	indoorFloorPlanDimLineFactor: 0.35
} as const

export const SELECTED_POP_HOLD_MS = 80
export const SELECTED_POP_TRANSITION_MS = 120

const SELECTED_POP_TRANSITION = {
	duration: SELECTED_POP_TRANSITION_MS,
	delay: 0
} as const

export function getMapLayerStyles(
	isDark: boolean,
	primaryColor: string,
	labelColor: string,
	backgroundColor: string,
	overlayOpacity = 1,
	overlayFadeDuration = FLOOR_OVERLAY_FADE_MS,
	selectionPop = false,
	selectionColor = primaryColor,
	floorPlanDimmed = false
) {
	const planDimFill = floorPlanDimmed
		? MAP_COLORS.indoorFloorPlanDimFillFactor
		: 1
	const planDimLine = floorPlanDimmed
		? MAP_COLORS.indoorFloorPlanDimLineFactor
		: 1
	const overlayFadeTransition = {
		duration: overlayFadeDuration,
		delay: 0
	} as const

	const roomFillColor = isDark
		? MAP_COLORS.roomFill.dark
		: MAP_COLORS.roomFill.light
	const corridorFillColor = isDark
		? MAP_COLORS.corridorFill.dark
		: MAP_COLORS.corridorFill.light
	const outlineColor = isDark
		? MAP_COLORS.roomOutline.dark
		: MAP_COLORS.roomOutline.light
	const roomFillOpacity = isDark
		? MAP_COLORS.roomFillOpacity.dark
		: MAP_COLORS.roomFillOpacity.light
	const corridorFillOpacity = isDark
		? MAP_COLORS.corridorFillOpacity.dark
		: MAP_COLORS.corridorFillOpacity.light
	const outlineWidth = isDark
		? MAP_COLORS.roomOutlineWidth.dark
		: MAP_COLORS.roomOutlineWidth.light

	const allRooms = {
		'fill-antialias': true,
		'fill-color': [
			'case',
			MAP_CORRIDOR_MATCH,
			corridorFillColor,
			roomFillColor
		] as ExpressionSpecification,
		'fill-opacity': [
			'*',
			overlayOpacity,
			planDimFill,
			['case', MAP_CORRIDOR_MATCH, corridorFillOpacity, roomFillOpacity]
		] as ExpressionSpecification,
		'fill-opacity-transition': overlayFadeTransition
	}

	const allRoomsOutline = {
		layout: MAP_LINE_OUTLINE_LAYOUT,
		paint: {
			'line-color': outlineColor,
			'line-width': outlineWidth,
			'line-opacity': [
				'*',
				overlayOpacity,
				planDimLine
			] as ExpressionSpecification,
			'line-opacity-transition': overlayFadeTransition
		}
	}

	return {
		allRooms,
		allRoomsOutline,
		availableRooms: {
			'fill-antialias': true,
			'fill-color': primaryColor,
			'fill-opacity': MAP_COLORS.availableRoomFillOpacity * overlayOpacity,
			'fill-opacity-transition': overlayFadeTransition
		},
		availableRoomsOutline: {
			layout: MAP_LINE_OUTLINE_LAYOUT,
			paint: {
				'line-color': primaryColor,
				'line-width': outlineWidth,
				'line-opacity': overlayOpacity,
				'line-opacity-transition': overlayFadeTransition
			}
		},
		buildingLabels: {
			layout: {
				'text-field': ['get', 'Raum'] as ['get', 'Raum'],
				'text-allow-overlap': true,
				'text-size': MAP_COLORS.buildingLabelSize
			},
			paint: {
				'text-color': labelColor,
				'text-halo-color': backgroundColor,
				'text-halo-width': MAP_COLORS.buildingLabelHaloWidth
			}
		},
		selectedFill: {
			'fill-antialias': true,
			'fill-color': selectionColor,
			'fill-opacity': selectionPop
				? MAP_COLORS.selectedFillOpacityPop
				: MAP_COLORS.selectedFillOpacity,
			'fill-opacity-transition': SELECTED_POP_TRANSITION
		},
		selectedOutline: {
			layout: MAP_LINE_OUTLINE_LAYOUT,
			paint: {
				'line-color': selectionColor,
				'line-width': selectionPop
					? MAP_COLORS.selectedOutlineWidthPop
					: MAP_COLORS.selectedOutlineWidth,
				'line-opacity': 0.88,
				'line-width-transition': SELECTED_POP_TRANSITION
			}
		},
		pickStartFill: {
			'fill-antialias': true,
			'fill-color': MAP_COLORS.indoorEntranceColor,
			'fill-opacity': MAP_COLORS.selectedFillOpacity
		},
		pickStartOutline: {
			layout: MAP_LINE_OUTLINE_LAYOUT,
			paint: {
				'line-color': MAP_COLORS.indoorEntranceColor,
				'line-width': MAP_COLORS.selectedOutlineWidth,
				'line-opacity': 0.9
			}
		}
	}
}
