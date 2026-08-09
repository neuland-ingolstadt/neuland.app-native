import type { Position } from 'geojson'
import type { MapCoordinate } from '@/types/map'
import { INGOLSTADT_CENTER } from './map-constants'

export function getCenter(rooms: Position[][][]): MapCoordinate {
	const getCenterPoint = (points: Position[][]): MapCoordinate => {
		const x = points[0].map((point: Position) => point[0])
		const y = points[0].map((point: Position) => point[1])
		const minX = Math.min(...x)
		const maxX = Math.max(...x)
		const minY = Math.min(...y)
		const maxY = Math.max(...y)
		return [(minX + maxX) / 2, (minY + maxY) / 2]
	}

	const centerPoints = rooms.reduce(
		(acc, room) => {
			const centerPoint = getCenterPoint(room)
			acc.lon += centerPoint[0]
			acc.lat += centerPoint[1]
			acc.count += 1
			return acc
		},
		{ lon: 0, lat: 0, count: 0 }
	)

	return [
		centerPoints.lon / centerPoints.count,
		centerPoints.lat / centerPoints.count
	]
}

export function getCenterSingle(
	coordinates: number[][][] | undefined
): MapCoordinate {
	if (
		coordinates == null ||
		coordinates.length === 0 ||
		coordinates[0]?.length === 0
	) {
		return INGOLSTADT_CENTER
	}
	const centerPoints = coordinates[0].reduce(
		(acc, coordinate) => {
			acc.lon += coordinate[0]
			acc.lat += coordinate[1]
			acc.count += 1
			return acc
		},
		{ lon: 0, lat: 0, count: 0 }
	)

	return [
		centerPoints.lon / centerPoints.count,
		centerPoints.lat / centerPoints.count
	]
}
