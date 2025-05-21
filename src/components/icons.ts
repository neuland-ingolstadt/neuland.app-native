import type { MaterialIcon } from '@/types/material-icons'
import type { LucideIcon } from './Universal/Icon'
import type { AllCards } from './all-cards'

// Define the type for individual platform icons
interface PlatformIcon {
	ios: string
	iosScale?: number
	android: MaterialIcon
	web: LucideIcon
}

type CardKey = (typeof AllCards)[number]['key']

type CardIcons = Record<CardKey, PlatformIcon>

export const cardIcons: CardIcons = {
	timetable: {
		ios: 'clock.fill',
		iosScale: 1.05,
		android: 'calendar_month',
		web: 'CalendarDays'
	},
	calendar: {
		ios: 'graduationcap.fill',
		android: 'school',
		web: 'GraduationCap'
	},
	events: {
		ios: 'figure.2',
		android: 'celebration',
		web: 'PartyPopper'
	},
	thiServices: {
		ios: 'briefcase.fill',
		android: 'work',
		web: 'Briefcase'
	},
	news: {
		ios: 'newspaper.fill',
		android: 'newspaper',
		web: 'Newspaper'
	},
	login: {
		ios: 'person.fill.questionmark',
		android: 'person',
		web: 'UserCheck'
	},
	links: {
		ios: 'safari.fill',
		iosScale: 1.05,
		android: 'link',
		web: 'Link'
	}
}
