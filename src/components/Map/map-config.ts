export const MAP_STYLE_URLS = {
	light: 'https://tile.neuland.app/styles/light/style.json',
	dark: 'https://tile.neuland.app/styles/dark/style.json'
} as const

export type MapMode = keyof typeof MAP_STYLE_URLS

export const MAP_IDS = {
	sources: {
		allRooms: 'allRoomsSource',
		availableRooms: 'availableRoomsSource',
		buildingLabels: 'buildingLettersSource',
		selectedRoom: 'clickedElementSource'
	},
	layers: {
		allRoomsFill: 'allRoomsFill',
		allRoomsOutline: 'allRoomsOutline',
		availableRoomsFill: 'availableRoomsFill',
		availableRoomsOutline: 'availableRoomsOutline',
		buildingLabels: 'buildingLettersLayer',
		selectedRoomMarker: 'clickedElementMarker'
	}
} as const

export const MAP_CAMERA = {
	initialZoom: 16.5,
	focusZoom: 17,
	minZoom: 14,
	maxZoom: 19,
	focusPaddingGap: 12,
	resetDuration: 400,
	focusDuration: 500
} as const

export const FLOOR_OVERLAY_FADE_MS = 180
export const FLOOR_OVERLAY_FADE_HALF_MS = FLOOR_OVERLAY_FADE_MS / 2

const FLOOR_OVERLAY_FADE_TRANSITION = {
	duration: FLOOR_OVERLAY_FADE_HALF_MS,
	delay: 0
} as const

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
	selectedRoomMarkerSize: 0.17
} as const

export function getMapLayerStyles(
	isDark: boolean,
	primaryColor: string,
	labelColor: string,
	backgroundColor: string,
	overlayOpacity = 1
) {
	return {
		allRooms: {
			'fill-antialias': true,
			'fill-color': isDark
				? MAP_COLORS.roomFill.dark
				: MAP_COLORS.roomFill.light,
			'fill-opacity': MAP_COLORS.roomFillOpacity * overlayOpacity,
			'fill-opacity-transition': FLOOR_OVERLAY_FADE_TRANSITION
		},
		allRoomsOutline: {
			'line-color': isDark
				? MAP_COLORS.roomOutline.dark
				: MAP_COLORS.roomOutline.light,
			'line-width': MAP_COLORS.roomOutlineWidth,
			'line-opacity': overlayOpacity,
			'line-opacity-transition': FLOOR_OVERLAY_FADE_TRANSITION
		},
		availableRooms: {
			'fill-antialias': true,
			'fill-color': primaryColor,
			'fill-opacity': MAP_COLORS.availableRoomFillOpacity * overlayOpacity,
			'fill-opacity-transition': FLOOR_OVERLAY_FADE_TRANSITION
		},
		availableRoomsOutline: {
			'line-color': primaryColor,
			'line-width': MAP_COLORS.availableRoomOutlineWidth,
			'line-opacity': overlayOpacity,
			'line-opacity-transition': FLOOR_OVERLAY_FADE_TRANSITION
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
			paint: { 'icon-color': primaryColor }
		}
	}
}
