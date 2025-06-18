import { trackEvent } from '@aptabase/react-native'
import { useQueries } from '@tanstack/react-query'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Animated,
	InteractionManager,
	useWindowDimensions,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { getFragmentData } from '@/__generated__/gql'
import {
	type CareerServiceEventFieldsFragment,
	CareerServiceEventFieldsFragmentDoc,
	type StudentCounsellingEventFieldsFragment,
	StudentCounsellingEventFieldsFragmentDoc
} from '@/__generated__/gql/graphql'
import CareerServiceEventsPage from '@/components/Events/CareerServiceEventsPage'
import StudentCounsellingEventsPage from '@/components/Events/StudentCounsellingEventsPage'
import PagerView from '@/components/Layout/PagerView'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ToggleRow from '@/components/Universal/ToggleRow'
import {
	loadCareerServiceEvents,
	loadStudentCounsellingEvents,
	QUERY_KEYS
} from '@/utils/events-utils'
import { pausedToast } from '@/utils/ui-utils'

export default function Events(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { styles } = useStyles(stylesheet)
	const { tab, openEvent, id } = useLocalSearchParams<{
		tab?: string
		openEvent?: string
		id?: string
	}>()
	const results = useQueries({
		queries: [
			{
				queryKey: [QUERY_KEYS.CAREER_SERVICE_EVENTS],
				queryFn: loadCareerServiceEvents,
				staleTime: 1000 * 60 * 60, // 60 minutes
				gcTime: 1000 * 60 * 60 * 24 // 24 hours
			},
			{
				queryKey: [QUERY_KEYS.STUDENT_ADVISORY_EVENTS],
				queryFn: loadStudentCounsellingEvents,
				staleTime: 1000 * 60 * 60, // 60 minutes
				gcTime: 1000 * 60 * 60 * 24 // 24 hours
			}
		]
	})

	const careerServiceResult = results[0] as {
		data?: Array<
			{ __typename?: 'CareerServiceEvent' } & {
				' $fragmentRefs'?: {
					CareerServiceEventFieldsFragment: CareerServiceEventFieldsFragment
				}
			}
		>
		isLoading: boolean
		isPaused: boolean /* ...other useQueryResult props */
	}
	const studentCounsellingResult = results[1] as {
		data?: Array<
			{ __typename?: 'StudentCounsellingEvent' } & {
				' $fragmentRefs'?: {
					StudentCounsellingEventFieldsFragment: StudentCounsellingEventFieldsFragment
				}
			}
		>
		isLoading: boolean
		isPaused: boolean /* ...other useQueryResult props */
	}

	console.log(careerServiceResult.data)
	console.log(studentCounsellingResult.data)

	const scrollY = useRef(new Animated.Value(0)).current
	const [selectedData, setSelectedData] = useState<number>(
		tab === 'student-counselling' ? 1 : 0
	)
	const screenHeight = useWindowDimensions().height

	const [viewedPages, setViewedPages] = useState<Set<number>>(
		new Set([selectedData])
	)

	useEffect(() => {
		if (
			(careerServiceResult.isPaused && careerServiceResult.data != null) ||
			(studentCounsellingResult.isPaused &&
				studentCounsellingResult.data != null)
		) {
			pausedToast()
		}
	}, [
		careerServiceResult.isPaused,
		studentCounsellingResult.isPaused,
		careerServiceResult.data,
		studentCounsellingResult.data
	])

	const pagerViewRef = useRef<PagerView>(null)
	function setPage(page: number): void {
		pagerViewRef.current?.setPage(page)
	}
	const displayTypes = [
		t('pages.events.careerService.title'),
		t('pages.events.studentCounselling.title')
	]
	const pages = ['career-service', 'student-counselling']

	const renderPage = (index: number) => {
		if (
			!viewedPages.has(index) &&
			(index === 0
				? careerServiceResult.isLoading
				: studentCounsellingResult.isLoading)
		) {
			return <LoadingIndicator />
		}

		if (index === 0) {
			const rawCareerEventsArray = careerServiceResult.data
			const events = (
				Array.isArray(rawCareerEventsArray)
					? rawCareerEventsArray.map((event) =>
							getFragmentData(CareerServiceEventFieldsFragmentDoc, event)
						)
					: []
			).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

			return <CareerServiceEventsPage events={events} />
		}

		const rawStudentCounsellingEventsArray = studentCounsellingResult.data
		const events = (
			Array.isArray(rawStudentCounsellingEventsArray)
				? rawStudentCounsellingEventsArray.map((event) =>
						getFragmentData(StudentCounsellingEventFieldsFragmentDoc, event)
					)
				: []
		).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
		return <StudentCounsellingEventsPage events={events} />
	}

	useFocusEffect(
		useCallback(() => {
			if (openEvent === 'true' && id) {
				InteractionManager.runAfterInteractions(() => {
					router.setParams({ openEvent: 'false' })
					if (selectedData === 1) {
						router.navigate({
							pathname: '/events/counselling/[id]',
							params: { id }
						})
					} else {
						router.navigate({
							pathname: '/events/career/[id]',
							params: { id }
						})
					}
				})
			}
		}, [openEvent, id, selectedData])
	)

	return (
		<View style={styles.page}>
			<Animated.View
				style={{
					borderBottomWidth: scrollY.interpolate({
						inputRange: [0, 0, 1],
						outputRange: [0, 0, 0.5],
						extrapolate: 'clamp'
					}),
					...styles.toggleContainer
				}}
			>
				<ToggleRow
					items={displayTypes}
					selectedElement={selectedData}
					setSelectedElement={setPage}
				/>
			</Animated.View>

			<PagerView
				ref={pagerViewRef}
				style={{
					...styles.pagerContainer,
					height: screenHeight
				}}
				initialPage={selectedData}
				onPageSelected={(e) => {
					const page = e.nativeEvent.position
					setSelectedData(page)

					setViewedPages((prev) => {
						if (prev.has(page)) return prev
						const newSet = new Set(prev)
						newSet.add(page)
						return newSet
					})

					trackEvent('Route', {
						path: `events/${pages[page]}`
					})
				}}
				scrollEnabled
				overdrag
			>
				{renderPage(0)}
				{renderPage(1)}
			</PagerView>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	page: {
		flex: 1,
		marginTop: theme.margins.page
	},
	pagerContainer: {
		flex: 1
	},
	toggleContainer: {
		borderColor: theme.colors.border,
		paddingBottom: 20,
		paddingHorizontal: theme.margins.page
	},
	pageContainer: {
		flex: 1
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
