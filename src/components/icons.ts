import type { MaterialIcon } from '@/types/material-icons'

import type { LucideIcon } from './Universal/Icon'

// Define the type for individual platform icons
interface PlatformIcon {
	ios: string
	iosScale?: number
	android: MaterialIcon
	web: LucideIcon
}

interface CardIcons {
	timetable: PlatformIcon
	calendar: PlatformIcon
	events: PlatformIcon
	news: PlatformIcon
	login: PlatformIcon
	links: PlatformIcon
	career: PlatformIcon
}

// Define the card icons object with the specified type
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
	career: {
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
