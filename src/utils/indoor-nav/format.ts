import { getFixedT } from '@/localization/i18n-fixed-t'
import type { IndoorNavLocale } from './indoor-nav-i18n'

/** Indoor walking pace (~4.5 km/h). */
export const WALK_SPEED_M_S = 1.25
/** Distance charged per stair hop between adjacent floors. */
export const STAIR_DISTANCE_M = 3.5
/** Time charged per stair hop (~one level). */
export const STAIR_DURATION_S = 22

export function walkDurationSec(distanceM: number): number {
	return distanceM / WALK_SPEED_M_S
}

function formatDurationSecForLocale(
	sec: number,
	locale: IndoorNavLocale
): string {
	const halfMins = Math.max(0.5, Math.round(Math.max(0, sec) / 30) / 2)
	const t = getFixedT(locale, 'indoor-nav')
	if (halfMins === 1) {
		return t('duration.oneMinute')
	}
	return t('duration.minutes', { count: halfMins })
}

export function formatDistanceM(
	m: number,
	_locale: IndoorNavLocale = 'de'
): string {
	return `${Math.round(m)} m`
}

export function formatDurationSec(
	sec: number,
	locale: IndoorNavLocale = 'de'
): string {
	return formatDurationSecForLocale(sec, locale)
}

export function formatDistanceDuration(
	distanceM: number,
	durationSec: number,
	locale: IndoorNavLocale = 'de'
): string {
	return `${formatDistanceM(distanceM, locale)} · ${formatDurationSec(durationSec, locale)}`
}
