import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { zustandStorage } from '@/utils/storage'

export enum TimetableMode {
	List = 'list',
	Timeline1 = 'timeline-1',
	// 3 Mode scrolls by 1 at a time
	Timeline3 = 'timeline-3',
	// 5 mode scrolls by 5 at a time and hides WE
	Timeline5 = 'timeline-5',
	// 7 mode scrolls by 7 at a time
	Timeline7 = 'timeline-7'
}

interface TimetableStore {
	timetableMode: TimetableMode
	showCalendarEvents: boolean
	showExams: boolean
	selectedDate: Date
	hasPendingTimetableUpdate: boolean
	setTimetableMode: (timetableMode: TimetableMode) => void
	setShowCalendarEvents: (show: boolean) => void
	setShowExams: (show: boolean) => void
	setSelectedDate: (date: Date) => void
	setHasPendingTimetableUpdate: (value: boolean) => void
}

const initialState: Omit<
	TimetableStore,
	| 'setTimetableMode'
	| 'setShowCalendarEvents'
	| 'setShowExams'
	| 'setSelectedDate'
	| 'setHasPendingTimetableUpdate'
> = {
	timetableMode: TimetableMode.Timeline3,
	showCalendarEvents: false,
	showExams: true,
	selectedDate: new Date(),
	hasPendingTimetableUpdate: false
}

export const useTimetableStore = create<TimetableStore>()(
	persist(
		(set) => ({
			...initialState,
			setTimetableMode: (timetableMode: TimetableMode) => {
				set({ timetableMode, hasPendingTimetableUpdate: true })
			},
			setShowCalendarEvents: (showCalendarEvents: boolean) => {
				set({ showCalendarEvents })
			},
			setShowExams: (showExams: boolean) => {
				set({ showExams })
			},
			setSelectedDate: (selectedDate: Date) => {
				set({ selectedDate })
			},
			// This is the best way to handle mode changes to handle the heavy UI update and trigger a clean render, as the timetable sometimes fails to keep the current data when changing modes.
			setHasPendingTimetableUpdate: (value: boolean) => {
				set({ hasPendingTimetableUpdate: value })
			}
		}),
		{
			name: 'timetable-storage',
			storage: createJSONStorage(() => zustandStorage)
		}
	)
)
