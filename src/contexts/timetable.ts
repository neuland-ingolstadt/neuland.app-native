import { type CalendarMode } from '@/app/(tabs)/(timetable)/timetable'
import { useState } from 'react'
import { useMMKVString } from 'react-native-mmkv'

export interface TimetableHook {
    timetableMode: string | undefined
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
    const [timetableMode, setTimetableMode] = useMMKVString('timetableMode')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    return {
        timetableMode,
        setTimetableMode,
        selectedDate,
        setSelectedDate,
    }
}
