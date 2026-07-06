import {
	type UseQueryResult,
	useQueries,
	useQuery
} from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import { use, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { Funktion, type Lecturers } from '@/types/thi-api'
import type { NormalizedLecturer } from '@/types/utils'
import { extractFaculty, getPersonalData } from '@/utils/api-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import { pausedToast } from '@/utils/ui-utils'

function generateSections(lecturers: NormalizedLecturer[] | undefined): {
	title: string
	data: NormalizedLecturer[]
}[] {
	const sections = [] as {
		title: string
		data: NormalizedLecturer[]
	}[]
	let currentLetter = ''

	if (lecturers) {
		for (const lecturer of lecturers) {
			const firstLetter = lecturer.name.charAt(0).toUpperCase()
			if (firstLetter !== currentLetter) {
				currentLetter = firstLetter
				sections.push({ title: currentLetter, data: [lecturer] })
			} else {
				sections[sections.length - 1].data.push(lecturer)
			}
		}
	}

	return sections
}

export function useLecturersData(localSearch: string): {
	allLecturersResult: UseQueryResult<NormalizedLecturer[], Error>
	personalLecturersResult: UseQueryResult<NormalizedLecturer[], Error>
	isRefetchingByUserPersonal: boolean
	refetchByUserPersonal: () => Promise<unknown>
	isRefetchingByUserAll: boolean
	refetchByUserAll: () => Promise<unknown>
	facultyData: NormalizedLecturer[]
	displaysProfessors: boolean
	filteredLecturers: NormalizedLecturer[]
	sections: {
		title: string
		data: NormalizedLecturer[]
	}[]
} {
	const router = useRouter()
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { t } = useTranslation('common')

	const { data } = useQuery({
		queryKey: ['personalData'],
		queryFn: getPersonalData,
		staleTime: 1000 * 60 * 60 * 12, // 12 hours
		gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
		enabled: userKind === USER_STUDENT
	})

	const results = useQueries({
		queries: [
			{
				queryKey: ['allLecturers'],
				queryFn: async () => {
					const rawData = await API.getLecturers('0', 'z')
					const data = normalizeLecturers(rawData)
					return data
				},
				staleTime: 1000 * 60 * 30, // 30 minutes
				gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
				retry(failureCount: number, error: Error) {
					if (error instanceof NoSessionError) {
						router.navigate('/login')
						return false
					}
					return failureCount < 2
				},
				enabled: userKind !== USER_GUEST
			},
			{
				queryKey: ['personalLecturers'],
				queryFn: async () => {
					const rawData = await API.getPersonalLecturers()
					const data = normalizeLecturers(rawData)
					return data
				},
				staleTime: 1000 * 60 * 30, // 30 minutes
				gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
				retry(failureCount: number, error: Error) {
					if (error instanceof NoSessionError) {
						router.navigate('/login')
						return false
					}
					return failureCount < 2
				},
				enabled: userKind !== USER_GUEST
			}
		]
	})

	const allLecturersResult = results[0]
	const personalLecturersResult = results[1]
	const {
		isRefetchingByUser: isRefetchingByUserPersonal,
		refetchByUser: refetchByUserPersonal
	} = useRefreshByUser(personalLecturersResult.refetch)
	const {
		isRefetchingByUser: isRefetchingByUserAll,
		refetchByUser: refetchByUserAll
	} = useRefreshByUser(allLecturersResult.refetch)

	const faculty = useMemo(() => {
		if (data !== null && data !== undefined) {
			return extractFaculty(data) ?? null
		}
		return null
	}, [data])

	const filteredLecturers = useMemo(() => {
		const allData = allLecturersResult?.data ?? []
		if (localSearch !== '') {
			const options = {
				keys: ['name', 'vorname', 'tel_dienst', 'raum'],
				threshold: 0.4,
				useExtendedSearch: true
			}

			const fuse = new Fuse(allData, options)
			const result = fuse.search(localSearch)
			return result.map((item) => item.item)
		}
		return allData
	}, [allLecturersResult?.data, localSearch])

	const { facultyData, displaysProfessors } = useMemo(() => {
		const allData = allLecturersResult?.data
		if (faculty !== null) {
			const filtered =
				allData?.filter((lecturer: Lecturers) =>
					lecturer.organisation?.includes(faculty)
				) ?? []
			return { facultyData: filtered, displaysProfessors: false }
		}

		const filtered =
			allData?.filter(
				(lecturer: Lecturers) =>
					lecturer.funktion !== null &&
					lecturer.funktion === Funktion.ProfessorIn
			) ?? []

		return { facultyData: filtered, displaysProfessors: true }
	}, [faculty, allLecturersResult.data])

	const sections = useMemo(
		() => generateSections(filteredLecturers),
		[filteredLecturers]
	)

	useEffect(() => {
		if (
			(allLecturersResult.isPaused && allLecturersResult.data != null) ||
			(personalLecturersResult.isPaused && personalLecturersResult.data != null)
		) {
			pausedToast()
		}
	}, [
		allLecturersResult.data,
		allLecturersResult.isPaused,
		personalLecturersResult.data,
		personalLecturersResult.isPaused,
		t
	])

	return {
		allLecturersResult,
		personalLecturersResult,
		isRefetchingByUserPersonal,
		refetchByUserPersonal,
		isRefetchingByUserAll,
		refetchByUserAll,
		facultyData,
		displaysProfessors,
		filteredLecturers,
		sections
	}
}
