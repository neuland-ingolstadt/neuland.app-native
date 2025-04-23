import type { MaterialIcon } from '@/types/material-icons'

import type { LucideIcon } from './Universal/Icon'

// Define the type for individual platform icons
interface PlatformIcon {
	ios: string
	iosScale?: number
	android: MaterialIcon
	web: LucideIcon
}

// Define the type for the card icons object
interface CardIcons {
	timetable: PlatformIcon
	calendar: PlatformIcon
	events: PlatformIcon
	library: PlatformIcon
	lecturers: PlatformIcon
	news: PlatformIcon
	login: PlatformIcon
	links: PlatformIcon
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
	library: {
		ios: 'books.vertical.fill',
		iosScale: 0.9,
		android: 'book_2',
		web: 'BookOpen'
	},
	lecturers: {
		ios: 'person.2.fill',
		android: 'group',
		web: 'Users'
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
