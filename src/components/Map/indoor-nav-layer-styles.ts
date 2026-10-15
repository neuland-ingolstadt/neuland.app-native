import { MAP_COLORS, type MapMode } from '@/components/Map/map-config'

const paintCache = new Map<
	string,
	ReturnType<typeof buildIndoorNavLayerPaints>
>()

const ROUTE_LINE_LAYOUT = {
	'line-join': 'round' as const,
	'line-cap': 'round' as const
}

function buildIndoorNavLayerPaints(primaryColor: string, mapMode: MapMode) {
	const stairsColor = MAP_COLORS.indoorStairsMono[mapMode]

	return {
		stairsFill: {
			'fill-color': stairsColor,
			'fill-opacity': MAP_COLORS.indoorStairsFillOpacity
		},
		stairsOutline: {
			'line-color': stairsColor,
			'line-width': MAP_COLORS.indoorStairsOutlineWidth,
			'line-opacity': 0.9
		},
		destinationRoomFill: {
			'fill-color': primaryColor,
			'fill-opacity': MAP_COLORS.indoorDestinationRoomFillOpacity
		},
		destinationRoomOutline: {
			'line-color': primaryColor,
			'line-width': MAP_COLORS.indoorDestinationRoomOutlineWidth,
			'line-opacity': 1
		},
		progressLineTodoLayout: {
			...ROUTE_LINE_LAYOUT,
			'line-dasharray': [...MAP_COLORS.indoorProgressTodoDash]
		},
		progressLineTodo: {
			'line-color': primaryColor,
			'line-opacity': MAP_COLORS.indoorProgressTodoOpacity,
			'line-width': MAP_COLORS.indoorRouteLineWidth
		},
		progressLine: {
			'line-color': [
				'match',
				['get', 'state'],
				'done',
				MAP_COLORS.indoorProgressDoneColor,
				primaryColor
			],
			'line-opacity': [
				'match',
				['get', 'state'],
				'done',
				MAP_COLORS.indoorProgressDoneOpacity,
				MAP_COLORS.indoorProgressCurrentOpacity
			],
			'line-width': [
				'match',
				['get', 'state'],
				'current',
				MAP_COLORS.indoorProgressCurrentWidth,
				MAP_COLORS.indoorRouteLineWidth
			]
		},
		progressLineLayout: ROUTE_LINE_LAYOUT,
		footpathsLine: {
			'line-color': MAP_COLORS.indoorProgressDoneColor,
			'line-opacity': 0.45,
			'line-width': 2
		},
		footpathsLineLayout: ROUTE_LINE_LAYOUT,
		ghostRoomExtrusion: {
			'fill-extrusion-color': MAP_COLORS.indoorGhostRoomExtrusion[mapMode],
			'fill-extrusion-height': ['coalesce', ['get', 'ghostHeight'], 1],
			'fill-extrusion-base': ['coalesce', ['get', 'ghostBase'], 0],
			'fill-extrusion-opacity': MAP_COLORS.indoorGhostRoomExtrusionOpacity,
			'fill-extrusion-vertical-gradient': true
		},
		ghostStairExtrusion: {
			'fill-extrusion-color': stairsColor,
			'fill-extrusion-height': ['coalesce', ['get', 'ghostHeight'], 5],
			'fill-extrusion-base': ['coalesce', ['get', 'ghostBase'], 0],
			'fill-extrusion-opacity': MAP_COLORS.indoorGhostStairExtrusionOpacity,
			'fill-extrusion-vertical-gradient': true
		}
	}
}

export function getIndoorNavLayerPaints(
	primaryColor: string,
	mapMode: MapMode
) {
	const key = `${mapMode}:${primaryColor}`
	const cached = paintCache.get(key)
	if (cached != null) {
		return cached
	}
	const paints = buildIndoorNavLayerPaints(primaryColor, mapMode)
	paintCache.set(key, paints)
	return paints
}
