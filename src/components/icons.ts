import type { MaterialIcon } from '@/types/material-icons';

import type { LucideIcon } from './Universal/Icon';

// Define the type for individual platform icons
interface PlatformIcon {
	ios: string;
	android: MaterialIcon;
	web: LucideIcon;
}

// Define the type for the card icons object
interface CardIcons {
	timetable: PlatformIcon;
	food: PlatformIcon;
	calendar: PlatformIcon;
	events: PlatformIcon;
	library: PlatformIcon;
	lecturers: PlatformIcon;
	news: PlatformIcon;
	login: PlatformIcon;
	links: PlatformIcon;
}

// Define the card icons object with the specified type
export const cardIcons: CardIcons = {
	timetable: {
		ios: 'clock.fill',
		android: 'calendar_month',
		web: 'CalendarDays'
	},
	food: {
		ios: 'fork.knife',
		android: 'fastfood',
		web: 'Utensils'
	},
	calendar: {
		ios: 'calendar',
		android: 'event',
		web: 'Calendar1'
	},
	events: {
		ios: 'figure.2',
		android: 'celebration',
		web: 'PartyPopper'
	},
	library: {
		ios: 'books.vertical.fill',
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
		android: 'link',
		web: 'Link'
	}
};
