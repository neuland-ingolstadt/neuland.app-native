import type { UseQueryResult } from '@tanstack/react-query'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, Text, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import LecturerRow from '@/components/Rows/lecturer-row'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useRefreshByUser } from '@/hooks'
import type { NormalizedLecturer } from '@/types/utils'
import { networkError } from '@/utils/api-utils'
import { lecturersStyles as styles } from './lecturers-styles'

interface LecturerSearchSectionListProps {
	queryResult: UseQueryResult<NormalizedLecturer[], Error>
	filteredLecturersCount: number
	sections: {
		title: string
		data: NormalizedLecturer[]
	}[]
}

export default function LecturerSearchSectionList({
	queryResult,
	filteredLecturersCount,
	sections
}: LecturerSearchSectionListProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(
		queryResult.refetch
	)
	const { isLoading, isPaused, isError, error } = queryResult

	return isLoading ? (
		<View style={styles.viewHorizontal}>
			<LoadingIndicator style={styles.loadingContainer} />
		</View>
	) : isPaused ? (
		<ErrorView
			title={networkError}
			refreshing={isRefetchingByUser}
			onRefresh={() => {
				void refetchByUser()
			}}
		/>
	) : isError ? (
		<ErrorView
			title={error?.message ?? t('error.title')}
			refreshing={isRefetchingByUser}
			onRefresh={() => {
				void refetchByUser()
			}}
		/>
	) : (
		<>
			<View style={styles.resultsCountContainer}>
				<Text className="text-label text-[13px] px-3 text-right">
					{filteredLecturersCount} {t('pages.lecturers.results')}
				</Text>
			</View>
			<SectionList
				sections={sections}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.rowContainer}>
						<LecturerRow item={item} />
					</View>
				)}
				renderSectionHeader={({ section: { title } }) => (
					<View className="bg-background px-1 py-2">
						<Text className="text-text text-[17px] font-bold uppercase">
							{title}
						</Text>
					</View>
				)}
				contentContainerStyle={styles.contentContainer}
			/>
		</>
	)
}
