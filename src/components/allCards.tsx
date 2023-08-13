import {
    USER_EMPLOYEE,
    USER_GUEST,
    USER_STUDENT,
} from '@/stores/hooks/userKind'
import { useRouter } from 'expo-router'
import React from 'react'

import { BaseCard } from './Cards/BaseCard'
import { EventsCard } from './Cards/EventsCard'

const router = useRouter()

export const AllCards: Card[] = [
    {
        text: 'Exams',
        key: 'exams',
        removable: false,
        default: [USER_STUDENT],
        card: () => (
            <BaseCard
                title="Exams"
                icon="pencil"
                onPress={() => {
                    router.push('exams')
                }}
            />
        ),
    },
    {
        text: 'Timetable',
        key: 'timetable',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="Timetable"
                icon="time"
                onPress={() => {
                    router.push('timetable')
                }}
            />
        ),
    },
    {
        text: 'Mensa',
        key: 'mensa',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => (
            <BaseCard
                title="Mensa"
                icon="restaurant"
                onPress={() => {
                    router.replace('(tabs)/food')
                }}
            />
        ),
    },
    {
        text: 'Mobility',
        key: 'mobility',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => (
            <BaseCard
                title="Mobility"
                icon="bus"
                onPress={() => {
                    router.push('mobility')
                }}
            />
        ),
    },
    {
        text: 'Calendar',
        key: 'calendar',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => (
            <BaseCard
                title="Calendar"
                icon="calendar"
                onPress={() => {
                    router.push('calendar')
                }}
            />
        ),
    },
    {
        text: 'Events',
        key: 'events',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => <EventsCard />,
    },
    {
        text: 'Rooms',
        key: 'rooms',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => (
            <BaseCard
                title="Rooms"
                icon="location"
                onPress={() => {
                    router.push('rooms')
                }}
            />
        ),
    },
    {
        text: 'Lecturers',
        key: 'lecturers',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="Lecturers"
                icon="people"
                onPress={() => {
                    router.push('lecturers')
                }}
            />
        ),
    },
    {
        text: 'News',
        key: 'news',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => (
            <BaseCard
                title="News"
                icon="newspaper"
                onPress={() => {
                    router.push('news')
                }}
            />
        ),
    },
    {
        text: 'Library',
        key: 'library',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="Library"
                icon="book"
                onPress={() => {
                    router.push('library')
                }}
            />
        ),
    },
]

export interface Card {
    key: string
    text: string
    removable: boolean
    default: string[]
    card: () => JSX.Element
}
