// Ported from neuland-map-data/indoor-nav/g/src/lib/journey-copy.ts —
// buildJourneySteps gains phased sub-steps per walk leg (enter → follow →
// enter room on one floor; enter → follow → to-stairs / from-stairs →
// follow → enter room across floors); everything else stays in sync.

import type { TFunction } from 'i18next'
import { OUTDOOR_FLOOR } from './campus-route'
import { getIndoorGraph } from './data'
import { FLOOR_ORDER } from './floors'
import { formatDistanceDuration, walkDurationSec } from './format'
import { haversineM } from './geometry'
import { type IndoorNavLocale, indoorNavFloorLabel } from './indoor-nav-i18n'
import {
	placeLabel,
	splitSegmentAtRoomEntry,
	stairStepManeuver,
	walkStepManeuver
} from './maneuvers'
import type {
	FloorChange,
	FloorSegment,
	IndoorGraph,
	LonLat,
	RouteResult
} from './types'

/** Guidance phase within a walk leg (entrance, stairs and room arrivals). */
export type WalkPhase =
	| 'enter'
	| 'follow'
	| 'enterRoom'
	| 'toStairs'
	| 'fromStairs'
	| 'leaveRoom'
	| 'leaveBuilding'

export type JourneyStep =
	| {
			kind: 'walk'
			floor: string
			legIndex: number
			distanceM: number
			durationSec: number
			segment: FloorSegment
			/** Set for decomposed entrance walks (enter → follow → enter room). */
			phase?: WalkPhase
	  }
	| {
			kind: 'stairs'
			floor: string
			afterLegIndex: number
			fromFloor: string
			toFloor: string
			viaFrom: string
			viaTo: string
			distanceM: number
			durationSec: number
			change: FloorChange
	  }
	| {
			kind: 'arrival'
			floor: string
			legIndex: number
	  }

export type JourneyNextAction = {
	label: string
	hint: string
	dir?: 'up' | 'down'
}

export type JourneyStepCopy = {
	kicker: string
	headline: string
	subline: string
	meta: string
	arrived: boolean
	wrongFloor: boolean
	next?: JourneyNextAction
}

function walkManeuverOpts(
	result: RouteResult,
	legIndex: number,
	nextIsStairs: boolean
) {
	return {
		isFirstWalkStep: legIndex === 0,
		isLastJourneyStep: legIndex === result.segments.length - 1,
		nextIsStairs
	}
}

function stairDir(fromFloor: string, toFloor: string): 'up' | 'down' {
	return (FLOOR_ORDER[toFloor] ?? 0) >= (FLOOR_ORDER[fromFloor] ?? 0)
		? 'up'
		: 'down'
}

/** Primary HUD button: current step only (tap to advance). */
function primaryActionCopy(
	step: JourneyStep,
	headline: string,
	subline: string,
	steps: JourneyStep[],
	stepIndex: number
): JourneyNextAction | undefined {
	if (stepIndex >= steps.length - 1 || step.kind === 'arrival') {
		return undefined
	}

	const hint = subline !== '' && subline !== headline ? subline : ''
	const dir =
		step.kind === 'stairs' ? stairDir(step.fromFloor, step.toFloor) : undefined

	return {
		label: headline,
		hint,
		...(dir != null ? { dir } : {})
	}
}

export function buildJourneySteps(result: RouteResult): JourneyStep[] {
	const steps: JourneyStep[] = []
	for (let i = 0; i < result.segments.length; i++) {
		const seg = result.segments[i]
		steps.push({
			kind: 'walk',
			floor: seg.floor,
			legIndex: i,
			distanceM: seg.distanceM,
			durationSec: seg.durationSec,
			segment: seg
		})
		const change = result.floorChanges[i]
		if (change) {
			steps.push({
				kind: 'stairs',
				floor: change.fromFloor,
				afterLegIndex: i,
				fromFloor: change.fromFloor,
				toFloor: change.toFloor,
				viaFrom: change.viaFrom,
				viaTo: change.viaTo,
				distanceM: change.distanceM,
				durationSec: change.durationSec,
				change
			})
		}
	}
	const lastSeg = result.segments[result.segments.length - 1]
	if (lastSeg) {
		steps.push({
			kind: 'arrival',
			floor: lastSeg.floor,
			legIndex: result.segments.length - 1
		})
	}
	return splitEntranceWalk(steps, result)
}

function chunkDistanceM(coords: LonLat[]): number {
	let d = 0
	for (let i = 1; i < coords.length; i++) {
		d += haversineM(coords[i - 1], coords[i])
	}
	return d
}

