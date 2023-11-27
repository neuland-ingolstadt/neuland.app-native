import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/hooks/userKind'
import { useRouter } from 'expo-router'
import React from 'react'

import { BaseCard, CalendarCard, EventsCard, FoodCard } from './Cards'
import LibraryCard from './Cards/LibraryCard'

const router = useRouter()

export const AllCards: Card[] = [
    {
        key: 'timetable',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="timetable"
                iosIcon="clock.fill"
                androidIcon="clock"
                onPress={() => {
                    router.push('timetable')
                }}
            />
        ),
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
        key: 'rooms',
        removable: true,
        default: [],
        card: () => (
            <BaseCard
                title="rooms"
                iosIcon="rectangle.grid.2x2.fill"
                androidIcon="view-grid"
                onPress={() => {
                    router.push('rooms')
                }}
            />
        ),
    },
    {
        key: 'lecturers',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="lecturers"
                iosIcon="person.2.fill"
                androidIcon="account-multiple"
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
        key: 'library',
        removable: true,
        default: [],
        card: () => <LibraryCard />,
    },
]

export interface Card {
    key: string
    removable: boolean
    default: string[]
    card: () => JSX.Element
}

export interface ExtendedCard extends Card {
    text: string
}
