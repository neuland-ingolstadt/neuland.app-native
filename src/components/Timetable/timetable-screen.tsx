import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { use } from 'react'
import { Platform, View } from 'react-native'
import {
	type Edges,
	SafeAreaProvider,
	SafeAreaView
} from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import TimetableList from '@/components/Timetable/timetable-list'
import TimetableWeek from '@/components/Timetable/timetable-week'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { USER_GUEST } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { TimetableMode, useTimetableStore } from '@/hooks/useTimetableStore'
import type { FriendlyTimetableEntry } from '@/types/utils'
import { guestError, networkError } from '@/utils/api-utils'
import { loadExamList } from '@/utils/calendar-utils'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { EmptyTimetableAnimation } from './empty-timetable-animation'
export const loadTimetable = async (): Promise<FriendlyTimetableEntry[]> => {
	const timetable = await getFriendlyTimetable(new Date(), true)
	if (timetable.length === 0) {
		throw new Error('Timetable is empty')
	}
	return timetable
}

const LoadingView = (): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	return (
		<View style={styles.loadingView}>
			<LoadingIndicator />
		</View>
	)
}
function TimetableScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)

	const timetableMode = useTimetableStore((state) => state.timetableMode)
	const showCampusLifeEvents = useTimetableStore(
		(state) => state.showCampusLifeEvents
	)

	const { userKind } = use(UserKindContext)

	const {
		data: timetable,
		error,
		isLoading,
		isPaused,
		isSuccess,
		refetch
	} = useQuery({
		queryKey: ['timetableV2', userKind],
		queryFn: loadTimetable,
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24 * 7,
		retry(_, error) {
			const ignoreErrors = [
				'"Time table does not exist" (-202)',
				'Timetable is empty'
			]
			if (ignoreErrors.includes(error?.message)) {
				return false
			}
			return false
		},
		enabled: userKind !== USER_GUEST
	})

	const { data: exams } = useQuery({
		queryKey: ['exams'],
		queryFn: loadExamList,
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24,
		enabled: userKind !== USER_GUEST
	})

	const { data: campusLifeEvents } = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS],
		queryFn: () => loadCampusLifeEvents(),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 6,
		enabled: showCampusLifeEvents
	})

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	const edges =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
			? (['top'] as Edges)
			: (['bottom', 'top'] as Edges)
	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.page} edges={edges}>
				{isLoading ? (
					<LoadingView />
				) : isSuccess && timetable !== undefined && timetable.length > 0 ? (
					timetableMode === TimetableMode.List ? (
						<TimetableList
							timetable={timetable}
							exams={exams ?? []}
							campusLifeEvents={
								showCampusLifeEvents ? (campusLifeEvents ?? []) : []
							}
						/>
					) : (
						<TimetableWeek
							timetable={timetable}
							exams={exams ?? []}
							campusLifeEvents={
								showCampusLifeEvents ? (campusLifeEvents ?? []) : []
							}
						/>
					)
				) : isPaused && !isSuccess ? (
					<ErrorView
						title={networkError}
						refreshing={isRefetchingByUser}
						onRefresh={() => {
							void refetchByUser()
						}}
					/>
				) : error?.message === '"Time table does not exist" (-202)' ||
					error?.message === 'Timetable is empty' ? (
					<EmptyTimetableAnimation
						isEmpty={error?.message === 'Timetable is empty'}
						onRefresh={() => {
							void refetchByUser()
						}}
					/>
				) : userKind === USER_GUEST ? (
					<ErrorView title={guestError} />
				) : error ? (
					<ErrorView
						title={error?.message ?? 'An error occurred'}
						refreshing={isRefetchingByUser}
						onRefresh={() => {
							void refetchByUser()
						}}
					/>
				) : null}
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default TimetableScreen

const stylesheet = createStyleSheet((theme) => ({
	loadingView: {
		alignItems: 'center',
		backgroundColor: theme.colors.background,
		flex: 1,
		height: '100%',
		justifyContent: 'center',
		position: 'absolute',
		width: '100%'
	},
	page: {
		flex: 1
	}
}))
