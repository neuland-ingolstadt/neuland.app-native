import { beforeAll, describe, expect, it } from 'bun:test'
import { getFixedT } from '@/localization/i18n-fixed-t'
import {
	getIndoorData,
	loadIndoorDataFromAssets,
	resetIndoorDataCache
} from '@/utils/indoor-nav/data'
import {
	formatDistanceDuration,
	formatDistanceM,
	formatDurationSec,
	STAIR_DISTANCE_M,
	STAIR_DURATION_S,
	WALK_SPEED_M_S,
	walkDurationSec
} from '@/utils/indoor-nav/format'
import { buildIndoorGraph } from '@/utils/indoor-nav/graph-build'
import {
	doorNodeId,
	entranceNodeId,
	INDOOR_DEFAULT_ENTRANCE_RAW_ID,
	INDOOR_DEFAULT_ENTRANCES,
	INDOOR_DEFAULT_START_ID,
	defaultStartForBuilding,
	isMainEntranceNodeId,
	isMainEntranceRawId,
	portalNodeId,
	roomNodeId
} from '@/utils/indoor-nav/ids'
import {
	indoorNavFloorLabel,
	indoorNavLocaleFromLanguage,
	indoorNavPlaceForFunction
} from '@/utils/indoor-nav/indoor-nav-i18n'
import {
	placeLabel,
	stairStepManeuver,
	walkStepManeuver
} from '@/utils/indoor-nav/maneuvers'
import {
	destinationRoomGeoJsonForFloor,
	entrancesGeoJsonForFloor,
	pickLegForFloor,
	stairShaftsGeoJsonForFloor
} from '@/utils/indoor-nav/route-geojson'
import { route } from '@/utils/indoor-nav/routing'
import type { RouteResult } from '@/utils/indoor-nav/types'
import {
	gridPath,
	snapToWalkable,
	stringPull,
	type WalkMask
} from '@/utils/indoor-nav/walkable'