const SHORT_PHASE_CAP_M = 14
const SHORT_PHASE_MAX_RATIO = 0.2
const MIN_FOLLOW_SHARE = 0.45

function isShortStartPhase(phase: WalkPhase): boolean {
	return phase === 'enter' || phase === 'leaveRoom'
}

function isShortEndPhase(phase: WalkPhase): boolean {
	return phase === 'enterRoom' || phase === 'leaveBuilding'
}

function crossesCampus(result: RouteResult): boolean {
	return result.segments.some((s) => s.floor === OUTDOOR_FLOOR)
}

/** Phased indoor legs before/after the outdoor campus walk. */
function walkPhasesForCampusLeg(
	result: RouteResult,
	legIndex: number,
	startsAtEntrance: boolean,
	endsAtRoom: boolean
): WalkPhase[] | null {
	const seg = result.segments[legIndex]
	if (seg == null || seg.floor === OUTDOOR_FLOOR) {
		return null
	}
	const isFirst = legIndex === 0
	const isLast = legIndex === result.segments.length - 1
	const nextOutdoor = result.segments[legIndex + 1]?.floor === OUTDOOR_FLOOR
	const prevOutdoor =
		legIndex > 0 && result.segments[legIndex - 1]?.floor === OUTDOOR_FLOOR

	if (nextOutdoor) {
		if (startsAtEntrance && isFirst) {
			return ['enter', 'follow', 'leaveBuilding']
		}
		if (
			seg.startNodeId?.startsWith('room:') ||
			(isFirst && !startsAtEntrance)
		) {
			return ['leaveRoom', 'follow', 'leaveBuilding']
		}
		return ['follow', 'leaveBuilding']
	}
	if (prevOutdoor && isLast && endsAtRoom) {
		return ['enter', 'follow', 'enterRoom']
	}
	if (prevOutdoor && isLast) {
		return ['enter', 'follow']
	}
	return null
}

function phaseChunkLengths(
	total: number,
	phases: WalkPhase[]
): number[] | null {
	if (!(total > 0.5)) {
		return null
	}
	const cap = Math.min(SHORT_PHASE_CAP_M, total * SHORT_PHASE_MAX_RATIO)
	const minFollow = total * MIN_FOLLOW_SHARE

	if (phases.length === 2) {
		const [a, b] = phases
		if (isShortStartPhase(a) && b === 'follow') {
			const start = Math.min(cap, total - minFollow)
			return [start, total - start]
		}
		if (a === 'follow' && isShortEndPhase(b)) {
			const end = Math.min(cap, total - minFollow)
			return [total - end, end]
		}
		return [total / 2, total / 2]
	}
	if (
		phases.length === 3 &&
		isShortStartPhase(phases[0]) &&
		phases[1] === 'follow' &&
		isShortEndPhase(phases[2])
	) {
		const start = Math.min(cap, total * SHORT_PHASE_MAX_RATIO)
		const end = Math.min(cap, total * SHORT_PHASE_MAX_RATIO)
		const mid = total - start - end
		if (mid < minFollow) {
			return null
		}
		return [start, mid, end]
	}
	return Array.from({ length: phases.length }, () => total / phases.length)
}

/**
 * Split a walk polyline into N chunks by walked distance, sharing the cut
 * vertices so chunks join seamlessly. Returns null when the line is too
 * short or a chunk would be degenerate.
 */
function splitCoordsAtDistances(
	coords: LonLat[],
	cutDistances: number[]
): LonLat[][] | null {
	if (coords.length < 2 || cutDistances.length === 0) {
		return null
	}
	const cum: number[] = [0]
	for (let i = 1; i < coords.length; i++) {
		cum.push((cum[i - 1] ?? 0) + haversineM(coords[i - 1], coords[i]))
	}
	const total = cum[cum.length - 1] ?? 0
	if (!(total > 0.5)) {
		return null
	}
	const at = (target: number): { point: LonLat; after: number } => {
		const t = Math.max(0, Math.min(total, target))
		let i = 1
		while (i < cum.length - 1 && (cum[i] ?? 0) < t) {
			i++
		}
		const prev = cum[i - 1] ?? 0
		const len = (cum[i] ?? 0) - prev
		const f = len < 1e-9 ? 0 : (t - prev) / len
		const a = coords[i - 1]
		const b = coords[i]
		return {
			point: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f],
			after: i
		}
	}
	let acc = 0
	const cuts = cutDistances.slice(0, -1).map((len) => {
		acc += len
		return at(acc)
	})
	const chunks: LonLat[][] = []
	let start: LonLat | null = null
	let fromIndex = 0
	for (const cut of cuts) {
		const chunk: LonLat[] = [
			...(start != null ? [start] : []),
			...coords.slice(fromIndex, cut.after),
			cut.point
		]
		chunks.push(chunk)
		start = cut.point
		fromIndex = cut.after
	}
	chunks.push([...(start != null ? [start] : []), ...coords.slice(fromIndex)])
	for (const chunk of chunks) {
		if (chunk.length < 2 || !(chunkDistanceM(chunk) > 0.05)) {
			return null
		}
	}
	return chunks
}

