import { useQuery } from '@tanstack/react-query'
import { use } from 'react'
import API from '@/api/thi-authenticated-api'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import type { NormalizedLecturer } from '@/types/utils'
import {
	LECTURER_GC_TIME_MS,
	LECTURER_STALE_TIME_MS,
	normalizeLecturers
} from '@/utils/lecturers-utils'

export function useLecturerLookupSources(): NormalizedLecturer[] {
	const { userKind } = use(UserKindContext)
	const { data: allLecturers = [] } = useQuery({
		queryKey: ['allLecturers'],
		queryFn: async () => normalizeLecturers(await API.getLecturers('0', 'z')),
		staleTime: LECTURER_STALE_TIME_MS,
		gcTime: LECTURER_GC_TIME_MS,
		enabled: userKind !== USER_GUEST
	})

	return allLecturers
}