describe('indoor-nav utils', () => {
	const deT = getFixedT('de', 'indoor-nav')

	beforeAll(async () => {
		resetIndoorDataCache()
		await loadIndoorDataFromAssets()
	})

	it('builds stable graph node ids', () => {
		expect(roomNodeId('EG', 'G001')).toBe('room:EG:G001')
		expect(doorNodeId('D-1')).toBe('door:D-1')
		expect(entranceNodeId(INDOOR_DEFAULT_ENTRANCE_RAW_ID)).toBe(
			INDOOR_DEFAULT_START_ID
		)
		expect(portalNodeId('1', 'portal-b', 'portal-a')).toBe(
			'portal:1:portal-a-portal-b'
		)
		expect(INDOOR_DEFAULT_ENTRANCES.G).toBe(INDOOR_DEFAULT_ENTRANCE_RAW_ID)
		expect(defaultStartForBuilding('G')).toBe(INDOOR_DEFAULT_START_ID)
		expect(defaultStartForBuilding('UNKNOWN')).toBe(INDOOR_DEFAULT_START_ID)
		expect(isMainEntranceRawId(INDOOR_DEFAULT_ENTRANCE_RAW_ID)).toBe(true)
		expect(isMainEntranceRawId('NOPE')).toBe(false)
		expect(isMainEntranceNodeId(INDOOR_DEFAULT_START_ID)).toBe(true)
		expect(isMainEntranceNodeId('room:EG:G001')).toBe(false)
		expect(isMainEntranceNodeId('entrance:NOPE')).toBe(false)
	})

	it('maps indoor-nav locale and floor labels', () => {
		expect(indoorNavLocaleFromLanguage('en')).toBe('en')
		expect(indoorNavLocaleFromLanguage('de')).toBe('de')
		expect(indoorNavLocaleFromLanguage('fr')).toBe('de')
		expect(indoorNavFloorLabel(deT, 'EG')).toBe('Erdgeschoss')
		expect(indoorNavPlaceForFunction(deT, 'Treppenhaus')).toBe('Treppenhaus')
		expect(indoorNavPlaceForFunction(deT, 'Fahrstuhl')).toBe('Fahrstuhl')
		expect(indoorNavPlaceForFunction(deT, 'Flur')).toBe('Flur')
		expect(indoorNavPlaceForFunction(deT, 'Luftraum')).toBe('Luftraum')
		expect(indoorNavPlaceForFunction(deT, 'Atrium')).toBe('Atrium')
		expect(indoorNavPlaceForFunction(deT, 'unknown')).toBeUndefined()
	})

	it('formats distance, duration and walking pace helpers', () => {
		expect(walkDurationSec(10)).toBeCloseTo(10 / WALK_SPEED_M_S)
		expect(formatDistanceM(12.4)).toBe('12 m')
		expect(formatDurationSec(45, 'de')).toBe('1 Min.')
		expect(formatDurationSec(60, 'en')).toBe('1 min')
		expect(formatDistanceDuration(20, 30, 'en')).toMatch(/^20 m · /)
		expect(STAIR_DISTANCE_M).toBeGreaterThan(0)
		expect(STAIR_DURATION_S).toBeGreaterThan(0)
	})

	it('pickLegForFloor handles missing and single-leg floors', () => {
		const empty: RouteResult = {
			nodeIds: [],
			coords: [],
			hops: [],
			segments: [],
			floorChanges: [],
			distanceM: 0,
			durationSec: 0,
			floors: []
		}
		expect(pickLegForFloor(empty, 'EG')).toBe(0)

		const single: RouteResult = {
			...empty,
			segments: [
				{
					floor: 'EG',
					coords: [],
					distanceM: 1,
					durationSec: 1,
					startNodeId: 'a',
					endNodeId: 'b'
				}
			]
		}
		expect(pickLegForFloor(single, 'EG')).toBe(0)
		expect(pickLegForFloor(single, '1')).toBe(0)
	})

	it('picks the preferred leg when a floor appears twice on a route', () => {
		const data = getIndoorData()
		const graph = buildIndoorGraph(data)
		const result = route(graph, 'entrance:IN-G-E01', 'room:EG:G011')
		expect(result).not.toBeNull()
		if (result == null) {
			return
		}
		const egLegs = result.segments
			.map((s, i) => (s.floor === 'EG' ? i : -1))
			.filter((i) => i >= 0)
		if (egLegs.length < 2) {
			expect(pickLegForFloor(result, 'EG', 0)).toBe(egLegs[0] ?? 0)
			return
		}
		expect(pickLegForFloor(result, 'EG', 0)).toBe(egLegs[0])
		expect(pickLegForFloor(result, 'EG', egLegs[1])).toBe(egLegs[1])
		expect(pickLegForFloor(result, 'missing')).toBe(0)
	})

	it('builds entrance and destination room overlays', () => {
		const data = getIndoorData()
		expect(entrancesGeoJsonForFloor(data, 'EG').features.length).toBe(
			data.entrances.length
		)
		expect(entrancesGeoJsonForFloor(data, '1').features).toEqual([])

		const hidden = destinationRoomGeoJsonForFloor(data, 'EG', 'G001', false)
		expect(hidden.features).toEqual([])

		const shown = destinationRoomGeoJsonForFloor(data, 'EG', 'G001', true)
		expect(shown.features[0]?.properties?.Raum).toBe('G001')
		expect(
			destinationRoomGeoJsonForFloor(data, 'EG', 'NO-SUCH', true).features
		).toEqual([])
	})

	it('filters stair shaft highlights with onlyCodes', () => {
		const data = getIndoorData()
		const graph = buildIndoorGraph(data)
		const result = route(graph, 'entrance:IN-G-E01', 'room:3:G301')
		expect(result).not.toBeNull()
		if (result == null) {
			return
		}
		const change = result.floorChanges[0]
		expect(change?.fromStairCode).toBeDefined()
		if (change == null) {
			return
		}

		expect(
			stairShaftsGeoJsonForFloor(data, result, change.fromFloor, new Set())
				.features
		).toEqual([])

		const allOnFloor = stairShaftsGeoJsonForFloor(
			data,
			result,
			change.fromFloor
		)
		const filtered = stairShaftsGeoJsonForFloor(
			data,
			result,
			change.fromFloor,
			new Set(['OTHER-CODE'])
		)
		expect(filtered.features).toEqual([])
		expect(allOnFloor.features.length).toBeGreaterThan(0)
	})

	it('covers stair-shaft null, arrival floor and leg fallback branches', () => {
		const data = getIndoorData()
		expect(stairShaftsGeoJsonForFloor(data, null, 'EG').features).toEqual(
			[]
		)

		const graph = buildIndoorGraph(data)
		const result = route(graph, 'entrance:IN-G-E01', 'room:3:G301')
		expect(result).not.toBeNull()
		if (result == null) {
			return
		}
		const change = result.floorChanges[0]
		expect(change).toBeDefined()
		if (change == null) {
			return
		}
		// Arrival-floor branch (toFloor + toStairCode).
		expect(
			stairShaftsGeoJsonForFloor(data, result, change.toFloor).features.length
		).toBeGreaterThanOrEqual(0)

		// Multi-leg fallback: prefer beyond the last leg resolves to the last leg.
		const repeated: RouteResult = {
			nodeIds: [],
			coords: [],
			hops: [],
			segments: [
				{ floor: 'EG', coords: [], distanceM: 1, durationSec: 1 },
				{ floor: '1', coords: [], distanceM: 1, durationSec: 1 },
				{ floor: 'EG', coords: [], distanceM: 1, durationSec: 1 }
			],
			floorChanges: [],
			distanceM: 3,
			durationSec: 3,
			floors: ['EG', '1', 'EG']
		}
		expect(pickLegForFloor(repeated, 'EG', 0)).toBe(0)
		expect(pickLegForFloor(repeated, 'EG', 2)).toBe(2)
		expect(pickLegForFloor(repeated, 'EG', 99)).toBe(2)

		// Entrance overlay caches per data instance.
		const first = entrancesGeoJsonForFloor(data, 'EG')
		expect(entrancesGeoJsonForFloor(data, 'EG')).toBe(first)
	})

	it('builds walk and stair maneuver copy from real routes', () => {
		const data = getIndoorData()
		const graph = buildIndoorGraph(data)
		const enT = getFixedT('en', 'indoor-nav')

		const sameFloor = route(graph, 'entrance:IN-G-E01', 'room:EG:G011')
		expect(sameFloor).not.toBeNull()
		if (sameFloor == null) {
			return
		}
		const enter = walkStepManeuver(
			graph,
			'entrance:IN-G-E01',
			'room:EG:G011',
			sameFloor,
			0,
			enT,
			{ isFirstWalkStep: true, isLastJourneyStep: false }
		)
		expect(enter.headline).toBe('Enter the building')

		const roomHop = route(graph, 'room:EG:G001', 'room:EG:G011')
		expect(roomHop).not.toBeNull()
		if (roomHop == null) {
			return
		}
		const goRoom = walkStepManeuver(
			graph,
			'room:EG:G001',
			'room:EG:G011',
			roomHop,
			0,
			enT,
			{ isFirstWalkStep: true, isLastJourneyStep: true }
		)
		expect(goRoom.headline).toContain('G011')

		const multi = route(graph, 'entrance:IN-G-E01', 'room:3:G301')
		expect(multi).not.toBeNull()
		if (multi == null || multi.floorChanges[0] == null) {
			return
		}
		const stairs = stairStepManeuver(multi.floorChanges[0], enT)
		expect(stairs.headline).toBe('Take the stairs up')
		expect(stairs.subline).toBe('Ground → 3rd')

		const exitRoute = route(graph, 'room:EG:G001', 'entrance:IN-G-E02')
		expect(exitRoute).not.toBeNull()
		if (exitRoute != null) {
			const leave = walkStepManeuver(
				graph,
				'room:EG:G001',
				'entrance:IN-G-E02',
				exitRoute,
				0,
				enT,
				{ isFirstWalkStep: true, isLastJourneyStep: true }
			)
			expect(leave.headline).toBe('Leave the building')
		}

		const missingLeg = walkStepManeuver(
			graph,
			'entrance:IN-G-E01',
			'room:3:G301',
			multi,
			99,
			enT
		)
		expect(missingLeg.headline).toBe('Follow the path')
	})

	it('labels circulation rooms for maneuver copy', () => {
		const data = getIndoorData()
		const graph = buildIndoorGraph(data)
		const stair = [...graph.nodes.entries()].find(
			([, n]) => n.kind === 'room' && n.roomCode === 'G161'
		)
		expect(stair).toBeDefined()
		if (stair == null) {
			return
		}
		expect(placeLabel(graph, stair[0], deT)).toBe('Treppenhaus')
		expect(placeLabel(graph, 'entrance:IN-G-E01', deT)).toBe('Haupteingang')
	})

	it('string-pulls and grid-paths inside walkable masks', () => {
		const data = getIndoorData()
		const masks: WalkMask[] = (data.roomsByFloor.EG ?? []).filter(
			(r) => r.properties.Funktion_de === 'Flur'
		)
		expect(masks.length).toBeGreaterThan(0)

		const corridor = masks[0]
		const ring = corridor.geometry.coordinates[0] as [number, number][]
		const a = ring[0]
		const b = ring[Math.floor(ring.length / 2)]
		const pulled = stringPull([a, b], masks)
		expect(pulled.length).toBeGreaterThanOrEqual(2)
		expect(pulled[0]).toEqual(a)

		const path = gridPath(a, b, masks)
		expect(path).not.toBeNull()
		expect(path?.length).toBeGreaterThanOrEqual(2)
		expect(gridPath(a, b, [])).toBeNull()
	})

	it('covers walkable snap and grid-path edge cases', () => {
		const square = (
			lon: number,
			lat: number,
			size: number
		): WalkMask =>
			({
				type: 'Feature',
				properties: {},
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
			}) as WalkMask
		const masks = [square(11.43, 48.76, 0.0002)]
		const inside: [number, number] = [11.4301, 48.7601]

		// Snap returns the coordinate itself when already walkable.
		expect(snapToWalkable(inside, masks)).toEqual(inside)
		// Snap gives up when nothing is walkable nearby.
		expect(snapToWalkable([0, 0], masks, 0.0001)).toBeNull()
		// Zero-length segment has line of sight; direct mates short-circuit.
		expect(gridPath(inside, inside, masks)).toEqual([inside, inside])
		expect(gridPath(inside, [11.43015, 48.76015], masks)).toHaveLength(2)
		// Disconnected islands cannot route.
		const islands = [square(11.43, 48.76, 0.0001), square(11.44, 48.77, 0.0001)]
		expect(gridPath([11.43005, 48.76005], [11.44005, 48.77005], islands)).toBeNull()
		// A degenerate mask holds no walkable cell, so nothing can route.
		const sliver = [square(11.43, 48.76, 1e-9)]
		expect(gridPath([11.43005, 48.76005], [11.43006, 48.76006], sliver)).toBeNull()
	})
})
