import { beforeAll, describe, expect, it } from 'bun:test'
import { getFixedT } from '@/localization/i18n-fixed-t'
import {
	getIndoorData,
	loadIndoorDataFromAssets,
	resetIndoorDataCache
} from '@/utils/indoor-nav/data'
import { haversineM } from '@/utils/indoor-nav/geometry'
import { buildIndoorGraph } from '@/utils/indoor-nav/graph-build'
import {
	buildJourneySteps,
	type JourneyStep,
	journeyStepCopy
} from '@/utils/indoor-nav/journey-copy'
import {
	activeStairCodesForStep,
	routeProgressGeoJsonForFloor,
	stepMarkersGeoJsonForFloor
} from '@/utils/indoor-nav/journey-visualization'
import { splitSegmentAtRoomEntry } from '@/utils/indoor-nav/maneuvers'
import { stairShaftsGeoJsonForFloor } from '@/utils/indoor-nav/route-geojson'
import { route } from '@/utils/indoor-nav/routing'

function routeTo(code: string, floor: string) {
	const data = getIndoorData()
	const graph = buildIndoorGraph(data)
	const result = route(graph, 'entrance:IN-G-E01', `room:${floor}:${code}`)
	if (result == null) {
		throw new Error(`no route to ${floor}:${code}`)
	}
	return { graph, result }
}

