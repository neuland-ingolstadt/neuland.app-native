import {
    USER_EMPLOYEE,
    USER_GUEST,
    USER_STUDENT,
} from '@/hooks/contexts/userKind'
import { useRouter } from 'expo-router'
import React from 'react'

import {
    BaseCard,
    CalendarCard,
    EventsCard,
    FoodCard,
    LoginCard,
    TimetableCard,
} from './Cards'
import LibraryCard from './Cards/LibraryCard'

const router = useRouter()

export const cardIcons = {
    timetable: {
        ios: 'clock.fill',
        android: 'calendar_month',
    },
    food: {
        ios: 'fork.knife',
        android: 'restaurant',
    },
    calendar: {
        ios: 'calendar',
        android: 'event',
    },
    events: {
        ios: 'party.popper.fill',
        android: 'celebration',
    },
    library: {
        ios: 'books.vertical.fill',
        android: 'book',
    },
    lecturers: {
        ios: 'person.2.fill',
        android: 'group',
    },
    news: {
        ios: 'newspaper.fill',
        android: 'newspaper',
    },
    login: {
        ios: 'person.fill.questionmark',
        android: 'person',
    },
}
export const AllCards: Card[] = [
    {
        key: 'timetable',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => <TimetableCard />,
    },
    {
        key: 'food',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => <FoodCard />,
    },
    {
        key: 'calendar',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => <CalendarCard />,
    },
    {
        key: 'events',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => <EventsCard />,
    },
    {
        key: 'library',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => <LibraryCard />,
    },
    {
        key: 'lecturers',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="lecturers"
                onPress={() => {
                    router.push('lecturers')
                }}
            />
        ),
    },
    {
        key: 'news',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="news"
                onPress={() => {
                    router.push('news')
                }}
            />
        ),
    },
    {
        key: 'login',
        removable: false,
        exclusive: true,
        default: [USER_GUEST],
        card: () => <LoginCard />,
    },
]

export interface Card {
    key: string
    removable: boolean
    exclusive?: boolean
    default: string[]
    card: () => JSX.Element
}

export interface ExtendedCard extends Card {
    text: string
}
