import { createInstance, type i18n, type TFunction } from 'i18next'
import {
	defaultNS,
	type LanguageKey,
	resources
} from '@/localization/resources'

const instances = new Map<LanguageKey, i18n>()

function i18nForLanguage(language: LanguageKey): i18n {
	let instance = instances.get(language)
	if (instance == null) {
		instance = createInstance()
		void instance.init({
			resources,
			lng: language,
			fallbackLng: defaultNS,
			compatibilityJSON: 'v4',
			interpolation: {
				escapeValue: false
			}
		})
		instances.set(language, instance)
	}
	return instance
}

export type FixedI18nNamespace = 'common' | 'indoor-nav'

/** Fixed `t` for a locale without loading the Expo app i18n singleton. */
export function getFixedT(
	language: LanguageKey,
	namespace: 'common'
): TFunction<'common'>
export function getFixedT(
	language: LanguageKey,
	namespace: 'indoor-nav'
): TFunction<'indoor-nav'>
export function getFixedT(
	language: LanguageKey,
	namespace: FixedI18nNamespace
): TFunction<FixedI18nNamespace> {
	return i18nForLanguage(language).getFixedT(language, namespace)
}
