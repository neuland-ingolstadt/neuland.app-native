import AsyncStorage from '@react-native-async-storage/async-storage'
import { cancelScheduledNotificationAsync } from 'expo-notifications'
import { useEffect, useState } from 'react'

export interface TimetableEntry {
    mins: number
    language: 'de' | 'en'
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
        mins: number,
        language: 'de' | 'en'
    ) => void
    deleteTimetableNotifications: (name: string) => void
    removeNotification: (id: string, name: string) => void
}

/**
 * Custom hook that manages the route parameters of the app.
 * @returns RouteParamsHook object with routeParams and updateRouteParams properties.
 */
export function useNotifications(): Notifications {
    const [timetable, setTimetable] = useState<Record<string, TimetableEntry>>(
        {}
    )

    /**
     * Updates the timetable object and saves it to AsyncStorage.
     * @param name Name of the timetable entry
     * @param elements Array of lecture data
     * @param mins Minutes before the lecture to send the notification
     * @param language Language of the timetable entry
     * @returns void
     */
    function updateTimetable(
        name: string,
        elements: LectureData[],
        mins: number,
        language: 'de' | 'en'
    ): void {
        const timetableObject = { ...timetable }

        // updates or creates timetable entry depending on whether it already exists
        if (
            timetableObject[name] !== undefined &&
            timetableObject[name].language === language &&
            timetableObject[name].mins === mins
        ) {
            timetableObject[name].elements = [
                ...timetableObject[name].elements,
                ...elements,
            ]
        } else {
            timetableObject[name] = { mins, language, elements }
        }

        setTimetable(timetableObject)
        void AsyncStorage.setItem(
            'timetableNotifications',
            JSON.stringify(timetableObject)
        )
    }

    /**
     * Deletes a timetable entry from the timetable object and saves it to AsyncStorage.
     * @param name Name of the timetable entry
     * @returns void
     */
    function deleteTimetableNotifications(name: string): void {
        const timetableObject = { ...timetable }
        if (timetableObject[name] !== undefined) {
            const cancelPromises = timetableObject[name].elements.map(
                async (element): Promise<void> => {
                    await cancelScheduledNotificationAsync(element.id)
                }
            )
            void Promise.all(cancelPromises)

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete timetableObject[name]
            setTimetable(timetableObject)
            void AsyncStorage.setItem(
                'timetableNotifications',
                JSON.stringify(timetableObject)
            )
        }
    }

    /**
     * Removes a notification from the timetable object and cancels it.
     * @param id Id of the notification
     * @param name Name of the timetable entry
     * @returns void
     */
    function removeNotification(id: string, name: string): void {
        void cancelScheduledNotificationAsync(id)
        const timetableObject = { ...timetable }
        const timetableEntry = timetableObject[name]
        if (timetableEntry !== undefined) {
            const newElements = timetableEntry.elements.filter(
                (element) => element.id !== id
            )
            timetableObject[name] = { ...timetableEntry, elements: newElements }
            setTimetable(timetableObject)
            void AsyncStorage.setItem(
                'timetableNotifications',
                JSON.stringify(timetableObject)
            )
        }
    }

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const data = await AsyncStorage.getItem(
                    'timetableNotifications'
                )
                if (data === null) {
                    return
                }
                const parsedData = JSON.parse(data)
                if (typeof parsedData !== 'object' || parsedData === null) {
                    throw new Error('Data is not an object')
                }
                setTimetable(parsedData as Record<string, TimetableEntry>)
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
    }
}
