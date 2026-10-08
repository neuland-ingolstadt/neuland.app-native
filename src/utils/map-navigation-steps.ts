import type { TFunction } from 'i18next'
import type { FormListSections } from '@/types/components'
import type { MapCoordinate } from '@/types/map'
import { getHaversineDistanceMeters } from './map-geometry-utils'
import type {
	CampusPathGraph,
	CampusPathResult,
	PathNode
} from './map-path-utils'

type CommonTFunction = TFunction<'common', undefined>

export type CampusNavStepType =
	| 'walkOutdoors'
	| 'turnLeft'
	| 'turnRight'
	| 'enterBuilding'
	| 'leaveBuilding'
	| 'takeStairs'
	| 'takeElevator'
	| 'followCorridor'
	| 'arrive'

export interface CampusNavStep {
	type: CampusNavStepType
	building?: string
	floor?: string
	room?: string
}

/** Minimum outdoor segment length before a bearing sample counts. */
const OUTDOOR_TURN_SEGMENT_METERS = 8
/** Absolute turn angle (degrees) required to emit left/right. */
const OUTDOOR_TURN_DEGREES = 45

function bearingDegrees(from: MapCoordinate, to: MapCoordinate): number {
	const [fromLon, fromLat] = from
	const [toLon, toLat] = to
	const fromLatRad = (fromLat * Math.PI) / 180
	const toLatRad = (toLat * Math.PI) / 180
	const deltaLon = ((toLon - fromLon) * Math.PI) / 180
	const y = Math.sin(deltaLon) * Math.cos(toLatRad)
	const x =
		Math.cos(fromLatRad) * Math.sin(toLatRad) -
		Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(deltaLon)
	return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

function normalizeTurnDegrees(delta: number): number {
	let value = delta
	while (value > 180) {
		value -= 360
	}
	while (value < -180) {
		value += 360
	}
	return value
}

/** Approximate left/right from an outdoor footpath polyline. */
export function outdoorTurnsFromPolyline(
	coordinates: MapCoordinate[] | undefined
): CampusNavStep[] {
	if (coordinates == null || coordinates.length < 3) {
		return []
	}

	const steps: CampusNavStep[] = []
	let previousBearing: number | undefined
	let anchor = coordinates[0]

	for (let index = 1; index < coordinates.length; index++) {
		const point = coordinates[index]
		const meters = getHaversineDistanceMeters(anchor, point)
		if (meters < OUTDOOR_TURN_SEGMENT_METERS) {
			continue
		}
		const bearing = bearingDegrees(anchor, point)
		if (previousBearing != null) {
			const turn = normalizeTurnDegrees(bearing - previousBearing)
			if (Math.abs(turn) >= OUTDOOR_TURN_DEGREES) {
				steps.push({ type: turn > 0 ? 'turnRight' : 'turnLeft' })
			}
		}
		previousBearing = bearing
		anchor = point
	}

	return steps
}

function resolveNodes(
	path: CampusPathResult,
	graph: CampusPathGraph
): PathNode[] {
	const nodes: PathNode[] = []
	for (const id of path.nodeIds) {
		const node = graph.nodes.get(id)
		if (node != null) {
			nodes.push(node)
		}
	}
	return nodes
}

/**
 * Collapse a campus path into landmark walking directions.
 * Outdoor left/right turns are optional and only applied to footpath polylines.
 */
export function buildCampusNavigationSteps(options: {
	path: CampusPathResult | undefined
	graph: CampusPathGraph
	/** Outdoor footpath polylines in route order (GPS→entrance, then building hops). */
	outdoorPolylines?: MapCoordinate[][]
}): CampusNavStep[] {
	const { path, graph, outdoorPolylines } = options
	if (path == null) {
		return []
	}

	const nodes = resolveNodes(path, graph)
	if (nodes.length === 0) {
		return []
	}

	const steps: CampusNavStep[] = []
	let outdoorIndex = 0
	let corridorKey: string | null = null

	const pushOutdoorTurns = (): void => {
		const polyline = outdoorPolylines?.[outdoorIndex]
		outdoorIndex += 1
		for (const turn of outdoorTurnsFromPolyline(polyline)) {
			steps.push(turn)
		}
	}

	if (path.outdoorOrigin != null) {
		steps.push({ type: 'walkOutdoors' })
		pushOutdoorTurns()
	}

	let index = 0
	while (index < nodes.length) {
		const node = nodes[index]

		if (node.kind === 'stairs' || node.kind === 'elevator') {
			const verticalKind = node.kind
			let endIndex = index
			while (
				endIndex + 1 < nodes.length &&
				nodes[endIndex + 1]?.kind === verticalKind &&
				nodes[endIndex + 1]?.building === node.building
			) {
				endIndex += 1
			}
			const endNode = nodes[endIndex]
			if (endNode != null && endNode.floor !== node.floor) {
				steps.push({
					type: verticalKind === 'stairs' ? 'takeStairs' : 'takeElevator',
					floor: endNode.floor
				})
				corridorKey = null
			}
			if (endIndex === nodes.length - 1 && endNode != null) {
				steps.push({ type: 'arrive', room: endNode.id })
			}
			index = endIndex + 1
			continue
		}

		if (node.kind === 'entrance') {
			const previous = index > 0 ? nodes[index - 1] : undefined
			const next = nodes[index + 1]

			if (previous == null || previous.building !== node.building) {
				steps.push({ type: 'enterBuilding', building: node.building })
				corridorKey = null
			}

			if (next != null && next.building !== node.building) {
				steps.push({ type: 'leaveBuilding', building: node.building })
				pushOutdoorTurns()
			}

			index += 1
			continue
		}

		if (node.kind === 'corridor') {
			const key = `${node.building}:${node.floor}`
			if (corridorKey !== key) {
				steps.push({ type: 'followCorridor' })
				corridorKey = key
			}
			index += 1
			continue
		}

		if (index === nodes.length - 1) {
			steps.push({ type: 'arrive', room: node.id })
			index += 1
			continue
		}

		index += 1
	}

	return steps
}

function stepTitle(step: CampusNavStep, t: CommonTFunction): string {
	switch (step.type) {
		case 'walkOutdoors':
			return t('pages.map.details.directions.walkOutdoors')
		case 'turnLeft':
			return t('pages.map.details.directions.turnLeft')
		case 'turnRight':
			return t('pages.map.details.directions.turnRight')
		case 'enterBuilding':
			return t('pages.map.details.directions.enterBuilding', {
				building: step.building ?? ''
			})
		case 'leaveBuilding':
			return t('pages.map.details.directions.leaveBuilding', {
				building: step.building ?? ''
			})
		case 'takeStairs':
			return t('pages.map.details.directions.takeStairs', {
				floor: step.floor ?? ''
			})
		case 'takeElevator':
			return t('pages.map.details.directions.takeElevator', {
				floor: step.floor ?? ''
			})
		case 'followCorridor':
			return t('pages.map.details.directions.followCorridor')
		case 'arrive':
			return t('pages.map.details.directions.arrive', {
				room: step.room ?? ''
			})
	}
}

function stepIcon(
	type: CampusNavStepType
): NonNullable<FormListSections['items']>[number]['icon'] {
	switch (type) {
		case 'walkOutdoors':
			return {
				ios: 'figure.walk',
				android: 'directions_walk',
				web: 'Footprints'
			}
		case 'turnLeft':
			return {
				ios: 'arrow.turn.up.left',
				android: 'turn_left',
				web: 'CornerUpLeft'
			}
		case 'turnRight':
			return {
				ios: 'arrow.turn.up.right',
				android: 'turn_right',
				web: 'CornerUpRight'
			}
		case 'enterBuilding':
		case 'leaveBuilding':
			return {
				ios: 'door.left.hand.open',
				android: 'door_front',
				web: 'DoorOpen'
			}
		case 'takeStairs':
			return {
				ios: 'stairs',
				android: 'stairs',
				web: 'ArrowUpDown'
			}
		case 'takeElevator':
			return {
				ios: 'elevator',
				android: 'elevator',
				web: 'ArrowUpFromLine'
			}
		case 'followCorridor':
			return {
				ios: 'arrow.right',
				android: 'arrow_forward',
				web: 'ArrowRight'
			}
		case 'arrive':
			return {
				ios: 'mappin.circle.fill',
				android: 'location_on',
				web: 'MapPin'
			}
	}
}

/** FormList section for the room detail sheet. */
export function campusNavigationSection(
	steps: CampusNavStep[],
	t: CommonTFunction,
	distanceMeters?: number
): FormListSections[] {
	if (steps.length === 0) {
		return []
	}

	const rounded =
		distanceMeters != null && Number.isFinite(distanceMeters)
			? Math.max(1, Math.round(distanceMeters))
			: undefined

	return [
		{
			header: t('pages.map.details.directions.title'),
			footer:
				rounded != null
					? t('pages.map.details.directions.distance', { meters: rounded })
					: undefined,
			items: steps.map((step, index) => ({
				title: `${index + 1}. ${stepTitle(step, t)}`,
				hideChevron: true,
				icon: stepIcon(step.type)
			}))
		}
	]
}
