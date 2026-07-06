import type React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Linking, RefreshControl, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import LecturerRow from '@/components/Rows/lecturer-row'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import type { NormalizedLecturer } from '@/types/utils'
import { networkError } from '@/utils/api-utils'
import { lecturersStyles as styles } from './lecturers-styles'

interface LecturerListProps {
	lecturers: NormalizedLecturer[] | undefined
	isPaused: boolean
	isError: boolean
	isSuccess: boolean
	error: Error | null
	isLoading: boolean
	isPersonal?: boolean
	isRefetchingByUserPersonal: boolean
	isRefetchingByUserAll: boolean
	allLecturersIsRefetching: boolean
	refetchByUserPersonal: () => Promise<unknown>
	refetchByUserAll: () => Promise<unknown>
}

export default function LecturerList({
	lecturers,
	isPaused,
	isError,
	isSuccess,
	error,
	isLoading,
	isPersonal = false,
	isRefetchingByUserPersonal,
	isRefetchingByUserAll,
	allLecturersIsRefetching,
	refetchByUserPersonal,
	refetchByUserAll
}: LecturerListProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const cardRadius = 17

	return isPaused && !isSuccess ? (
		<View style={[styles.viewHorizontal, styles.page]}>
			<ErrorView
				title={networkError}
				refreshing={
					isPersonal ? isRefetchingByUserPersonal : isRefetchingByUserAll
				}
				onRefresh={() => {
					void (isPersonal ? refetchByUserPersonal() : refetchByUserAll())
				}}
			/>
		</View>
	) : isLoading ? (
		<LoadingIndicator style={styles.loadingContainer} />
	) : isError ? (
		<View style={[styles.viewHorizontal, styles.page]}>
			<ErrorView
				title={error?.message ?? t('error.title')}
				refreshing={
					isPersonal ? isRefetchingByUserPersonal : isRefetchingByUserAll
				}
				onRefresh={() => {
					void (isPersonal ? refetchByUserPersonal() : refetchByUserAll())
				}}
			/>
		</View>
	) : isSuccess && lecturers != null && lecturers?.length > 0 ? (
		<FlatList
			key={`lecturers-list-${isPersonal ? 'personal' : 'faculty'}`}
			data={lecturers}
			keyExtractor={(item) => item.id}
			contentContainerStyle={styles.loadedRows}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl
					refreshing={
						isPersonal ? isRefetchingByUserPersonal : allLecturersIsRefetching
					}
					onRefresh={() => {
						void (isPersonal ? refetchByUserPersonal() : refetchByUserAll())
					}}
				/>
			}
			renderItem={({ item, index }) => (
				<View
					style={[
						styles.rowContainer,
						{
							overflow: 'hidden',
							borderTopStartRadius: index === 0 ? cardRadius : 0,
							borderTopEndRadius: index === 0 ? cardRadius : 0,
							borderBottomStartRadius:
								index === lecturers.length - 1 ? cardRadius : 0,
							borderBottomEndRadius:
								index === lecturers.length - 1 ? cardRadius : 0
						}
					]}
				>
					<LecturerRow item={item} />
				</View>
			)}
		/>
	) : (
		<View style={styles.viewHorizontal}>
			{isPersonal ? (
				<ErrorView
					title={t('pages.lecturers.error.title')}
					message={t('pages.lecturers.error.subtitle')}
					icon={{
						ios: 'calendar.badge.exclamationmark',
						android: 'edit_calendar',
						web: 'CalendarCog'
					}}
					buttonText={t('error.empty.button', {
						ns: 'timetable'
					})}
					onButtonPress={() => {
						void Linking.openURL('https://hiplan.thi.de/')
					}}
					refreshing={isRefetchingByUserPersonal}
					onRefresh={() => {
						void refetchByUserPersonal()
					}}
					isCritical={false}
				/>
			) : (
				<ErrorView
					title={t('error.title')}
					refreshing={isRefetchingByUserAll}
					onRefresh={() => {
						void refetchByUserAll()
					}}
				/>
			)}
		</View>
	)
}
