import type { UseQueryResult } from '@tanstack/react-query'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Linking, RefreshControl, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import LecturerRow from '@/components/Rows/lecturer-row'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useRefreshByUser } from '@/hooks'
import type { NormalizedLecturer } from '@/types/utils'
import { networkError } from '@/utils/api-utils'
import { lecturersStyles as styles } from './lecturers-styles'

interface LecturerListProps {
	queryResult: UseQueryResult<NormalizedLecturer[], Error>
	lecturers: NormalizedLecturer[] | undefined
	variant: 'personal' | 'faculty'
}

export default function LecturerList({
	queryResult,
	lecturers,
	variant
}: LecturerListProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(
		queryResult.refetch
	)
	const isPersonal = variant === 'personal'
	const cardRadius = 17
	const { isPaused, isError, isSuccess, error, isLoading, isRefetching } =
		queryResult

	return isPaused && !isSuccess ? (
		<View style={[styles.viewHorizontal, styles.page]}>
			<ErrorView
				title={networkError}
				refreshing={isRefetchingByUser}
				onRefresh={() => {
					void refetchByUser()
				}}
			/>
		</View>
	) : isLoading ? (
		<LoadingIndicator style={styles.loadingContainer} />
	) : isError ? (
		<View style={[styles.viewHorizontal, styles.page]}>
			<ErrorView
				title={error?.message ?? t('error.title')}
				refreshing={isRefetchingByUser}
				onRefresh={() => {
					void refetchByUser()
				}}
			/>
		</View>
	) : isSuccess && lecturers != null && lecturers?.length > 0 ? (
		<FlatList
			key={`lecturers-list-${variant}`}
			data={lecturers}
			keyExtractor={(item) => item.id}
			contentContainerStyle={styles.loadedRows}
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl
					refreshing={isPersonal ? isRefetchingByUser : isRefetching}
					onRefresh={() => {
						void refetchByUser()
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
						void Linking.openURL('[REDACTED]/')
					}}
					refreshing={isRefetchingByUser}
					onRefresh={() => {
						void refetchByUser()
					}}
					isCritical={false}
				/>
			) : (
				<ErrorView
					title={t('error.title')}
					refreshing={isRefetchingByUser}
					onRefresh={() => {
						void refetchByUser()
					}}
				/>
			)}
		</View>
	)
}
