import { describe, expect, it } from 'bun:test'
import type { FeatureCollection } from 'geojson'
import { buildFootpathGraph, findFootpathRoute } from '../footpath-route'

const footpaths: FeatureCollection = {
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: { class: 'path' },
			geometry: {
				type: 'LineString',
				coordinates: [
					[11.431, 48.767],
					[11.432, 48.767],
					[11.433, 48.767]
				]
			}
		},
		{
			type: 'Feature',
			properties: { class: 'path' },
			geometry: {
				type: 'LineString',
				coordinates: [
					[11.432, 48.767],
					[11.432, 48.766]
				]
			}
		},
		// Near-miss endpoint that should link into the network
		{
			type: 'Feature',
			properties: { class: 'service' },
			geometry: {
				type: 'LineString',
				coordinates: [
					[11.4330003, 48.7670002],
					[11.434, 48.767]
				]
			}
		}
	]
}

describe('buildFootpathGraph', () => {
	it('links near-duplicate endpoints without moving path vertices', () => {
		const graph = buildFootpathGraph(footpaths)
		expect(graph.nodes.size).toBeGreaterThanOrEqual(5)
		expect(graph.edges.size).toBeGreaterThanOrEqual(4)
		// Exact source vertex is preserved (not averaged away).
		expect(graph.nodes.has('11.4320000,48.7670000')).toBe(true)
	})

	it('splits a crossed segment so T-junctions do not paint the unwalked stub', () => {
		const crossing: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.431, 48.767],
							[11.433, 48.767]
						]
					}
				},
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.432, 48.76705],
							[11.432, 48.7678]
						]
					}
				}
			]
		}
		const graph = buildFootpathGraph(crossing)
		const route = findFootpathRoute(graph, [11.431, 48.767], [11.432, 48.7678])
		expect(route).toBeDefined()
		if (route == null) {
			return
		}
		const paintsUnwalkedStub = route.coordinates.some(
			([lon, lat]) => lon > 11.4325 && Math.abs(lat - 48.767) < 0.0002
		)
		expect(paintsUnwalkedStub).toBe(false)
		expect(route.coordinates.at(-1)?.[1]).toBeCloseTo(48.7678, 4)
	})

	it('splits an X crossing with no shared vertices (no stub past the junction)', () => {
		const crossing: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.431, 48.767],
							[11.433, 48.767]
						]
					}
				},
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.432, 48.7665],
							[11.432, 48.7675]
						]
					}
				}
			]
		}
		const graph = buildFootpathGraph(crossing)
		const route = findFootpathRoute(graph, [11.431, 48.767], [11.432, 48.7675])
		expect(route).toBeDefined()
		if (route == null) {
			return
		}
		// Must turn north at the cross — not continue east, and not keep south stub.
		expect(
			route.coordinates.some(
				([lon, lat]) => lon > 11.4325 && Math.abs(lat - 48.767) < 0.00015
			)
		).toBe(false)
		expect(
			route.coordinates.some(
				([lon, lat]) => Math.abs(lon - 11.432) < 0.00015 && lat < 48.7667
			)
		).toBe(false)
	})

	it('bridges a short outdoor gap so street routes stay connected', () => {
		const gapped: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.431, 48.767],
							[11.4315, 48.767]
						]
					}
				},
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43165, 48.767],
							[11.4322, 48.767]
						]
					}
				}
			]
		}
		const graph = buildFootpathGraph(gapped)
		const route = findFootpathRoute(graph, [11.431, 48.767], [11.4322, 48.767])
		expect(route).toBeDefined()
		expect(route?.distanceMeters).toBeGreaterThan(70)
	})
})

describe('findFootpathRoute', () => {
	const graph = buildFootpathGraph(footpaths)

	it('routes along the network instead of a straight diagonal', () => {
		const route = findFootpathRoute(
			graph,
			[11.431, 48.76705],
			[11.43205, 48.766]
		)
		expect(route).toBeDefined()
		if (route == null) {
			return
		}
		expect(route.coordinates.length).toBeGreaterThanOrEqual(3)
		expect(route.distanceMeters).toBeGreaterThan(100)
		const nearJunction = route.coordinates.some(
			([lon, lat]) =>
				Math.abs(lon - 11.432) < 0.0002 && Math.abs(lat - 48.767) < 0.0002
		)
		expect(nearJunction).toBe(true)
	})

	it('uses a linked near-miss segment to reach farther east', () => {
		const route = findFootpathRoute(graph, [11.431, 48.767], [11.434, 48.767])
		expect(route).toBeDefined()
		if (route == null) {
			return
		}
		expect(route.coordinates.at(-1)?.[0]).toBeCloseTo(11.434, 4)
		expect(route.distanceMeters).toBeGreaterThan(200)
	})

	it('returns undefined when far from the network (no straight-line substitute)', () => {
		const route = findFootpathRoute(graph, [11.5, 48.8], [11.431, 48.767])
		expect(route).toBeUndefined()
	})

	it('ignores indoor shortcut walkthroughs and stays on outdoor streets', () => {
		const withShortcut: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: { class: 'path', subclass: 'footway' },
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43, 48.767],
							[11.43, 48.768],
							[11.4315, 48.768],
							[11.4315, 48.767]
						]
					}
				},
				{
					type: 'Feature',
					properties: {
						class: 'path',
						subclass: 'footway',
						indoor: true,
						shortcut: true
					},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43, 48.767],
							[11.4315, 48.767]
						]
					}
				}
			]
		}
		const shortcutGraph = buildFootpathGraph(withShortcut)
		const route = findFootpathRoute(
			shortcutGraph,
			[11.43, 48.767],
			[11.4315, 48.767]
		)
		expect(route).toBeDefined()
		if (route == null) {
			return
		}
		// Outdoor legs must stay outdoors: the indoor walkthrough is skipped,
		// even though the 3-sided street detour is longer.
		expect(route.coordinates.length).toBeGreaterThan(3)
		expect(route.distanceMeters).toBeGreaterThan(300)
		expect(
			route.segments.every((segment) => segment.surface === 'outdoor')
		).toBe(true)
	})

	it('treats hand-drawn outdoor connectors as normal outdoor paths', () => {
		const withConnector: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {
						class: 'path',
						subclass: 'footway',
						source: 'manual (added in geojson.io)',
						note: 'hand-drawn connector, not from OpenFreeMap tiles'
					},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43, 48.767],
							[11.4315, 48.767]
						]
					}
				}
			]
		}
		const graph = buildFootpathGraph(withConnector)
		const route = findFootpathRoute(graph, [11.43, 48.767], [11.4315, 48.767])
		expect(route).toBeDefined()
		if (route == null) {
			return
		}
		expect(route.coordinates.length).toBeLessThanOrEqual(3)
		expect(
			route.segments.every((segment) => segment.surface === 'outdoor')
		).toBe(true)
	})

	it('refuses component bridges that cut through building footprints', () => {
		const gapped: FeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.431, 48.767],
							[11.4315, 48.767]
						]
					}
				},
				{
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'LineString',
						coordinates: [
							[11.43165, 48.767],
							[11.4322, 48.767]
						]
					}
				}
			]
		}
		// A building footprint covering the gap between the two components.
		const blocked = buildFootpathGraph(gapped, [
			[11.43155, 48.7669, 11.4316, 48.7671]
		])
		expect(
			findFootpathRoute(blocked, [11.431, 48.767], [11.4322, 48.767])
		).toBeUndefined()

		const open = buildFootpathGraph(gapped)
		expect(
			findFootpathRoute(open, [11.431, 48.767], [11.4322, 48.767])
		).toBeDefined()
	})
})
