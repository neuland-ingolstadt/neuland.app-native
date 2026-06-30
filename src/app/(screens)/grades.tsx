import { useQuery } from '@tanstack/react-query'
import { router, useNavigation } from 'expo-router'
import Fuse from 'fuse.js'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	AppState,
	type AppStateStatus,
	Platform,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import NeulandAPI from '@/api/neuland-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/error-view'
import GradesRow from '@/components/Rows/grades-row'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import SectionView from '@/components/Universal/sections-view'
import { useRefreshByUser } from '@/hooks'
import type { GradeAverage } from '@/types/utils'
import {
	extractSpoName,
	getPersonalData,
	networkError
} from '@/utils/api-utils'
import { loadGradeAverage, loadGrades } from '@/utils/grades-utils'
import { LoadingState } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

import packageInfo from '../../../package.json'

export default function GradesSCreen(): React.JSX.Element {
	const { t } = useTranslation('settings')
	const textColor = toColor(useCSSVariable('--color-text'))
	const [gradeAverage, setGradeAverage] = useState<GradeAverage>()
	const navigation = useNavigation()
	const [localSearch, setLocalSearch] = React.useState('')

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				placeholder: t('navigation.grades.search', {
					ns: 'navigation'
				}),

				...Platform.select({
					android: {
						headerIconColor: textColor,
						hintTextColor: textColor,
						textColor: textColor
					}
				}),

				onChangeText: (event: { nativeEvent: { text: string } }) => {
					const text = event.nativeEvent.text
					setLocalSearch(text)
				}
			}
		})
	}, [navigation, t, textColor])

	const [averageLoadingState, setAverageLoadingState] = useState<LoadingState>(
		LoadingState.LOADING
	)

	async function loadAverageGrade(spoName: string | undefined): Promise<void> {
		if (isSpoLoading) {
			return
		}
		try {
			const average = await loadGradeAverage(spoWeights, spoName)
			if (average.result !== undefined && average.result !== null) {
				setGradeAverage(average)
				setAverageLoadingState(LoadingState.LOADED)
			} else {
				throw new Error('Average grade is undefined or null')
			}
		} catch {
			setAverageLoadingState(LoadingState.ERROR)
		}
	}

	const { data: spoWeights, isLoading: isSpoLoading } = useQuery({
		queryKey: ['spoWeights', packageInfo.version],
		queryFn: async () => await NeulandAPI.getSpoWeights(),
		staleTime: 1000 * 60 * 60 * 24 * 7,
		gcTime: 1000 * 60 * 60 * 24 * 14
	})

	const {
		data: grades,
		error,
		isLoading,
		isPaused,
		isSuccess,
		refetch,
		isError
	} = useQuery({
		queryKey: ['grades'],
		queryFn: loadGrades,
		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60 * 24 * 7,
		retry(_failureCount, error) {
			if (error instanceof NoSessionError) {
				router.replace('/login')
			}
			return false
		}
	})

	const UNAVAILABLE_ERRORS = [
		'Student cannot be identified',
		'No grade data available'
	]

	const isUnavailableError = UNAVAILABLE_ERRORS.some((errMsg) =>
		error?.message.includes(errMsg)
	)

	const { data: personalData } = useQuery({
		queryKey: ['personalData'],
		queryFn: getPersonalData,
		staleTime: 1000 * 60 * 60 * 12,
		gcTime: 1000 * 60 * 60 * 24 * 60
	})

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)
	useEffect(() => {
		if (personalData === undefined) return
		const spoName = extractSpoName(personalData)
		void loadAverageGrade(spoName ?? undefined)
	}, [spoWeights, grades?.finished])

	useEffect(() => {
		const handleAppStateChange = (nextAppState: AppStateStatus): void => {
			if (nextAppState === 'inactive' || nextAppState === 'background') {
				router.back()
			}
		}

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		)

		return () => {
			subscription.remove()
		}
	}, [])

	const fuseOptions = {
		keys: ['titel'],
		threshold: 0.3,
		ignoreLocation: true
	}

	const filteredGrades = React.useMemo(() => {
		if (!grades) return null
		if (localSearch === '') {
			return grades
		}

		const finishedFuse = new Fuse(grades.finished, fuseOptions)
		const missingFuse = new Fuse(grades.missing, fuseOptions)

		return {
			finished: finishedFuse.search(localSearch).map((result) => result.item),
			missing: missingFuse.search(localSearch).map((result) => result.item)
		}
	}, [grades, localSearch])

	return (
		<ScrollView
			contentContainerClassName="pb-8"
			contentInsetAdjustmentBehavior="automatic"
			refreshControl={
				isSuccess ? (
					<RefreshControl
						refreshing={isRefetchingByUser}
						onRefresh={() => {
							void refetchByUser()
						}}
					/>
				) : undefined
			}
		>
			{isLoading && (
				<View className="items-center justify-center pt-10">
					<LoadingIndicator />
				</View>
			)}
			{isError && (
				<View className="items-center justify-center pt-10">
					<ErrorView
						title={
							isUnavailableError
								? t('grades.temporarilyUnavailable')
								: error.message
						}
						onRefresh={refetchByUser}
						refreshing={isRefetchingByUser}
						isCritical={!isUnavailableError}
					/>
				</View>
			)}
			{isPaused && !isSuccess && (
				<ErrorView
					title={networkError}
					onRefresh={refetchByUser}
					refreshing={isRefetchingByUser}
				/>
			)}
			{isSuccess && grades !== null && (
				<>
					{filteredGrades?.finished.length !== 0 && (
						<>
							<SectionView title={t('grades.average')}>
								<View className="self-center rounded-md justify-center mx-page my-4 min-h-[70px] w-full">
									{averageLoadingState === LoadingState.LOADING && (
										<LoadingIndicator />
									)}
									{averageLoadingState === LoadingState.ERROR && (
										<Text className="text-text text-[15px] text-center">
											{t('grades.averageError')}
										</Text>
									)}
									{averageLoadingState === LoadingState.LOADED &&
										gradeAverage !== undefined &&
										gradeAverage !== null && (
											<View className="items-start justify-center mx-page">
												<Text className="text-text text-[25px] font-bold mb-1.5 text-center">
													{gradeAverage.resultMin !== gradeAverage.resultMax &&
														'~ '}
													{gradeAverage.result}
												</Text>

												<Text className="text-label text-sm text-left">
													{gradeAverage.resultMin === gradeAverage.resultMax
														? t('grades.exactAverage', {
																number: gradeAverage.entries.length
															})
														: t('grades.missingAverage', {
																min: gradeAverage.resultMin,
																max: gradeAverage.resultMax
															})}
												</Text>
											</View>
										)}
								</View>
							</SectionView>
							<SectionView title={t('grades.finished')} hideBackground>
								{/** biome-ignore lint/complexity/noUselessFragments: if grades are empty, we need to return something */}
								<>
									{filteredGrades?.finished.map((grade, index) => (
										<View key={index} className="mb-2">
											<GradesRow item={grade} />
										</View>
									))}
								</>
							</SectionView>
						</>
					)}
					{filteredGrades?.missing.length !== 0 && (
						<SectionView title={t('grades.open')} hideBackground>
							{/** biome-ignore lint/complexity/noUselessFragments: if grades are empty, we need to return something */}
							<>
								{filteredGrades?.missing.map((grade, index) => (
									<View key={index} className="mb-2">
										<GradesRow item={grade} />
									</View>
								))}
							</>
						</SectionView>
					)}
					<View className="self-start pb-8 px-page pt-4">
						<Text className="text-label text-xs font-normal pt-2 text-left">
							{t('grades.footer')}
						</Text>
					</View>
				</>
			)}
		</ScrollView>
	)
}
