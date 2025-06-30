import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { use } from 'react'
import { NoSessionError } from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import type { Exam } from '@/types/utils'
import { loadExamList } from '@/utils/calendar-utils'

/**
 * Hook to fetch exam data with consistent caching across the app
 * @returns Query result with exam data
 */
export function useExamData() {
	const { userKind = USER_GUEST } = use(UserKindContext)

	return useQuery({
		queryKey: ['examData'],
		queryFn: loadExamList,
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				router.navigate('/login')
				return false
			}
			return failureCount < 2
		},
		enabled: userKind !== USER_GUEST
	})
}

/**
 * Transform exam data for use in CalendarCard
 * @param exams Raw exam data from API
 * @param t Translation function
 * @returns Transformed exam data for calendar display
 */
export function transformExamsForCalendar(
	exams: Exam[],
	t: (key: string, options?: Record<string, unknown>) => string
) {
	return exams.map((x) => ({
		name: t('navigation:cards.calendar.exam', { name: x.name }),
		begin: new Date(x.date),
		isExam: true
	}))
}