describe('indoor-nav journey (POC parity)', () => {
	const deT = getFixedT('de', 'indoor-nav')
	const enT = getFixedT('en', 'indoor-nav')

	beforeAll(async () => {
		resetIndoorDataCache()
		await loadIndoorDataFromAssets()
	})

	it('builds phased walk → stairs → walk → arrival steps for a multi-floor route', () => {
		const { result } = routeTo('G301', '3')
		const steps = buildJourneySteps(result)
		// Shaft hops through one staircase merge into a single stairs step.
		// EG: enter → follow; after stairs: follow → enter room (no separate stairwell steps).
		expect(steps.map((s) => s.kind)).toEqual([
			'walk',
			'walk',
			'stairs',
			'walk',
			'walk',
			'arrival'
		])
		expect(
			steps
				.filter((s) => s.kind === 'walk')
				.map((s) => (s.kind === 'walk' ? s.phase : undefined))
		).toEqual(['enter', 'follow', 'follow', 'enterRoom'])
		const stairs = steps.filter(
			(s): s is Extract<JourneyStep, { kind: 'stairs' }> => s.kind === 'stairs'
		)
		expect(stairs.map((s) => `${s.fromFloor}→${s.toFloor}`)).toEqual(['EG→3'])
	})

	it('splits a same-floor entrance route into enter → follow → enter room', () => {
		const { graph, result } = routeTo('G011', 'EG')
		const steps = buildJourneySteps(result)
		expect(steps.map((s) => s.kind)).toEqual([
			'walk',
			'walk',
			'walk',
			'arrival'
		])
		expect(
			steps
				.filter((s) => s.kind === 'walk')
				.map((s) => (s.kind === 'walk' ? s.phase : undefined))
		).toEqual(['enter', 'follow', 'enterRoom'])

		const fromId = 'entrance:IN-G-E01'
		const copies = steps.map((_, i) =>
			journeyStepCopy(
				graph,
				fromId,
				'room:EG:G011',
				'G011',
				result,
				steps,
				i,
				'EG',
				deT,
				'de'
			)
		)
		expect(copies.map((c) => c.headline)).toEqual([
			'Gebäude betreten',
			'Dem Weg folgen',
			'Raum G011 betreten',
			'Angekommen bei G011'
		])
		expect(copies[0].subline).toBe('Über Eingang G 1')
		expect(copies[1].subline).toBe('Der blaue Strich auf der Karte')
		expect(copies[2].subline).toBe('Bis zur Tür dem Weg folgen')
		expect(copies[3].arrived).toBe(true)
		// Sub-steps partition the whole leg without gaps.
		const legDistance = result.segments[0].distanceM
		const walkDistance = steps
			.filter((s) => s.kind === 'walk')
			.reduce((sum, s) => sum + (s.kind === 'walk' ? s.distanceM : 0), 0)
		expect(Math.abs(walkDistance - legDistance)).toBeLessThan(0.5)
		const enterRoom = steps.find(
			(s): s is Extract<JourneyStep, { kind: 'walk' }> =>
				s.kind === 'walk' && s.phase === 'enterRoom'
		)
		const follow = steps.find(
			(s): s is Extract<JourneyStep, { kind: 'walk' }> =>
				s.kind === 'walk' && s.phase === 'follow' && s.legIndex === 0
		)
		expect(enterRoom).toBeDefined()
		expect(follow).toBeDefined()
		const split = splitSegmentAtRoomEntry(graph, result, result.segments[0])
		expect(split).not.toBeNull()
		if (!split) return
		let stubLen = 0
		for (let i = 1; i < split.roomStub.length; i++) {
			stubLen += haversineM(split.roomStub[i - 1], split.roomStub[i])
		}
		expect(enterRoom?.distanceM).toBeCloseTo(stubLen, 0)
		expect(enterRoom?.segment.coords).toEqual(split.roomStub)
		expect(enterRoom?.distanceM).toBeLessThan(follow?.distanceM ?? 0)
		expect(enterRoom?.distanceM).toBeLessThan(20)
	})

	it('gives German step copy identical to the POC', () => {
		const { graph, result } = routeTo('G301', '3')
		const fromId = 'entrance:IN-G-E01'
		const toId = 'room:3:G301'
		const steps = buildJourneySteps(result)

		const first = journeyStepCopy(
			graph,
			fromId,
			toId,
			'G301',
			result,
			steps,
			0,
			'EG',
			deT,
			'de'
		)
		expect(first.headline).toBe('Gebäude betreten')
		expect(first.kicker).toBe('Schritt 1 von 6 · Erdgeschoss')

		const stairs = journeyStepCopy(
			graph,
			fromId,
			toId,
			'G301',
			result,
			steps,
			2,
			'EG',
			deT,
			'de'
		)
		expect(stairs.headline).toBe('Treppen hinauf')
		expect(stairs.kicker).toBe('Schritt 3 von 6 · Treppen')
		expect(stairs.subline).toBe('Erdgeschoss → 3. OG')

		const followTop = journeyStepCopy(
			graph,
			fromId,
			toId,
			'G301',
			result,
			steps,
			3,
			'3',
			deT,
			'de'
		)
		expect(followTop.headline).toBe('Dem Weg folgen')

		const enterRoom = journeyStepCopy(
			graph,
			fromId,
			toId,
			'G301',
			result,
			steps,
			4,
			'3',
			deT,
			'de'
		)
		expect(enterRoom.headline).toBe('Raum G301 betreten')

		const arrival = journeyStepCopy(
			graph,
			fromId,
			toId,
			'G301',
			result,
			steps,
			steps.length - 1,
			'3',
			deT,
			'de'
		)
		expect(arrival.arrived).toBe(true)
		expect(arrival.headline).toBe('Angekommen bei G301')

		const wrongFloor = journeyStepCopy(
			graph,
			fromId,
			toId,
			'G301',
			result,
			steps,
			steps.length - 1,
			'EG',
			deT,
			'de'
		)
		expect(wrongFloor.wrongFloor).toBe(true)
	})

	it('gives English step copy identical to the POC', () => {
		const { graph, result } = routeTo('G001', 'EG')
		const steps = buildJourneySteps(result)
		// Decomposed entrance walk: enter → follow → enter room → arrival.
		const headlines = steps
			.map((_, i) =>
				journeyStepCopy(
					graph,
					'entrance:IN-G-E01',
					'room:EG:G001',
					'G001',
					result,
					steps,
					i,
					'EG',
					enT,
					'en'
				)
			)
			.map((c) => c.headline)
		expect(headlines).toEqual([
			'Enter the building',
			'Follow the path',
			'Enter room G001',
			'Arrived at G001'
		])
	})

	it('exposes the active stair shaft blocks per floor', () => {
		const data = getIndoorData()
		const { result } = routeTo('G301', '3')
		const change = result.floorChanges[0]
		expect(change).toBeDefined()

		const departure = stairShaftsGeoJsonForFloor(data, result, change.fromFloor)
		expect(departure.features.map((f) => f.properties?.Raum)).toContain(
			change.fromStairCode
		)

		const arrival = stairShaftsGeoJsonForFloor(data, result, change.toFloor)
		expect(arrival.features.map((f) => f.properties?.Raum)).toContain(
			change.toStairCode
		)

		// Floors without a change stay empty.
		expect(stairShaftsGeoJsonForFloor(data, result, '2').features).toEqual([])
		expect(stairShaftsGeoJsonForFloor(data, null, 'EG').features).toEqual([])
	})

	it('exposes stair hop markers on the active step floor', () => {
		const { result } = routeTo('G301', '3')
		const steps = buildJourneySteps(result)
		const markers = stepMarkersGeoJsonForFloor(result, steps, 0, 'EG')
		expect(markers.features.some((f) => f.properties?.kind === 'entry')).toBe(
			true
		)
	})

	it('highlights stair shafts only on stairs-related steps', () => {
		const { result } = routeTo('G301', '3')
		const steps = buildJourneySteps(result)
		const change = result.floorChanges[0]
		expect(change).toBeDefined()

		const enterStep = steps[0]
		expect(enterStep?.kind).toBe('walk')
		expect(
			activeStairCodesForStep(result, enterStep, change.fromFloor).size
		).toBe(0)

		const beforeStairs = steps[1]
		expect(beforeStairs?.kind).toBe('walk')
		if (change.fromStairCode == null) {
			throw new Error('expected fromStairCode')
		}
		const fromStairCode = change.fromStairCode
		expect([
			...activeStairCodesForStep(
				result,
				beforeStairs,
				change.fromFloor,
				steps,
				1
			)
		]).toEqual([fromStairCode])

		const stairs = steps[2]
		expect(stairs?.kind).toBe('stairs')
		expect([
			...activeStairCodesForStep(result, stairs, change.fromFloor)
		]).toEqual([fromStairCode])
	})

	it('tags route progress chunks done/current/todo per step and floor', () => {
		const { result } = routeTo('G301', '3')
		const steps = buildJourneySteps(result)
		// Steps: 0 enter, 1 follow, 2 stairs, 3 follow, 4 enterRoom, 5 arrival.
		const egFirst = routeProgressGeoJsonForFloor(steps, 0, 'EG')
		expect(egFirst.features.map((f) => f.properties?.state)).toEqual([
			'current',
			'todo'
		])
		expect(egFirst.features.map((f) => f.properties?.phase)).toEqual([
			'enter',
			'follow'
		])

		const egStairs = routeProgressGeoJsonForFloor(steps, 2, 'EG')
		expect(egStairs.features.map((f) => f.properties?.state)).toEqual([
			'done',
			'done'
		])

		const topLast = routeProgressGeoJsonForFloor(steps, 4, '3')
		expect(topLast.features.map((f) => f.properties?.state)).toEqual([
			'done',
			'current'
		])

		// Floors without walk chunks stay empty.
		expect(routeProgressGeoJsonForFloor(steps, 0, '2').features).toEqual([])
	})

	it('tags entry/stairs/destination markers before/after the current step', () => {
		const { result } = routeTo('G301', '3')
		const steps = buildJourneySteps(result)

		const egStart = stepMarkersGeoJsonForFloor(result, steps, 0, 'EG')
		expect(
			egStart.features.map(
				(f) => `${f.properties?.kind}:${f.properties?.state}`
			)
		).toEqual(['entry:current', 'stairs_up:todo'])

		const egStairs = stepMarkersGeoJsonForFloor(result, steps, 2, 'EG')
		expect(
			egStairs.features.map(
				(f) => `${f.properties?.kind}:${f.properties?.state}`
			)
		).toEqual(['entry:done', 'stairs_up:current'])

		const topEnd = stepMarkersGeoJsonForFloor(result, steps, 4, '3')
		expect(
			topEnd.features.map((f) => `${f.properties?.kind}:${f.properties?.state}`)
		).toEqual(['stairs_arrive:done', 'destination:todo'])

		const topArrived = stepMarkersGeoJsonForFloor(result, steps, 5, '3')
		expect(
			topArrived.features.map(
				(f) => `${f.properties?.kind}:${f.properties?.state}`
			)
		).toEqual(['stairs_arrive:done', 'destination:current'])
	})
})
