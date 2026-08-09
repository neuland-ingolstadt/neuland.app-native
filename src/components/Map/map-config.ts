export const MAP_STYLE_URLS = {
	light: 'https://tile.neuland.app/styles/light/style.json',
	dark: 'https://tile.neuland.app/styles/dark/style.json'
} as const

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
	focusLatitudeOffset: -0.0003,
	resetDuration: 400,
	focusDuration: 500
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
	backgroundColor: string
) {
	return {
		allRooms: {
			'fill-antialias': true,
			'fill-color': isDark
				? MAP_COLORS.roomFill.dark
				: MAP_COLORS.roomFill.light,
			'fill-opacity': MAP_COLORS.roomFillOpacity
		},
		allRoomsOutline: {
			'line-color': isDark
				? MAP_COLORS.roomOutline.dark
				: MAP_COLORS.roomOutline.light,
			'line-width': MAP_COLORS.roomOutlineWidth
		},
		availableRooms: {
			'fill-antialias': true,
			'fill-color': primaryColor,
			'fill-opacity': MAP_COLORS.availableRoomFillOpacity
		},
		availableRoomsOutline: {
			'line-color': primaryColor,
			'line-width': MAP_COLORS.availableRoomOutlineWidth
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
