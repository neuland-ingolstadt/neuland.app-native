import { type CalendarMode } from '@/app/(tabs)/timetable'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface TimetableHook {
    timetableMode: CalendarMode
    setTimetableMode: (mode: CalendarMode) => void
}

/**
 * Custom hook that manages the users timetable mode.
 * Uses AsyncStorage to persist the mode across app sessions.
 * @returns TimetableHook object with mode and setMode properties.
 */
export function useTimetable(): TimetableHook {
    const [timetableMode, setMode] = useState<CalendarMode>('list')

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const data = (await AsyncStorage.getItem(
                    'timetableMode'
                )) as CalendarMode
                if (data != null) {
                    setTimetableMode(data)
                } else {
                    setTimetableMode('list')
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

    function setTimetableMode(mode: CalendarMode): void {
        setMode(mode)
        void AsyncStorage.setItem('timetableMode', mode)
    }

    return {
        timetableMode,
        setTimetableMode,
    }
}
