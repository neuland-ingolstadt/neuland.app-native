import type React from 'react'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import { type FeatureFlagKey, FeatureFlagKeys } from '@/lib/feature-flags'
import CalendarCard from './Cards/calendar-card'
import EventsCard from './Cards/events-card'
import LinkCard from './Cards/link-card'
import LoginCard from './Cards/login-card'
import NewsCard from './Cards/news-card'
import SportsCard from './Cards/sports-card'
import ThiEventsCard from './Cards/thi-events-card'
import UpNextCard from './Cards/up-next/up-next-card'

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
		key: 'thiEvents',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		featureFlag: FeatureFlagKeys.thiEventsVisible,
		card: () => <ThiEventsCard />
	},
	{
		key: 'sports',
		removable: true,
		initial: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		allowed: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
		card: () => <SportsCard />
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
	featureFlag?: FeatureFlagKey
	card: () => React.JSX.Element
}

export interface ExtendedCard extends Card {
	text: string
}