function splitCoordsInto(coords: LonLat[], n: number): LonLat[][] | null {
	if (n < 2) {
		return null
	}
	const total = chunkDistanceM(coords)
	const lengths = Array.from({ length: n }, () => total / n)
	return splitCoordsAtDistances(coords, lengths)
}

function splitCoordsForPhases(
	coords: LonLat[],
	phases: WalkPhase[]
): LonLat[][] | null {
	if (phases.length < 2) {
		return null
	}
	const total = chunkDistanceM(coords)
	const lengths = phaseChunkLengths(total, phases)
	if (lengths == null) {
		return null
	}
	return splitCoordsAtDistances(coords, lengths)
}

function coordsAreValidChunks(chunks: LonLat[][]): boolean {
	for (const chunk of chunks) {
		if (chunk.length < 2 || !(chunkDistanceM(chunk) > 0.05)) {
			return false
		}
	}
	return true
}

/** Walk polyline chunks per phase; enterRoom uses the door→room stub off the corridor. */
function coordsChunksForWalkPhases(
	step: Extract<JourneyStep, { kind: 'walk' }>,
	phases: WalkPhase[],
	result: RouteResult
): LonLat[][] | null {
	if (!phases.includes('enterRoom')) {
		return splitCoordsForPhases(step.segment.coords, phases)
	}
	const graph = getIndoorGraph()
	const roomSplit = splitSegmentAtRoomEntry(graph, result, step.segment)
	if (roomSplit == null) {
		return splitCoordsForPhases(step.segment.coords, phases)
	}
	const { corridor, roomStub } = roomSplit
	if (
		phases.length === 2 &&
		phases[0] === 'follow' &&
		phases[1] === 'enterRoom'
	) {
		const chunks = [corridor, roomStub]
		return coordsAreValidChunks(chunks)
			? chunks
			: splitCoordsForPhases(step.segment.coords, phases)
	}
	if (
		phases.length === 3 &&
		isShortStartPhase(phases[0]) &&
		phases[1] === 'follow' &&
		phases[2] === 'enterRoom'
	) {
		const firstTwo = splitCoordsForPhases(corridor, [phases[0], 'follow'])
		if (firstTwo == null) {
			return splitCoordsForPhases(step.segment.coords, phases)
		}
		const chunks = [...firstTwo, roomStub]
		return coordsAreValidChunks(chunks)
			? chunks
			: splitCoordsForPhases(step.segment.coords, phases)
	}
	return splitCoordsForPhases(step.segment.coords, phases)
}

function makePhaseSubs(
	first: Extract<JourneyStep, { kind: 'walk' }>,
	phases: WalkPhase[],
	chunks: LonLat[][]
): JourneyStep[] {
	return chunks.map((coords, i) => {
		const distanceM = chunkDistanceM(coords)
		const durationSec = walkDurationSec(distanceM)
		return {
			kind: 'walk',
			floor: first.floor,
			legIndex: first.legIndex,
			distanceM,
			durationSec,
			segment: { ...first.segment, coords, distanceM, durationSec },
			phase: phases[i]
		} satisfies Extract<JourneyStep, { kind: 'walk' }>
	})
}

/**
 * Decompose every walk leg into guided phases so multi-floor routes get the
 * same step-by-step granularity as same-floor ones:
 * enter building → go to stairs → stairs up/down → leave stairs → follow →
 * enter room → arrival. Short legs (< 6 m) stay a single step and fall back
 * to the contextual walkStepManeuver copy.
 */
