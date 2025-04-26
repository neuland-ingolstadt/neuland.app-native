import type { Meal } from '@/types/neuland-api'
import type {
	Exam,
	FriendlyTimetableEntry,
	NormalizedLecturer
} from '@/types/utils'
import { create } from 'zustand'

interface RouteParamsStore {
	selectedMeal: Meal | undefined
	setSelectedMeal: (selectedMeal: Meal) => void
	selectedLecture: FriendlyTimetableEntry | undefined
	setSelectedLecture: (selectedLecture: FriendlyTimetableEntry) => void
	selectedExam: Exam | undefined
	setSelectedExam: (selectedExam: Exam) => void
	selectedLecturer: NormalizedLecturer | undefined
	setSelectedLecturer: (selectedLecturer: NormalizedLecturer) => void
	htmlContent: { title: string; html: string } | undefined
	setHtmlContent: (htmlContent: { title: string; html: string }) => void
}

const useRouteParamsStore = create<RouteParamsStore>((set) => ({
	selectedMeal: undefined,
	setSelectedMeal: (selectedMeal: Meal) => {
		set({ selectedMeal })
	},
	selectedLecture: undefined,
	setSelectedLecture: (selectedLecture: FriendlyTimetableEntry) => {
		set({ selectedLecture })
	},
	selectedExam: undefined,
	setSelectedExam: (selectedExam: Exam) => {
		set({ selectedExam })
	},
	selectedLecturer: undefined,
	setSelectedLecturer: (selectedLecturer: NormalizedLecturer) => {
		set({ selectedLecturer })
	},
	htmlContent: undefined,
	setHtmlContent: (htmlContent: { title: string; html: string }) => {
		set({ htmlContent })
	}
}))

export default useRouteParamsStore
