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
                iosIcon="person.2.fill"
                androidIcon="group"
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
                iosIcon="newspaper.fill"
                androidIcon="newspaper"
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
