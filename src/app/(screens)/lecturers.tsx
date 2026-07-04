import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigation, useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import type React from 'react'
import {
	use,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { useTranslation } from 'react-i18next'
import {
	FlatList,
	Linking,
	Platform,
	RefreshControl,
	SectionList,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import PagerView from '@/components/Layout/pager-view'
import LecturerRow from '@/components/Rows/lecturer-row'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import ToggleRow from '@/components/Universal/toggle-row'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { Funktion, type Lecturers } from '@/types/thi-api'
import type { NormalizedLecturer } from '@/types/utils'
import {
	extractFaculty,
	getPersonalData,
	guestError,
	networkError
} from '@/utils/api-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import { pausedToast } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function LecturersScreen(): React.JSX.Element {
	const router = useRouter()
	const { userKind = USER_GUEST } = use(UserKindContext)
	const navigation = useNavigation()
	const [selectedPage, setSelectedPage] = useState(0)
	const textColor = toColor(useCSSVariable('--color-text'))
	const { t } = useTranslation('common')
	const pagerViewRef = useRef<PagerView>(null)
	const [localSearch, setLocalSearch] = useState('')
	const [isSearchBarFocused, setLocalSearchBarFocused] = useState(false)

	function setPage(page: number): void {
		pagerViewRef.current?.setPage(page)
	}

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

	const generateSections = (
		lecturers = allLecturersResult.data
	): {
		title: string
		data: NormalizedLecturer[]
	}[] => {
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

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				placeholder: t('navigation.lecturers.search', {
					ns: 'navigation'
				}),

				...Platform.select({
					android: {
						headerIconColor: textColor,
						hintTextColor: textColor,
						textColor
					}
				}),
				shouldShowHintSearchIcon: false,
				hideWhenScrolling: false,
				hideNavigationBar: false,
				onChangeText: (event: { nativeEvent: { text: string } }) => {
					const text = event.nativeEvent.text
					setLocalSearch(text)
				},
				onFocus: () => {
					setLocalSearchBarFocused(true)
				},
				onClose: () => {
					setLocalSearchBarFocused(false)
				},
				onCancelButtonPress: () => {
					setLocalSearchBarFocused(false)
				}
			}
		})
	}, [navigation, t, textColor])

	const LecturerList = ({
		lecturers,
		isPaused,
		isError,
		isSuccess,
		error,
		isLoading,
		isPersonal = false
	}: {
		lecturers: NormalizedLecturer[] | undefined
		isPaused: boolean
		isError: boolean
		isSuccess: boolean
		error: Error | null
		isLoading: boolean
		isPersonal?: boolean
	}): React.JSX.Element => {
		const cardRadius = 17
		return isPaused && !isSuccess ? (
			<View className="px-page flex-1">
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
			<View className="px-page flex-1">
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
				contentContainerClassName="pb-bottom-safe px-page"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={
							isPersonal
								? isRefetchingByUserPersonal
								: allLecturersResult.isRefetching
						}
						onRefresh={() => {
							void (isPersonal ? refetchByUserPersonal() : refetchByUserAll())
						}}
					/>
				}
				renderItem={({ item, index }) => (
					<View
						className="mb-2"
						style={{
							overflow: 'hidden',
							borderTopStartRadius: index === 0 ? cardRadius : 0,
							borderTopEndRadius: index === 0 ? cardRadius : 0,
							borderBottomStartRadius:
								index === lecturers.length - 1 ? cardRadius : 0,
							borderBottomEndRadius:
								index === lecturers.length - 1 ? cardRadius : 0
						}}
					>
						<LecturerRow item={item} />
					</View>
				)}
			/>
		) : (
			<View className="px-page">
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

	const FilterSectionList = (): React.JSX.Element => {
		return allLecturersResult.isLoading ? (
			<View className="px-page">
				<LoadingIndicator style={styles.loadingContainer} />
			</View>
		) : allLecturersResult.isPaused ? (
			<ErrorView
				title={networkError}
				refreshing={isRefetchingByUserAll}
				onRefresh={() => {
					void refetchByUserAll()
				}}
			/>
		) : allLecturersResult.isError ? (
			<ErrorView
				title={allLecturersResult.error.message}
				refreshing={isRefetchingByUserAll}
				onRefresh={() => {
					void refetchByUserAll()
				}}
			/>
		) : (
			<>
				<View style={styles.resultsCountContainer}>
					<Text className="text-label text-[13px] px-3 text-right">
						{filteredLecturers.length} {t('pages.lecturers.results')}
					</Text>
				</View>
				<SectionList
					sections={sections}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<View className="mb-2">
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
					contentContainerClassName="mx-page pb-bottom-safe"
				/>
			</>
		)
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.page} edges={['top']}>
				{userKind === USER_GUEST ? (
					<ErrorView title={guestError} />
				) : !isSearchBarFocused ? (
					<View className="flex-1 gap-2.5 pt-2.5">
						<View className="px-page">
							<ToggleRow
								items={[
									t('pages.lecturers.personal'),
									displaysProfessors
										? t('pages.lecturers.professors')
										: t('pages.lecturers.faculty')
								]}
								selectedElement={selectedPage}
								setSelectedElement={setPage}
							/>
						</View>
						<PagerView
							style={styles.page}
							initialPage={selectedPage}
							onPageSelected={(e) => {
								setSelectedPage(e.nativeEvent.position)
							}}
							ref={pagerViewRef}
						>
							<View key="personal" style={styles.page} collapsable={false}>
								<LecturerList
									lecturers={personalLecturersResult.data}
									isPaused={personalLecturersResult.isPaused}
									isError={personalLecturersResult.isError}
									isSuccess={personalLecturersResult.isSuccess}
									error={personalLecturersResult.error}
									isLoading={personalLecturersResult.isLoading}
									isPersonal
								/>
							</View>
							<View key="faculty" style={styles.page} collapsable={false}>
								<LecturerList
									lecturers={facultyData}
									isPaused={allLecturersResult.isPaused}
									isError={allLecturersResult.isError}
									isSuccess={allLecturersResult.isSuccess}
									error={allLecturersResult.error}
									isLoading={allLecturersResult.isLoading}
								/>
							</View>
						</PagerView>
					</View>
				) : (
					<FilterSectionList />
				)}
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	loadingContainer: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center'
	},
	page: {
		flex: 1
	},
	resultsCountContainer: {
		left: 0,
		position: 'relative',
		right: 0,
		zIndex: 1
	}
})
