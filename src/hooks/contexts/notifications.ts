import AsyncStorage from '@react-native-async-storage/async-storage'
import { cancelScheduledNotificationAsync } from 'expo-notifications'
import { useEffect, useState } from 'react'

export interface TimetableEntry {
    mins: number
    elements: LectureData[]
}

export interface LectureData {
    startDateTime: Date
    room: string
    id: string
}

export interface Notifications {
    timetableNotifications: Record<string, TimetableEntry>
    updateTimetableNotifications: (
        name: string,
        elements: LectureData[],
        mins: number
    ) => void
    deleteTimetableNotifications: (name: string) => void
    removeNotification: (id: string, name: string) => void
    addNotification: (
        id: string,
        name: string,
        startDateTime: Date,
        room: string
    ) => void
}

/**
 * Custom hook that manages the route parameters of the app.
 * @returns RouteParamsHook object with routeParams and updateRouteParams properties.
 */
export function useNotifications(): Notifications {
    const [timetable, setTimetable] = useState<Record<string, TimetableEntry>>(
        {}
    )

    function updateTimetable(
        name: string,
        elements: LectureData[],
        mins: number
    ): void {
        const timetableObject = { ...timetable }

        // If the namespace already exists, merge the new elements with the existing ones
        if (timetableObject[name] !== undefined) {
            timetableObject[name].elements = [
                ...timetableObject[name].elements,
                ...elements,
            ]
        } else {
            timetableObject[name] = { mins, elements }
        }

        setTimetable(timetableObject)
        void AsyncStorage.setItem(
            'timetableNotifications5s',
            JSON.stringify(timetableObject)
        )
        console.log('newArray after update', JSON.stringify(timetableObject))
    }

    function deleteTimetableNotifications(name: string): void {
        const timetableObject = { ...timetable }
        if (timetableObject[name] !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete timetableObject[name]
            setTimetable(timetableObject)
            void AsyncStorage.setItem(
                'timetableNotifications5s',
                JSON.stringify(timetableObject)
            )
        }
    }

    function removeNotification(id: string, name: string): void {
        void cancelScheduledNotificationAsync(id)

        // remove notification from timetable
        const timetableObject = { ...timetable }
        const timetableEntry = timetableObject[name]
        if (timetableEntry !== undefined) {
            console.log('timetableEntry', timetableEntry)
            const newElements = timetableEntry.elements.filter(
                (element) => element.id !== id
            )
            console.log('remove', id, name)
            timetableObject[name] = { ...timetableEntry, elements: newElements }
            console.log(
                'newArray after remove',
                JSON.stringify(timetableObject)
            )
            setTimetable(timetableObject)
            void AsyncStorage.setItem(
                'timetableNotifications5s',
                JSON.stringify(timetableObject)
            )
        }
    }

    function addNotification(
        id: string,
        name: string,
        startDateTime: Date,
        room: string
    ): void {
        const timetableObject = { ...timetable }
        const timetableEntry = timetableObject[name]

        if (timetableEntry !== undefined) {
            const newElements = timetableEntry.elements.concat([
                { startDateTime, room, id },
            ])
            timetableObject[name] = { ...timetableEntry, elements: newElements }
            console.log('add', id, name, room, startDateTime)
            setTimetable(timetableObject)
            void AsyncStorage.setItem(
                'timetableNotifications5s',
                JSON.stringify(timetableObject)
            )
        }
    }

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const data = await AsyncStorage.getItem(
                    'timetableNotifications5s'
                )
                if (data != null) {
                    setTimetable(JSON.parse(data))
                }
            } catch (error) {
                console.error(
                    'Error while retrieving data from AsyncStorage:',
                    error
                )
            }
        }
        void loadAsyncStorageData()
    }, [])

    return {
        timetableNotifications: timetable,
        updateTimetableNotifications: updateTimetable,
        deleteTimetableNotifications,
        removeNotification,
        addNotification,
    }
}
