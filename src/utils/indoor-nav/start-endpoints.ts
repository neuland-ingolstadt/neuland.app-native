import type { TFunction } from 'i18next'
import { listRoutableRooms } from './graph-build'
import { entranceNodeId, isMainEntranceRawId, roomNodeId } from './ids'
import { indoorNavFloorLabel } from './indoor-nav-i18n'
import { placeLabel } from './maneuvers'
import type { IndoorData, IndoorGraph } from './types'

export interface StartEndpointOption {
	id: string
	label: string
	subtitle: string
	building: string
	kind: 'entrance' | 'room'
}

function buildingSubtitle(
	t: TFunction<'indoor-nav'>,
	building: string
): string {
	if (building === '') {
		return ''
	}
	return t('pickStartBuilding', { building })
}

/** Building for an entrance raw id (e.g. `IN-G-E01` → `G`), with data fallback. */
function entranceBuilding(rawId: string, fallback: string): string {
	if (fallback !== '') {
		return fallback
	}
	const match = /^IN-([A-Z]+)-/.exec(rawId)
	return match?.[1] ?? ''
}

function entranceOptionLabel(
	rawId: string,
	nameDe: string | undefined,
	nameEn: string | undefined,
	t: TFunction<'indoor-nav'>
): string {
	if (isMainEntranceRawId(rawId)) {
		return t('place.mainEntrance')
	}
	return nameDe ?? nameEn ?? rawId
}

export function listEntranceStartOptions(
	data: IndoorData,
	t: TFunction<'indoor-nav'>
): StartEndpointOption[] {
	return data.entrances
		.map((e) => {
			const building = entranceBuilding(
				e.properties.id,
				e.properties.Gebaeude ?? ''
			)
			return {
				id: entranceNodeId(e.properties.id),
				label: entranceOptionLabel(
					e.properties.id,
					e.properties.name_de,
					e.properties.name_en,
					t
				),
				subtitle: buildingSubtitle(t, building),
				building,
				kind: 'entrance' as const
			}
		})
		.sort(
			(a, b) =>
				a.label.localeCompare(b.label, 'de') ||
				a.subtitle.localeCompare(b.subtitle, 'de')
		)
}

export function listStartEndpointOptions(
	data: IndoorData,
	t: TFunction<'indoor-nav'>
): StartEndpointOption[] {
	const rooms = listRoutableRooms(data).map((room) => {
		const floorLabel = indoorNavFloorLabel(t, room.floor)
		const meta = [buildingSubtitle(t, room.building), floorLabel]
			.filter((part) => part !== '')
			.join(' · ')
		const subtitle = [room.funktion, meta]
			.filter((part): part is string => part != null && part !== '')
			.join(' · ')
		return {
			id: roomNodeId(room.floor, room.code),
			label: room.code,
			subtitle,
			building: room.building,
			kind: 'room' as const
		}
	})
	return [...listEntranceStartOptions(data, t), ...rooms].sort(
		(a, b) =>
			a.label.localeCompare(b.label, 'de') ||
			a.subtitle.localeCompare(b.subtitle, 'de')
	)
}

/** Distinct display label for a selected endpoint (collapsed card + summary). */
export function formatEndpointLabel(
	graph: IndoorGraph,
	id: string,
	t: TFunction<'indoor-nav'>
): string {
	if (id.startsWith('entrance:')) {
		const base = placeLabel(graph, id, t)
		const rawId = id.slice('entrance:'.length)
		const buildingMatch = /^IN-([A-Z]+)-/.exec(rawId)
		const building = buildingMatch?.[1] ?? ''
		if (building === '') {
			return base
		}
		return `${base} · ${buildingSubtitle(t, building)}`
	}
	if (id.startsWith('room:')) {
		const parts = id.split(':')
		const floor = parts[1] ?? ''
		const code = parts[2] ?? id
		const node = graph.nodes.get(id)
		if (node?.label != null && node.label !== '') {
			return node.label
		}
		return `${code} · ${indoorNavFloorLabel(t, floor)}`
	}
	return id
}

/** Entrances when search is empty; full searchable list once the user types. */
export function listPickStartOptionsForQuery(
	data: IndoorData,
	query: string,
	t: TFunction<'indoor-nav'>
): StartEndpointOption[] {
	const q = query.trim()
	if (q === '') {
		return listEntranceStartOptions(data, t)
	}
	return filterStartOptions(listStartEndpointOptions(data, t), query)
}

export function filterStartOptions(
	options: StartEndpointOption[],
	query: string
): StartEndpointOption[] {
	const q = query.trim().toLowerCase()
	if (q === '') {
		return options
	}
	return options.filter(
		(o) =>
			o.label.toLowerCase().includes(q) ||
			o.subtitle.toLowerCase().includes(q) ||
			o.building.toLowerCase().includes(q) ||
			o.id.toLowerCase().includes(q)
	)
}
