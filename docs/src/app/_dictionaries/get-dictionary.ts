import 'server-only'
import type { Dictionaries, Dictionary, Locale } from './i18n-config'

// server side version of useTranslation hook
const dictionaries: Dictionaries = {
	en: () => import('./en'),
	de: () => import('./de')
}

export async function getDictionary(locale: string): Promise<Dictionary> {
	const validLocale = (locale in dictionaries ? locale : 'en') as Locale
	const { default: dictionary } = await dictionaries[validLocale]()
	return dictionary
}
