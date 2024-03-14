import { type CalendarMode } from '@/app/(tabs)/timetable'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

export interface TimetableHook {
    timetableMode: CalendarMode
    setTimetableMode: (mode: CalendarMode) => void
    selectedDate: Date
    setSelectedDate: (date: Date) => void
}

export const DEFAULT_TIMETABLE_MODE: CalendarMode = 'list'

/**
 * Custom hook that manages the users timetable mode.
 * Uses AsyncStorage to persist the mode across app sessions.
 * @returns TimetableHook object with mode and setMode properties.
 */
export function useTimetable(): TimetableHook {
    const [timetableMode, setMode] = useState<CalendarMode>(
        DEFAULT_TIMETABLE_MODE
    )
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    useEffect(() => {
        const loadAsyncStorageData = async (): Promise<void> => {
            try {
                const data = (await AsyncStorage.getItem(
                    'timetableMode'
                )) as CalendarMode
                if (data != null) {
                    setTimetableMode(data)
                } else {
                    setTimetableMode(DEFAULT_TIMETABLE_MODE)
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
        selectedDate,
        setSelectedDate,
    }
}
