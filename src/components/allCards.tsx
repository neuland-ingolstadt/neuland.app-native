import {
    USER_EMPLOYEE,
    USER_GUEST,
    USER_STUDENT,
} from '@/stores/hooks/userKind'
import { useRouter } from 'expo-router'
import React from 'react'

import { BaseCard, CalendarCard, EventsCard, FoodCard } from './Cards'

const router = useRouter()

export const AllCards: Card[] = [
    {
        key: 'timetable',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE],
        card: () => (
            <BaseCard
                title="timetable"
                icon="time"
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
        key: 'mobility',
        removable: true,
        default: [USER_STUDENT, USER_EMPLOYEE, USER_GUEST],
        card: () => (
            <BaseCard
                title="mobility"
                icon="bus"
                onPress={() => {
                    router.push('mobility')
                }}
            />
        ),
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
                icon="location"
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
                icon="people"
                onPress={() => {
                    router.push('lecturers')
                }}
            />
        ),
    },
    {
        key: 'news',
        removable: true,
        default: [],
        card: () => (
            <BaseCard
                title="news"
                icon="newspaper"
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
        card: () => (
            <BaseCard
                title="library"
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
    removable: boolean
    default: string[]
    card: () => JSX.Element
}

export interface ExtendedCard extends Card {
    text: string
}
