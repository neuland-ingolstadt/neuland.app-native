import { MAP_COLORS, type MapMode } from '@/components/Map/map-config'

export function getIndoorNavLayerPaints(
	primaryColor: string,
	mapMode: MapMode
) {
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
		progressLine: {
			'line-color': [
				'match',
				['get', 'state'],
				'done',
				MAP_COLORS.indoorProgressDoneColor,
				'current',
				primaryColor,
				primaryColor
			],
			'line-opacity': [
				'match',
				['get', 'state'],
				'done',
				MAP_COLORS.indoorProgressDoneOpacity,
				'current',
				MAP_COLORS.indoorProgressCurrentOpacity,
				MAP_COLORS.indoorProgressTodoOpacity
			],
			'line-width': [
				'match',
				['get', 'state'],
				'current',
				MAP_COLORS.indoorProgressCurrentWidth,
				MAP_COLORS.indoorRouteLineWidth
			]
		},
		stepMarkers: {
			'circle-color': [
				'match',
				['get', 'kind'],
				'entry',
				MAP_COLORS.indoorEntranceColor,
				'destination',
				[
					'match',
					['get', 'state'],
					'current',
					primaryColor,
					MAP_COLORS.indoorDestinationColor
				],
				stairsColor
			],
			'circle-radius': MAP_COLORS.indoorStepMarkerRadius,
			'circle-opacity': [
				'match',
				['get', 'state'],
				'done',
				MAP_COLORS.indoorStepMarkerDoneOpacity,
				'current',
				MAP_COLORS.indoorStepMarkerCurrentOpacity,
				MAP_COLORS.indoorStepMarkerTodoOpacity
			],
			'circle-stroke-color': MAP_COLORS.indoorRouteHaloColor,
			'circle-stroke-width': 2
		},
		entrances: {
			'circle-color': MAP_COLORS.indoorEntranceColor,
			'circle-radius': MAP_COLORS.indoorEntranceRadius,
			'circle-opacity': 0.95
		}
	}
}
