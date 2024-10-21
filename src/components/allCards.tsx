import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import React from 'react'

import {
    BaseCard,
    CalendarCard,
    EventsCard,
    FoodCard,
    LinkCard,
    LoginCard,
    TimetableCard,
} from './Cards'
import LibraryCard from './Cards/LibraryCard'

export const AllCards: Card[] = [
    {
        key: 'timetable',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => <TimetableCard />,
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
        key: 'food',
        removable: true,
        default: [USER_GUEST, USER_STUDENT, USER_EMPLOYEE],
        card: () => <FoodCard />,
    },
    {
        key: 'library',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => <LibraryCard />,
    },
    {
        key: 'links',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => <LinkCard />,
    },
    {
        key: 'news',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => <BaseCard title="news" onPressRoute="news" />,
    },
    {
        key: 'lecturers',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => <BaseCard title="lecturers" onPressRoute="lecturers" />,
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
