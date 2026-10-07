import type { TFunction } from 'i18next'
import { listRoutableRooms } from './graph-build'
import { entranceNodeId, isMainEntranceRawId, roomNodeId } from './ids'
import { indoorNavFloorLabel } from './indoor-nav-i18n'
import { placeLabel } from './maneuvers'
import type { IndoorData, IndoorGraph } from './types'

export interface StartEndpointOption {
	id: string
	label: string
	kind: 'entrance' | 'room'
}

export function formatEndpointLabel(
	graph: IndoorGraph,
	id: string,
	t: TFunction<'indoor-nav'>
): string {
	if (id.startsWith('entrance:')) {
		return placeLabel(graph, id, t)
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
		.map((e) => ({
			id: entranceNodeId(e.properties.id),
			label: entranceOptionLabel(
				e.properties.id,
				e.properties.name_de,
				e.properties.name_en,
				t
			),
			kind: 'entrance' as const
		}))
		.sort((a, b) => a.label.localeCompare(b.label, 'de'))
}

export function listStartEndpointOptions(
	data: IndoorData,
	t: TFunction<'indoor-nav'>
): StartEndpointOption[] {
	const rooms = listRoutableRooms(data).map((room) => ({
		id: roomNodeId(room.floor, room.code),
		label: room.label,
		kind: 'room' as const
	}))
	return [...listEntranceStartOptions(data, t), ...rooms].sort((a, b) =>
		a.label.localeCompare(b.label, 'de')
	)
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
		(o) => o.label.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
	)
}
