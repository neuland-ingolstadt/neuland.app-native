import { describe, expect, it } from 'bun:test'
import { getFixedT } from '@/localization/i18n-fixed-t'
import {
	filterStartOptions,
	formatEndpointLabel,
	listEntranceStartOptions,
	listPickStartOptionsForQuery,
	listStartEndpointOptions
} from '@/utils/indoor-nav/start-endpoints'
import type {
	EntranceFeature,
	GraphNode,
	IndoorData,
	RoomFeature
} from '@/utils/indoor-nav/types'

function room(
	code: string,
	floor = 'EG',
	funktion = 'Büro',
	gebaeude = 'G'
): RoomFeature {
	return {
		type: 'Feature',
		properties: {
			Standort: 'IN',
			Gebaeude: gebaeude,
			Etage: floor,
			Raum: code,
			Funktion_de: funktion
		},
		geometry: {
			type: 'Polygon',
			coordinates: [
				[
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[0, 0]
				]
			]
		}
	}
}

function entrance(
	id: string,
	name_de?: string,
	name_en?: string
): EntranceFeature {
	return {
		type: 'Feature',
		properties: {
			id,
			Standort: 'IN',
			Gebaeude: 'G',
			Etage: 'EG',
			name_de,
			name_en
		},
		geometry: { type: 'Point', coordinates: [11.43, 48.76] }
	}
}

function testData(): IndoorData {
	return {
		roomsByFloor: {
			EG: [room('G001'), room('T1', 'EG', 'Treppenhaus')],
			'1': []
		},
		doors: [],
		entrances: [
			entrance('IN-G-E01'),
			entrance('IN-G-E02', 'Seiteneingang', 'Side entrance')
		],
		corridorsByFloor: {}
	}
}

function testGraph() {
	const nodes = new Map<string, GraphNode>([
		[
			'entrance:IN-G-E01',
			{ id: 'entrance:IN-G-E01', kind: 'entrance', floor: 'EG', coord: [0, 0] }
		],
		[
			'room:EG:G001',
			{
				id: 'room:EG:G001',
				kind: 'room',
				floor: 'EG',
				coord: [0, 0],
				label: 'Audimax',
				roomCode: 'G001'
			}
		]
	])
	return {
		nodes,
		edges: new Map(),
		roomsIndex: new Map(),
		circulation: {},
		corridors: {},
		roomNodeId: (floor: string, raum: string) => `room:${floor}:${raum}`
	}
}

describe('start endpoint options', () => {
	const t = getFixedT('de', 'indoor-nav')

	it('formats endpoint labels', () => {
		const graph = testGraph()
		expect(formatEndpointLabel(graph, 'entrance:IN-G-E01', t)).toBe(
			'Haupteingang · Gebäude G'
		)
		expect(formatEndpointLabel(graph, 'room:EG:G001', t)).toBe('Audimax')
		expect(formatEndpointLabel(graph, 'room:EG:G999', t)).toContain('G999')
		expect(formatEndpointLabel(graph, 'custom-id', t)).toBe('custom-id')
	})

	it('lists entrances with main entrance first by label', () => {
		const options = listEntranceStartOptions(testData(), t)
		expect(options).toHaveLength(2)
		expect(options[0]).toEqual({
			id: 'entrance:IN-G-E01',
			label: 'Haupteingang',
			subtitle: 'Gebäude G',
			building: 'G',
			kind: 'entrance'
		})
		expect(options[1]).toMatchObject({
			id: 'entrance:IN-G-E02',
			label: 'Seiteneingang',
			building: 'G',
			kind: 'entrance'
		})
	})

	it('disambiguates duplicate main entrances by building', () => {
		const data = testData()
		data.entrances = [
			entrance('IN-G-E01'),
			{
				...entrance('IN-J-E01'),
				properties: { ...entrance('IN-J-E01').properties, Gebaeude: 'J' }
			}
		]
		const options = listEntranceStartOptions(data, t)
		expect(options).toHaveLength(2)
		expect(options.map((o) => o.label)).toEqual([
			'Haupteingang',
			'Haupteingang'
		])
		expect(options.map((o) => o.subtitle)).toEqual(['Gebäude G', 'Gebäude J'])
		const filtered = filterStartOptions(
			listStartEndpointOptions(data, t),
			'haupteingang'
		)
		expect(filtered).toHaveLength(2)
		expect(
			new Set(filtered.map((o) => `${o.label} · ${o.subtitle}`).values()).size
		).toBe(2)
	})

	it('falls back to english names and raw ids', () => {
		const tEn = getFixedT('en', 'indoor-nav')
		const data = testData()
		data.entrances = [entrance('IN-G-E02', undefined, 'Side entrance')]
		expect(listEntranceStartOptions(data, tEn)[0]?.label).toBe('Side entrance')
		data.entrances = [entrance('IN-G-E02')]
		expect(listEntranceStartOptions(data, tEn)[0]?.label).toBe('IN-G-E02')
	})

	it('lists entrances plus routable rooms, skipping circulation', () => {
		const options = listStartEndpointOptions(testData(), t)
		const ids = options.map((o) => o.id)
		expect(ids).toContain('entrance:IN-G-E01')
		expect(ids).toContain('room:EG:G001')
		// Stair shafts are not valid start rooms.
		expect(ids).not.toContain('room:EG:T1')
		expect(
			options.every((o) => o.kind === 'entrance' || o.kind === 'room')
		).toBe(true)
	})

	it('shows entrances for empty queries and filters otherwise', () => {
		const data = testData()
		expect(listPickStartOptionsForQuery(data, '  ', t)).toHaveLength(2)
		const filtered = listPickStartOptionsForQuery(data, 'g001', t)
		expect(filtered.map((o) => o.id)).toContain('room:EG:G001')
	})

	it('filters options by label or id', () => {
		const options = listStartEndpointOptions(testData(), t)
		expect(filterStartOptions(options, '')).toBe(options)
		expect(filterStartOptions(options, 'seiten').map((o) => o.id)).toContain(
			'entrance:IN-G-E02'
		)
		expect(filterStartOptions(options, 'IN-J').map((o) => o.id)).toEqual([])
	})
})
