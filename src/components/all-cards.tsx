import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'

import {
	CalendarCard,
	CareerCard,
	EventsCard,
	LinkCard,
	LoginCard,
	UpNextCard
} from './Cards'
import NewsCard from './Cards/NewsCard'

export const AllCards: Card[] = [
	{
		key: 'timetable',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE],
		allowed: [USER_STUDENT, USER_EMPLOYEE],
		card: () => <UpNextCard />
	},
	{
		key: 'events',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => <EventsCard />
	},
	{
		key: 'calendar',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => <CalendarCard />
	},
	{
		key: 'links',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => <LinkCard />
	},
	{
		key: 'career',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => <CareerCard />
	},
	{
		key: 'news',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE],
		allowed: [USER_STUDENT, USER_EMPLOYEE],
		card: () => <NewsCard />
	},
	{
		key: 'login',
		removable: false,
		initial: [USER_GUEST],
		stillVisible: false,
		allowed: [USER_GUEST],
		card: () => <LoginCard />
	}
]

export interface Card {
	key: string
	removable: boolean // can the card be removed
	stillVisible?: boolean // is the card visible to not allowed users
	initial: string[] // for which user kind is the card shown by default
	allowed: string[] // for which user kind is the card allowed
	card: () => JSX.Element
}

export interface ExtendedCard extends Card {
	text: string
}
