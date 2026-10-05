import {
	type UseQueryResult,
	useQueries,
	useQuery
} from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import { use, useMemo } from 'react'
import API from '@/api/thi-authenticated-api'
import { NoSessionError } from '@/api/thi-session'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { Funktion, type Lecturers } from '@/types/thi-api'
import type { NormalizedLecturer } from '@/types/utils'
import { extractFaculty, getPersonalData } from '@/utils/api-utils'
import {
	LECTURER_GC_TIME_MS,
	LECTURER_STALE_TIME_MS,
	normalizeLecturers
} from '@/utils/lecturers-utils'

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
				staleTime: LECTURER_STALE_TIME_MS,
				gcTime: LECTURER_GC_TIME_MS,
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
				staleTime: LECTURER_STALE_TIME_MS,
				gcTime: LECTURER_GC_TIME_MS,
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

	return {
		allLecturersResult,
		personalLecturersResult,
		facultyData,
		displaysProfessors,
		filteredLecturers,
		sections
	}
}
