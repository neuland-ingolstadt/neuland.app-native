import AsyncStorage from '@react-native-async-storage/async-storage'
import { cancelScheduledNotificationAsync } from 'expo-notifications'
import { useEffect, useState } from 'react'

export interface TimetableEntry {
    name: string
    mins: number
    ids: string[]
}

export interface Notifications {
    timetableNotifications: TimetableEntry[]
    updateTimetableNotifications: (entry: TimetableEntry) => void
    deleteTimetableNotifications: (name: string) => void
}

/**
 * Custom hook that manages the route parameters of the app.
 * @returns RouteParamsHook object with routeParams and updateRouteParams properties.
 */
export function useNotifications(): Notifications {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([])
    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const data = await AsyncStorage.getItem(
                    'timetableNotifications'
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

    function updateTimetable({ name, mins, ids }: TimetableEntry): void {
        console.log('updateTimetable', name, mins, ids)
        const index = timetable.findIndex((entry) => entry.name === name)

        let newArray
        if (index !== -1) {
            newArray = [...timetable]
            const oldEntry = newArray[index]
            oldEntry.ids.map(cancelScheduledNotificationAsync)
            newArray[index] = { name, mins, ids }
        } else {
            newArray = [...timetable, { name, mins, ids }]
        }

        setTimetable(newArray)
        void AsyncStorage.setItem(
            'timetableNotifications',
            JSON.stringify(newArray)
        )
        console.log('newArray', newArray)
    }

    function deleteTimetableNotifications(name: string): void {
        const index = timetable.findIndex((entry) => entry.name === name)
        console.log('deleteTimetableNotifications', name, index)
        if (index !== -1) {
            const newArray = [...timetable]
            const oldEntry = newArray[index]
            oldEntry.ids.map(cancelScheduledNotificationAsync)
            newArray.splice(index, 1)
            setTimetable(newArray)
            void AsyncStorage.setItem(
                'timetableNotifications',
                JSON.stringify(newArray)
            )
        }
    }

    return {
        timetableNotifications: timetable,
        updateTimetableNotifications: updateTimetable,
        deleteTimetableNotifications,
    }
}