function splitWalkLegs(
	steps: JourneyStep[],
	result: RouteResult
): JourneyStep[] {
	const startsAtEntrance = result.nodeIds[0]?.startsWith('entrance:') ?? false
	const endsAtRoom =
		result.nodeIds[result.nodeIds.length - 1]?.startsWith('room:') ?? false
	const campus = crossesCampus(result)
	if (
		!campus &&
		!startsAtEntrance &&
		!endsAtRoom &&
		result.floorChanges.length === 0
	) {
		return steps
	}
	const out: JourneyStep[] = []
	for (const step of steps) {
		if (step.kind !== 'walk') {
			out.push(step)
			continue
		}
		if (step.floor === OUTDOOR_FLOOR) {
			if (step.distanceM >= 6) {
				out.push({ ...step, phase: 'follow' })
			} else {
				out.push(step)
			}
			continue
		}
		const isFirst = step.legIndex === 0
		const isLast = step.legIndex === result.segments.length - 1
		const hasNextStairs = result.floorChanges[step.legIndex] != null
		const hasPrevStairs =
			step.legIndex > 0 && result.floorChanges[step.legIndex - 1] != null

		let phases: WalkPhase[] | null = campus
			? walkPhasesForCampusLeg(
					result,
					step.legIndex,
					startsAtEntrance,
					endsAtRoom
				)
			: null
		if (
			phases == null &&
			result.segments.length === 1 &&
			startsAtEntrance &&
			endsAtRoom
		) {
			phases = ['enter', 'follow', 'enterRoom']
		} else if (phases == null && isFirst && hasNextStairs) {
			phases = startsAtEntrance ? ['enter', 'follow'] : ['leaveRoom', 'follow']
		} else if (
			phases == null &&
			!isFirst &&
			!isLast &&
			hasPrevStairs &&
			hasNextStairs
		) {
			out.push({ ...step, phase: 'follow' })
			continue
		} else if (phases == null && isLast && hasPrevStairs && endsAtRoom) {
			phases = ['follow', 'enterRoom']
		} else if (phases == null) {
			out.push(step)
			continue
		}

		// Short legs stay a single contextual step (walkStepManeuver).
		if (!(step.distanceM >= 6)) {
			out.push(step)
			continue
		}
		const chunks = coordsChunksForWalkPhases(step, phases, result)
		if (chunks == null) {
			const fallback = splitCoordsInto(step.segment.coords, 2)
			if (fallback == null) {
				out.push(step)
				continue
			}
			const fallbackPhases: WalkPhase[] =
				phases.length === 2 && phases[1] === 'enterRoom'
					? ['follow', 'enterRoom']
					: phases.length === 2 && phases[1] === 'leaveBuilding'
						? ['follow', 'leaveBuilding']
						: [phases[0], 'follow']
			out.push(...makePhaseSubs(step, fallbackPhases, fallback))
			continue
		}
		out.push(...makePhaseSubs(step, phases, chunks))
	}
	return out
}

/**
 * A single-segment route from an outdoor entrance into a room collapses to
 * one walk step ("enter room") — decompose it into enter building →
 * follow the path → enter room so the beginning is guided step by step.
 * Multi-leg routes are decomposed per-leg by splitWalkLegs.
 */
function splitEntranceWalk(
	steps: JourneyStep[],
	result: RouteResult
): JourneyStep[] {
	return splitWalkLegs(steps, result)
}

/** Guidance copy for decomposed walk phases (POC copy strings). */
function phasedStepManeuver(
	graph: IndoorGraph,
	fromId: string,
	toLabel: string,
	phase: WalkPhase,
	t: TFunction<'indoor-nav'>,
	floor?: string
): { headline: string; subline?: string } {
	switch (phase) {
		case 'enter':
			return {
				headline: t('guidance.enterBuilding'),
				subline: t('guidance.viaEntrance', {
					name: placeLabel(graph, fromId, t)
				})
			}
		case 'follow':
			if (floor === OUTDOOR_FLOOR) {
				return {
					headline: t('guidance.walkCampus'),
					subline: t('guidance.followMarkedPath')
				}
			}
			return {
				headline: t('guidance.followPath'),
				subline: t('guidance.routeLineOnMap')
			}
		case 'enterRoom':
			return {
				headline: t('guidance.enterRoom', { code: toLabel }),
				subline: t('guidance.toDoor')
			}
		case 'toStairs':
			return {
				headline: t('guidance.enterStaircase'),
				subline: t('guidance.followMarkedPath')
			}
		case 'fromStairs':
			return {
				headline: t('guidance.leaveStaircase'),
				subline:
					floor != null
						? indoorNavFloorLabel(t, floor)
						: t('guidance.followMarkedPath')
			}
		case 'leaveRoom': {
			const code = fromId.startsWith('room:')
				? (fromId.split(':')[2] ?? toLabel)
				: toLabel
			return {
				headline: t('guidance.leaveRoom', { code }),
				subline: t('guidance.headCorridor')
			}
		}
		case 'leaveBuilding':
			return {
				headline: t('guidance.leaveBuilding'),
				subline: t('guidance.followMarkedPath')
			}
	}
}

