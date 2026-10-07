import type { TFunction } from 'i18next'
import type { LanguageKey } from '@/localization/resources'

export type IndoorNavLocale = LanguageKey

export function indoorNavLocaleFromLanguage(language: string): IndoorNavLocale {
	return language === 'en' ? 'en' : 'de'
}

export function indoorNavFloorLabel(
	t: TFunction<'indoor-nav'>,
	floor: string
): string {
	return t(`floors.${floor}`, { defaultValue: floor })
}

export function indoorNavPlaceForFunction(
	t: TFunction<'indoor-nav'>,
	funktionDe: string | undefined
): string | undefined {
	switch (funktionDe) {
		case 'Treppenhaus':
		case 'Fluchtreppe':
			return t('place.stairs')
		case 'Fahrstuhl':
			return t('place.elevator')
		case 'Flur':
		case 'Flur Entrepreneur':
			return t('place.corridor')
		case 'Atrium':
			return 'Atrium'
		case 'Luftraum':
			return t('place.void')
		default:
			return undefined
	}
}
