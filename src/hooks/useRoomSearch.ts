import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import { useRefreshByUser } from '@/hooks/useRefreshByUser'
import type { AvailableRoom } from '@/types/utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
	BUILDINGS_ALL,
	DURATION_PRESET,
	filterRooms,
	getNextValidDate
} from '@/utils/map-utils'

const FREE_ROOMS_STALE_TIME_MS = 1000 * 60 * 60
const FREE_ROOMS_GC_TIME_MS = 1000 * 60 * 60 * 24 * 4

export interface RoomSearchState {
	building: string
	setBuilding: (building: string) => void
	date: string
	setDate: (date: string) => void
	time: string
	setTime: (time: string) => void
	duration: string
	setDuration: (duration: string) => void
	rooms: AvailableRoom[] | null
	filterError: boolean
	isLoading: boolean
	isError: boolean
	isPaused: boolean
	error: Error | null
	refetchByUser: () => Promise<unknown>
	startDate: Date
	wasModified: boolean
	isDateAndTimeEqualToStart: boolean
	searchDateTime: Date
}

export function useRoomSearch(): RoomSearchState {
	const router = useRouter()
	const { startDate, wasModified } = getNextValidDate()

	const [building, setBuilding] = useState(BUILDINGS_ALL)
	const [date, setDate] = useState(() => formatISODate(startDate))
	const [time, setTime] = useState(() => formatISOTime(startDate))
	const [duration, setDuration] = useState(DURATION_PRESET)

	const searchDateTime = useMemo(
		() => new Date(`${date}T${time}`),
		[date, time]
	)

	const { data, error, isLoading, isError, isPaused, refetch } = useQuery({
		queryKey: ['freeRooms', date],
		queryFn: async () => await API.getFreeRooms(searchDateTime),
		staleTime: FREE_ROOMS_STALE_TIME_MS,
		gcTime: FREE_ROOMS_GC_TIME_MS,
		retry(failureCount, queryError) {
			if (queryError instanceof NoSessionError) {
				router.replace('/login')
				return false
			}
			return failureCount < 2
		}
	})

	const { rooms, filterError } = useMemo(() => {
		if (data === undefined) {
			return { rooms: null as AvailableRoom[] | null, filterError: false }
		}
		try {
			const validateDate = new Date(date)
			if (Number.isNaN(validateDate.getTime())) {
				throw new Error('Invalid date')
			}
			const filteredRooms = filterRooms(data, date, time, building, duration)
			if (filteredRooms == null) {
				throw new Error('Error while filtering rooms')
			}
			return { rooms: filteredRooms, filterError: false }
		} catch (filteringError) {
			console.error(filteringError)
			return { rooms: null, filterError: true }
		}
	}, [building, data, date, duration, time])

	const { refetchByUser } = useRefreshByUser(refetch)

	const isDateAndTimeEqualToStart =
		startDate.getHours() === Number.parseInt(time.split(':')[0], 10) &&
		startDate.getMinutes() === Number.parseInt(time.split(':')[1], 10) &&
		formatISODate(startDate) === date

	return {
		building,
		setBuilding,
		date,
		setDate,
		time,
		setTime,
		duration,
		setDuration,
		rooms,
		filterError,
		isLoading,
		isError,
		isPaused,
		error,
		refetchByUser,
		startDate,
		wasModified,
		isDateAndTimeEqualToStart,
		searchDateTime
	}
}
