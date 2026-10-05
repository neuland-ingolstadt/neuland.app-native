import { beforeAll, describe, expect, it } from 'bun:test'
import {
	getIndoorData,
	loadIndoorDataFromAssets,
	resetIndoorDataCache
} from '@/utils/indoor-nav/data'
import {
	distanceToPolygonM,
	type PolygonGeom,
	pointInPolygonGeom
} from '@/utils/indoor-nav/geometry'
import {
	buildIndoorGraph,
	listRoutableRooms
} from '@/utils/indoor-nav/graph-build'
import { route } from '@/utils/indoor-nav/routing'

describe('indoor-nav graph (building G)', () => {
	let data: ReturnType<typeof getIndoorData>
	let graph: ReturnType<typeof buildIndoorGraph>

	beforeAll(async () => {
		resetIndoorDataCache()
		await loadIndoorDataFromAssets()
		data = getIndoorData()
		graph = buildIndoorGraph(data)
	})

	it('loads G data with the elevator fix on every floor', () => {
		for (const floor of ['EG', '1', '2', '3']) {
			const g094 = (data.roomsByFloor[floor] ?? []).find(
				(r) => r.properties.Raum === 'G094'
			)
			expect(g094?.properties.Funktion_de).toBe('Fahrstuhl')
		}
		const g161 = (data.roomsByFloor['1'] ?? []).find(
			(r) => r.properties.Raum === 'G161'
		)
		expect(g161?.properties.Funktion_de).toBe('Treppenhaus')
	})

	it('builds corridor nets for all floors', () => {
		for (const floor of ['EG', '1', '2', '3']) {
			expect(graph.corridors[floor]?.segments.length).toBeGreaterThan(0)
		}
	})

	it('routes the demo smoke samples without failures', () => {
		const samples = [
			['entrance:IN-G-E01', 'room:EG:G001'],
			['room:EG:G001', 'room:EG:G011'],
			['room:EG:G001', 'room:1:G101'],
			['room:EG:G001', 'room:2:G201'],
			['room:EG:G001', 'room:3:G301'],
			['room:1:G101', 'room:2:G201'],
			['room:1:G101', 'room:3:G301'],
			['entrance:IN-G-E01', 'room:1:G117'],
			['entrance:IN-G-E02', 'room:EG:G001'],
			['entrance:IN-G-E02', 'room:1:G107'],
			['room:1:G107', 'entrance:IN-G-E02'],
			['room:2:G201', 'entrance:IN-G-E02'],
			['room:3:G301', 'entrance:IN-G-E02']
		] as const
		for (const [from, to] of samples) {
			const r = route(graph, from, to)
			expect(r, `${from} → ${to}`).not.toBeNull()
			expect(r?.distanceM ?? 0).toBeGreaterThan(0)
			expect(r?.segments.length ?? 0).toBeGreaterThan(0)
		}
	})

	it('routes every routable room with a mapped door from the main entrance', () => {
		const rooms = listRoutableRooms(data)
		expect(rooms.length).toBeGreaterThan(50)
		// Rooms without a mapped door in doors.json cannot be reached via the
		// door-only graph — the web demo (turf implementation) fails these too.
		const knownDoorless = new Set([
			'EG:G066',
			'1:G166',
			'2:G266',
			'2:G276',
			'3:G366'
		])
		const failures: string[] = []
		for (const room of rooms) {
			const r = route(
				graph,
				'entrance:IN-G-E01',
				`room:${room.floor}:${room.code}`
			)
			if (r == null) {
				failures.push(`${room.floor}:${room.code}`)
			}
		}
		expect(failures.sort()).toEqual([...knownDoorless].sort())
	})

	it('keeps EG route geometry inside walkable rooms', () => {
		const r = route(graph, 'entrance:IN-G-E01', 'room:EG:G011')
		expect(r).not.toBeNull()
		const seg = r?.segments.find((s) => s.floor === 'EG')
		expect(seg).toBeDefined()
		const masks = (data.roomsByFloor.EG ?? []).map(
			(f) => f.geometry as PolygonGeom
		)
		// Intermediate points must sit inside walkable rooms; the two
		// endpoints are door/entrance stubs that may sit exactly on the wall.
		const mids = (seg?.coords ?? []).slice(1, -1)
		expect(mids.length).toBeGreaterThan(0)
		const outside = mids.filter(
			(c) => !masks.some((m) => pointInPolygonGeom(c, m))
		)
		expect(outside).toEqual([])
		// Endpoints must still be at the door (within wall tolerance).
		for (const end of [
			seg?.coords[0],
			seg?.coords[(seg?.coords.length ?? 1) - 1]
		]) {
			if (end == null) {
				continue
			}
			const gap = Math.min(...masks.map((m) => distanceToPolygonM(end, m)))
			expect(gap).toBeLessThan(3)
		}
	})

	it('reports sane distances and durations', () => {
		const r = route(graph, 'entrance:IN-G-E01', 'room:3:G301')
		expect(r).not.toBeNull()
		expect(r?.distanceM ?? 0).toBeGreaterThan(10)
		expect(r?.distanceM ?? Number.POSITIVE_INFINITY).toBeLessThan(1000)
		expect(r?.durationSec ?? 0).toBeGreaterThan(0)
		expect(r?.floors).toContain('EG')
		expect(r?.floors).toContain('3')
	})
})
