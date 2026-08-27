import type { FeatureCollection } from 'geojson'

export const MAP_STYLE_URLS = {
	light: 'https://tile.neuland.app/styles/light/style.json',
	dark: 'https://tile.neuland.app/styles/dark/style.json'
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
		selectedRoom: 'clickedElementSource',
		selectedOverlay: 'selectedOverlaySource'
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
		selectedRoomMarker: 'clickedElementMarker',
		selectedFill: 'selectedRoomFill',
		selectedOutline: 'selectedRoomOutline'
	}
} as const

export { MAP_CAMERA } from '@/utils/map-constants'

export const ROOM_PRESS_HITBOX = {
	top: 2,
	right: 2,
	bottom: 2,
	left: 2
} as const

export const GEOJSON_TOLERANCE = 0

export const FLOOR_OVERLAY_FADE_MS = 200

export const MAP_COLORS = {
	roomFill: {
		light: '#a4a4a4',
		dark: '#6a7178'
	},
	roomOutline: {
		light: '#8e8e8e',
		dark: '#2d3035'
	},
	roomFillOpacity: 0.1,
	availableRoomFillOpacity: 0.2,
	roomOutlineWidth: 2.3,
	availableRoomOutlineWidth: 2.4,
	buildingLabelSize: 14,
	buildingLabelHaloWidth: 1,
	selectedRoomMarkerSize: 0.17,
	selectedFillOpacity: 0.38,
	selectedFillOpacityPop: 0.58,
	selectedOutlineWidth: 2.8,
	selectedOutlineWidthPop: 3.4
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
	selectionColor = primaryColor
) {
	const overlayFadeTransition = {
		duration: overlayFadeDuration,
		delay: 0
	} as const

	return {
		allRooms: {
			'fill-antialias': true,
			'fill-color': isDark
				? MAP_COLORS.roomFill.dark
				: MAP_COLORS.roomFill.light,
			'fill-opacity': MAP_COLORS.roomFillOpacity * overlayOpacity,
			'fill-opacity-transition': overlayFadeTransition
		},
		allRoomsOutline: {
			'line-color': isDark
				? MAP_COLORS.roomOutline.dark
				: MAP_COLORS.roomOutline.light,
			'line-width': MAP_COLORS.roomOutlineWidth,
			'line-opacity': overlayOpacity,
			'line-opacity-transition': overlayFadeTransition
		},
		availableRooms: {
			'fill-antialias': true,
			'fill-color': primaryColor,
			'fill-opacity': MAP_COLORS.availableRoomFillOpacity * overlayOpacity,
			'fill-opacity-transition': overlayFadeTransition
		},
		availableRoomsOutline: {
			'line-color': primaryColor,
			'line-width': MAP_COLORS.availableRoomOutlineWidth,
			'line-opacity': overlayOpacity,
			'line-opacity-transition': overlayFadeTransition
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
		selectedRoomMarker: {
			layout: {
				'icon-image': 'map-marker',
				'icon-size': MAP_COLORS.selectedRoomMarkerSize,
				'icon-anchor': 'bottom' as const,
				'icon-allow-overlap': true
			},
			paint: { 'icon-color': selectionColor }
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
			'line-color': selectionColor,
			'line-width': selectionPop
				? MAP_COLORS.selectedOutlineWidthPop
				: MAP_COLORS.selectedOutlineWidth,
			'line-width-transition': SELECTED_POP_TRANSITION
		}
	}
}
