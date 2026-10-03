import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { use } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import {
	type Edges,
	SafeAreaProvider,
	SafeAreaView
} from 'react-native-safe-area-context'
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
import { ServiceStatus } from '@/utils/gatus-status'
import {
	getFriendlyTimetable,
	TIMETABLE_GC_TIME_MS,
	TIMETABLE_STALE_TIME_MS
} from '@/utils/timetable-utils'
import { TIMETABLE_IGNORED_ERRORS } from '@/utils/up-next-utils'
import { EmptyTimetableAnimation } from './empty-timetable-animation'

export const loadTimetable = async (): Promise<FriendlyTimetableEntry[]> => {
	const timetable = await getFriendlyTimetable(new Date(), true)
	if (timetable.length === 0) {
		throw new Error('Timetable is empty')
	}
	return timetable
}

const LoadingView = (): React.JSX.Element => (
	<View style={styles.loadingView}>
		<LoadingIndicator />
	</View>
)

function TimetableScreen(): React.JSX.Element {
	const timetableMode = useTimetableStore((state) => state.timetableMode)

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
		staleTime: TIMETABLE_STALE_TIME_MS,
		gcTime: TIMETABLE_GC_TIME_MS,
		retry(failureCount, error) {
			return (
				!TIMETABLE_IGNORED_ERRORS.includes(
					error?.message as (typeof TIMETABLE_IGNORED_ERRORS)[number]
				) && failureCount < 2
			)
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

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	const edges =
		Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
			? (['top'] as Edges)
			: (['bottom', 'top'] as Edges)
	return (
		<SafeAreaProvider>
			<SafeAreaView testID="timetable-screen" style={styles.page} edges={edges}>
				{isLoading ? (
					<LoadingView />
				) : isSuccess && timetable !== undefined && timetable.length > 0 ? (
					timetableMode === TimetableMode.List ? (
						<TimetableList timetable={timetable} exams={exams ?? []} />
					) : (
						<TimetableWeek timetable={timetable} exams={exams ?? []} />
					)
				) : isPaused && !isSuccess ? (
					<ErrorView
						title={networkError}
						statusServices={ServiceStatus.Thi}
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

const styles = StyleSheet.create({
	loadingView: {
		alignItems: 'center',
		flex: 1,
		height: '100%',
		justifyContent: 'center',
		position: 'absolute',
		width: '100%'
	},
	page: {
		flex: 1
	}
})
