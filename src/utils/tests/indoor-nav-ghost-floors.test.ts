import { describe, expect, it } from 'bun:test'
import {
	GHOST_FLOOR_STACK_M,
	ghostFloorsGeoJson,
	type StairMoment,
	stairMomentFromStep
} from '@/utils/indoor-nav/ghost-floors'
import type { JourneyStep } from '@/utils/indoor-nav/journey-copy'
import type { IndoorData, LonLat, RoomFeature } from '@/utils/indoor-nav/types'

const HOP: LonLat = [11.43, 48.76]

function room(
	code: string,
	funktion: string,
	at: LonLat = HOP,
	size = 0.0001
): RoomFeature {
	const [lon, lat] = at
	return {
		type: 'Feature',
		properties: {
			Standort: 'IN',
			Gebaeude: 'G',
			Etage: 'EG',
			Raum: code,
			Funktion_de: funktion
		},
		geometry: {
			type: 'Polygon',
			coordinates: [
				[
					[lon, lat],
					[lon + size, lat],
					[lon + size, lat + size],
					[lon, lat + size],
					[lon, lat]
				]
			]
		}
	}
}

function data(): IndoorData {
	return {
		roomsByFloor: {
			EG: [
				room('T1', 'Treppenhaus'),
				room('T9', 'Treppenhaus', [11.44, 48.77]),
				room('B1', 'Büro')
			],
			'1': [
				room('T1', 'Treppenhaus'),
				room('L1', 'Luftraum'),
				room('B2', 'Büro', [11.4301, 48.7601], 0.00005),
				room('B3', 'Büro', HOP, 0.00002)
			]
		},
		doors: [],
		entrances: [],
		corridorsByFloor: {}
	}
}

function stairsStep(): JourneyStep {
	return {
		kind: 'stairs',
		floor: 'EG',
		afterLegIndex: 0,
		fromFloor: 'EG',
		toFloor: '1',
		viaFrom: 'room:EG:T1',
		viaTo: 'room:1:T1',
		distanceM: 5,
		durationSec: 30,
		change: {
			fromFloor: 'EG',
			toFloor: '1',
			at: HOP,
			viaFrom: 'room:EG:T1',
			viaTo: 'room:1:T1',
			fromStairCode: 'T1',
			toStairCode: 'T1',
			distanceM: 5,
			durationSec: 30
		}
	}
}

describe('ghost-floors stair moments', () => {
	it('extracts stair moments from journey steps', () => {
		expect(stairMomentFromStep(undefined)).toBeNull()
		expect(
			stairMomentFromStep({ kind: 'arrival', floor: 'EG', legIndex: 0 })
		).toBeNull()
		const withoutChange: JourneyStep = {
			kind: 'stairs',
			floor: 'EG',
			afterLegIndex: 0,
			fromFloor: 'EG',
			toFloor: '1',
			viaFrom: 'a',
			viaTo: 'b',
			distanceM: 1,
			durationSec: 1,
			change: undefined as never
		}
		expect(stairMomentFromStep(withoutChange)).toBeNull()
		expect(stairMomentFromStep(stairsStep())).toEqual({
			fromFloor: 'EG',
			toFloor: '1',
			fromStairCode: 'T1',
			toStairCode: 'T1',
			at: HOP
		})
	})

	it('renders nothing without a moment', () => {
		expect(ghostFloorsGeoJson(data(), null, 'EG')).toEqual({
			type: 'FeatureCollection',
			features: []
		})
		expect(ghostFloorsGeoJson(data(), undefined, 'EG').features).toEqual([])
	})

	it('draws the route staircase on the viewed floor', () => {
		const moment: StairMoment = {
			fromFloor: 'EG',
			toFloor: '1',
			fromStairCode: 'T1',
			toStairCode: 'T1',
			at: HOP
		}
		const eg = ghostFloorsGeoJson(data(), moment, 'EG')
		const codes = eg.features.map((f) => f.properties?.Raum)
		// Route stair on the viewed floor, at ground level.
		expect(codes).toContain('T1')
		const shaft = eg.features.find((f) => f.properties?.Raum === 'T1')
		expect(shaft?.properties).toMatchObject({
			ghostBase: 0,
			ghostKind: 'stair'
		})
		// Far stairs and offices never render on the viewed floor.
		expect(codes).not.toContain('T9')
		expect(codes).not.toContain('B1')
	})

	it('stacks nearby floors above the viewed floor', () => {
		const moment: StairMoment = {
			fromFloor: 'EG',
			toFloor: '1',
			fromStairCode: 'T1',
			toStairCode: 'T1',
			at: HOP
		}
		const eg = ghostFloorsGeoJson(data(), moment, 'EG')
		const stacked = eg.features.filter(
			(f) => (f.properties?.ghostBase as number) > 0
		)
		expect(stacked).not.toHaveLength(0)
		for (const feature of stacked) {
			expect(feature.properties?.ghostBase).toBe(GHOST_FLOOR_STACK_M)
		}
		const codes = stacked.map((f) => f.properties?.Raum)
		// Route stair shaft, nearby office plate — but no airspace and no
		// office directly at the hop.
		expect(codes).toContain('T1')
		expect(codes).toContain('B2')
		expect(codes).not.toContain('L1')
		expect(codes).not.toContain('B3')
	})

	it('handles descending hops and unknown floors', () => {
		const down: StairMoment = {
			fromFloor: '1',
			toFloor: 'EG',
			fromStairCode: 'T1',
			toStairCode: 'T1',
			at: HOP
		}
		const fc = ghostFloorsGeoJson(data(), down, 'EG')
		expect(fc.features.length).toBeGreaterThan(0)
		const unknown: StairMoment = {
			fromFloor: 'X',
			toFloor: 'Y',
			at: HOP
		}
		const fallback = ghostFloorsGeoJson(data(), unknown, 'EG')
		expect(fallback.features.map((f) => f.properties?.Raum)).toContain('T1')
	})
})
