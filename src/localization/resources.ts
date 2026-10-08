import accessibilityDE from './de/accessibility.json'
import apiDE from './de/api.json'
import commonDE from './de/common.json'
import flowDE from './de/flow.json'
import foodDE from './de/food.json'
import indoorNavDE from './de/indoor-nav.json'
import memberDE from './de/member.json'
import navigationDE from './de/navigation.json'
import settingsDE from './de/settings.json'
import timetableDE from './de/timetable.json'
import accessibilityEN from './en/accessibility.json'
import apiEN from './en/api.json'
import commonEN from './en/common.json'
import flowEN from './en/flow.json'
import foodEN from './en/food.json'
import indoorNavEN from './en/indoor-nav.json'
import memberEN from './en/member.json'
import navigationEN from './en/navigation.json'
import settingsEN from './en/settings.json'
import timetableEN from './en/timetable.json'

const en = {
	api: apiEN,
	common: commonEN,
	settings: settingsEN,
	navigation: navigationEN,
	food: foodEN,
	'indoor-nav': indoorNavEN,
	flow: flowEN,
	timetable: timetableEN,
	accessibility: accessibilityEN,
	member: memberEN
}

const de = {
	api: apiDE,
	common: commonDE,
	settings: settingsDE,
	navigation: navigationDE,
	food: foodDE,
	'indoor-nav': indoorNavDE,
	flow: flowDE,
	timetable: timetableDE,
	accessibility: accessibilityDE,
	member: memberDE
}

export const resources = {
	en,
	de
} as const

export const defaultNS = 'en'
export type LanguageKey = keyof typeof resources
