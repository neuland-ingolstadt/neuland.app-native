import { describe, expect, it } from 'bun:test'
import {
	clipRouteProgressGeoJson,
	cumulativeM,
	easeOutCubic,
	routeDrawAnimationKey,
	shouldPlayRouteDrawAnimation,
	sliceByDistance
} from '@/utils/indoor-nav/route-line-draw'

function lineCoordCount(feature: GeoJSON.Feature | undefined): number {
	const geom = feature?.geometry
	if (geom?.type !== 'LineString') {
		return 0
	}
	return geom.coordinates.length
}

function lineCoordinates(
	feature: GeoJSON.Feature | undefined
): GeoJSON.Position[] {
	const geom = feature?.geometry
	if (geom?.type !== 'LineString') {
		return []
	}
	return geom.coordinates
}

describe('route-line-draw', () => {
	it('easeOutCubic ends at 1', () => {
		expect(easeOutCubic(0)).toBe(0)
		expect(easeOutCubic(1)).toBe(1)
	})

	it('sliceByDistance reveals along a short segment', () => {
		const coords: [number, number][] = [
			[0, 0],
			[0, 0.001]
		]
		const cum = cumulativeM(coords)
		const half = sliceByDistance(coords, cum, (cum[1] ?? 0) * 0.5)
		expect(half.length).toBe(2)
		expect(half[1]?.[1]).toBeGreaterThan(0)
		expect(half[1]?.[1]).toBeLessThan(0.001)
	})

	it('clipRouteProgressGeoJson shortens lines at partial progress', () => {
		const fc: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: { state: 'current', floor: 'EG', stepIndex: 0 },
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43, 48.76],
							[11.431, 48.761]
						]
					}
				}
			]
		}
		const fullLen = lineCoordCount(fc.features[0])
		const clipped = clipRouteProgressGeoJson(fc, 0.5)
		expect(lineCoordCount(clipped.features[0])).toBe(fullLen)
		const startDot = clipRouteProgressGeoJson(fc, 0)
		expect(startDot.features.length).toBe(1)
		const dotCoords = lineCoordinates(startDot.features[0])
		expect(dotCoords[0]).toEqual(dotCoords[1])
	})

	it('keeps done legs fully drawn while only the current leg animates', () => {
		const fc: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: { state: 'done', floor: 'EG', stepIndex: 0 },
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43, 48.76],
							[11.431, 48.761]
						]
					}
				},
				{
					type: 'Feature',
					properties: { state: 'current', floor: 'EG', stepIndex: 1 },
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.431, 48.761],
							[11.432, 48.762]
						]
					}
				}
			]
		}
		const doneLen = lineCoordCount(fc.features[0])
		const atStart = clipRouteProgressGeoJson(fc, 0)
		expect(atStart.features).toHaveLength(2)
		expect(lineCoordCount(atStart.features[0])).toBe(doneLen)
		const currentDot = lineCoordinates(atStart.features[1])
		expect(currentDot[0]).toEqual(currentDot[1])
		const mid = clipRouteProgressGeoJson(fc, 0.5)
		expect(lineCoordCount(mid.features[0])).toBe(doneLen)
		expect(lineCoordCount(mid.features[1])).toBe(2)
	})

	it('keeps draw key stable when all walk chunks are done (arrival)', () => {
		const active: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: { state: 'done', floor: '3', stepIndex: 3 },
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43, 48.76],
							[11.431, 48.761]
						]
					}
				},
				{
					type: 'Feature',
					properties: { state: 'current', floor: '3', stepIndex: 4 },
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.431, 48.761],
							[11.432, 48.762]
						]
					}
				}
			]
		}
		const arrived: GeoJSON.FeatureCollection = {
			type: 'FeatureCollection',
			features: active.features.map((feature) => ({
				...feature,
				properties: { ...feature.properties, state: 'done' }
			}))
		}
		expect(routeDrawAnimationKey(active)).toBe('3:4:2')
		expect(routeDrawAnimationKey(arrived)).toBe('3:4:2')
		expect(shouldPlayRouteDrawAnimation(active)).toBe(true)
		expect(shouldPlayRouteDrawAnimation(arrived)).toBe(false)
	})
})
