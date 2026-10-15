import type { FeatureCollection, Point } from 'geojson'
import type { StepProgressState } from '@/utils/indoor-nav/journey-visualization'

export interface StepMarkerItem {
	key: string
	index: number
	longitude: number
	latitude: number
	kind: string
	state: StepProgressState
}

export interface EntranceMarkerItem extends StepMarkerItem {
	rawId: string
}

function toLonLat(feature: FeatureCollection['features'][number]): {
	longitude: number
	latitude: number
} | null {
	if (feature.geometry.type !== 'Point') {
		return null
	}
	const [longitude, latitude] = (feature.geometry as Point).coordinates
	if (typeof longitude !== 'number' || typeof latitude !== 'number') {
		return null
	}
	return { longitude, latitude }
}

/** Shared parsing for native + web step markers — platform files only map items to <Marker>. */
export function getStepMarkerItems(
	stepMarkersGeoJSON: FeatureCollection,
	defaultKind = 'entry',
	defaultState: StepProgressState = 'todo'
): StepMarkerItem[] {
	const items: StepMarkerItem[] = []
	stepMarkersGeoJSON.features.forEach((feature, index) => {
		const pos = toLonLat(feature)
		if (pos == null) {
			return
		}
		const kind = String(feature.properties?.kind ?? defaultKind)
		const state = (feature.properties?.state ??
			defaultState) as StepProgressState
		items.push({
			key: `indoor-step-${kind}-${index}-${pos.longitude}-${pos.latitude}`,
			index,
			longitude: pos.longitude,
			latitude: pos.latitude,
			kind,
			state
		})
	})
	return items
}

/** Shared parsing for native + web entrance markers. */
export function getEntranceMarkerItems(
	entrancesGeoJSON: FeatureCollection
): EntranceMarkerItem[] {
	const items: EntranceMarkerItem[] = []
	entrancesGeoJSON.features.forEach((feature, index) => {
		const pos = toLonLat(feature)
		if (pos == null) {
			return
		}
		const rawId = String(feature.properties?.id ?? '')
		items.push({
			key: `indoor-entrance-${rawId}-${index}`,
			index,
			longitude: pos.longitude,
			latitude: pos.latitude,
			kind: 'entrance',
			state: 'todo',
			rawId
		})
	})
	return items
}
