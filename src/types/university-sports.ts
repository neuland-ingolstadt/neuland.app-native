import type { components } from '@neuland-ingolstadt/backend-core-api'
import type { LanguageKey } from '@/localization/i18n'

export type CampusEnum = components['schemas']['CampusEnum']
export type Sports = components['schemas']['Sports']
export type SportsCategoryEnum = components['schemas']['SportsCategoryEnum']
export type WeekdayEnum = components['schemas']['WeekdayEnum']

const WEEKDAY_ORDER: WeekdayEnum[] = [
	'MONDAY',
	'TUESDAY',
	'WEDNESDAY',
	'THURSDAY',
	'FRIDAY',
	'SATURDAY',
	'SUNDAY'
]

/** UI campus labels used by filters / user preference storage. */
export const SPORTS_CAMPUS_LABELS = ['Ingolstadt', 'Neuburg'] as const
export type SportsCampusLabel = (typeof SPORTS_CAMPUS_LABELS)[number]

export const CAMPUS_LABEL_TO_ENUM: Record<SportsCampusLabel, CampusEnum> = {
	Ingolstadt: 'INGOLSTADT',
	Neuburg: 'NEUBURG'
}

export const CAMPUS_ENUM_TO_LABEL: Record<CampusEnum, SportsCampusLabel> = {
	INGOLSTADT: 'Ingolstadt',
	NEUBURG: 'Neuburg'
}

export function weekdaySortIndex(weekday: WeekdayEnum): number {
	return WEEKDAY_ORDER.indexOf(weekday)
}

export function sportsLocalizedTitle(
	sport: Sports,
	language: LanguageKey
): string {
	return sport.contents[language]?.title ?? sport.contents.en.title
}

export function sportsLocalizedDescription(
	sport: Sports,
	language: LanguageKey
): string {
	return (
		sport.contents[language]?.description ?? sport.contents.en.description ?? ''
	)
}

export function hasSportsDescription(sport: Sports): boolean {
	return (
		(sport.contents.de.description ?? '') !== '' ||
		(sport.contents.en.description ?? '') !== ''
	)
}