/** Single source for HUD, timeline, and “Next” chip copy. */
export function journeyStepCopy(
	graph: IndoorGraph,
	fromId: string,
	toId: string,
	toLabel: string,
	result: RouteResult,
	steps: JourneyStep[],
	stepIndex: number,
	viewFloor: string,
	t: TFunction<'indoor-nav'>,
	locale: IndoorNavLocale
): JourneyStepCopy {
	const total = steps.length
	const safe = total ? Math.max(0, Math.min(stepIndex, total - 1)) : 0
	const step = steps[safe]
	const stepPos = t('guidance.stepOf', {
		cur: String(safe + 1),
		total: String(total)
	})

	if (!step) {
		return {
			kicker: '—',
			headline: t('guidance.followPath'),
			subline: t('guidance.routeLineOnMap'),
			meta: '',
			arrived: false,
			wrongFloor: false
		}
	}

	if (step.kind === 'arrival') {
		const onStepFloor = viewFloor === step.floor
		if (!onStepFloor) {
			return {
				kicker: `${indoorNavFloorLabel(t, viewFloor)} · ${t('guidance.kickerWrongFloor')}`,
				headline: t('guidance.wrongFloorHeadline', {
					floor: indoorNavFloorLabel(t, step.floor)
				}),
				subline: step.floor,
				meta: t('guidance.wrongFloorMeta', {
					floor: indoorNavFloorLabel(t, step.floor)
				}),
				arrived: false,
				wrongFloor: true
			}
		}
		return {
			kicker: `${stepPos} · ${t('guidance.kickerArrived')}`,
			headline: t('guidance.arrivedHeadline', { dest: toLabel }),
			subline: t('guidance.arrivedSubline'),
			meta: '',
			arrived: true,
			wrongFloor: false
		}
	}

	if (step.kind === 'stairs') {
		const stair = stairStepManeuver(step.change, t)
		const meta = formatDistanceDuration(
			step.distanceM,
			step.durationSec,
			locale
		)
		return {
			kicker: `${stepPos} · ${t('guidance.kickerStairs')}`,
			headline: stair.headline,
			subline: stair.subline,
			meta,
			arrived: false,
			wrongFloor: false,
			next: primaryActionCopy(step, stair.headline, stair.subline, steps, safe)
		}
	}

	const stepFloor = step.floor
	const onStepFloor = viewFloor === stepFloor
	const walk =
		step.phase != null
			? phasedStepManeuver(graph, fromId, toLabel, step.phase, t, stepFloor)
			: walkStepManeuver(
					graph,
					fromId,
					toId,
					result,
					step.legIndex,
					t,
					walkManeuverOpts(
						result,
						step.legIndex,
						steps[safe + 1]?.kind === 'stairs'
					)
				)

	const isFinalWalk = step.legIndex === result.segments.length - 1
	if (isFinalWalk && !onStepFloor) {
		return {
			kicker: `${indoorNavFloorLabel(t, viewFloor)} · ${t('guidance.kickerWrongFloor')}`,
			headline: t('guidance.wrongFloorHeadline', {
				floor: indoorNavFloorLabel(t, stepFloor)
			}),
			subline: stepFloor,
			meta: t('guidance.wrongFloorMeta', {
				floor: indoorNavFloorLabel(t, stepFloor)
			}),
			arrived: false,
			wrongFloor: true
		}
	}

	const duration = formatDistanceDuration(
		step.distanceM,
		step.durationSec,
		locale
	)
	const subline = walk.subline ?? t('guidance.followMarkedPath')
	const meta = `${duration} ${isFinalWalk ? t('guidance.remaining') : t('guidance.onThisLevel')}`
	return {
		kicker: `${stepPos} · ${indoorNavFloorLabel(t, stepFloor)}`,
		headline: walk.headline,
		subline,
		meta,
		arrived: false,
		wrongFloor: false,
		next: primaryActionCopy(step, walk.headline, subline, steps, safe)
	}
}

export function mapLegForStep(step: JourneyStep | undefined): number {
	if (step == null) {
		return 0
	}
	if (step.kind === 'walk' || step.kind === 'arrival') {
		return step.legIndex
	}
	return step.afterLegIndex
}
