import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import accessibilityDE from './de/accessibility.json'
import apiDE from './de/api.json'
import commonDE from './de/common.json'
import flowDE from './de/flow.json'
import foodDE from './de/food.json'
import navigationDE from './de/navigation.json'
import settingsDE from './de/settings.json'
import timetableDE from './de/timetable.json'
import accessiblityEN from './en/accessibility.json'
import apiEN from './en/api.json'
import commonEN from './en/common.json'
import flowEN from './en/flow.json'
import foodEN from './en/food.json'
import navigationEN from './en/navigation.json'
import settingsEN from './en/settings.json'
import timetableEN from './en/timetable.json'

const en = {
	api: apiEN,
	common: commonEN,
	settings: settingsEN,
	navigation: navigationEN,
	food: foodEN,
	flow: flowEN,
	timetable: timetableEN,
	accessibility: accessiblityEN
}

const de = {
	api: apiDE,
	common: commonDE,
	settings: settingsDE,
	navigation: navigationDE,
	food: foodDE,
	flow: flowDE,
	timetable: timetableDE,
	accessibility: accessibilityDE
}

export const resources = {
	en,
	de
} as const

export const defaultNS = 'en'
export type LanguageKey = keyof typeof resources

const locales = getLocales()
const languageCode =
	(locales && locales.length > 0 ? locales[0].languageCode : '') ?? ''
const fallbackLanguage = defaultNS
const language = Object.keys(resources).includes(languageCode)
	? languageCode
	: fallbackLanguage

void i18n.use(initReactI18next).init({
	fallbackLng: fallbackLanguage,
	lng: language,
	compatibilityJSON: 'v4',
	interpolation: {
		escapeValue: false
	},
	resources
})
export default i18n
