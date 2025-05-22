import { getFragmentData } from '@/__generated__/gql'
import {
	CareerServiceEventFieldsFragmentDoc,
	type CareerServiceEventsQuery,
	StudentAdvisoryEventFieldsFragmentDoc,
	type StudentAdvisoryEventsQuery
} from '@/__generated__/gql/graphql'
import CareerServiceEventsPage from '@/components/Events/CareerServiceEventsPage'
import StudentAdvisoryEventsPage from '@/components/Events/StudentAdvisoryEventsPage'
import PagerView from '@/components/Layout/PagerView'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ToggleRow from '@/components/Universal/ToggleRow'
import {
	QUERY_KEYS,
	loadCareerServiceEvents,
	loadStudentAdvisoryEvents
} from '@/utils/events-utils'
import { pausedToast } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { useQueries } from '@tanstack/react-query'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, View, useWindowDimensions } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Events(): React.JSX.Element {
	const { t } = useTranslation('common')
	const { styles } = useStyles(stylesheet)
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
				queryFn: loadStudentAdvisoryEvents,
				staleTime: 1000 * 60 * 60, // 60 minutes
				gcTime: 1000 * 60 * 60 * 24 // 24 hours
			}
		]
	})

	const careerServiceResult = results[0] as {
		data?: CareerServiceEventsQuery
		isLoading: boolean
		isPaused: boolean /* ...other useQueryResult props */
	}
	const studentAdvisoryResult = results[1] as {
		data?: StudentAdvisoryEventsQuery
		isLoading: boolean
		isPaused: boolean /* ...other useQueryResult props */
	}

	const scrollY = useRef(new Animated.Value(0)).current
	const [selectedData, setSelectedData] = useState<number>(0)
	const screenHeight = useWindowDimensions().height

	const [viewedPages, setViewedPages] = useState<Set<number>>(new Set([0]))

	useEffect(() => {
		if (
			(careerServiceResult.isPaused && careerServiceResult.data != null) ||
			(studentAdvisoryResult.isPaused && studentAdvisoryResult.data != null)
		) {
			pausedToast()
		}
	}, [
		careerServiceResult.isPaused,
		studentAdvisoryResult.isPaused,
		careerServiceResult.data,
		studentAdvisoryResult.data
	])

	const pagerViewRef = useRef<PagerView>(null)
	function setPage(page: number): void {
		pagerViewRef.current?.setPage(page)
	}
	const displayTypes = [
		t('pages.events.careerService.title'),
		t('pages.events.studentAdvisory.title')
	]
	const pages = ['career-service', 'student-advisory']

	const renderPage = (index: number) => {
		if (
			!viewedPages.has(index) &&
			(index === 0
				? careerServiceResult.isLoading
				: studentAdvisoryResult.isLoading)
		) {
			return <LoadingIndicator />
		}

		if (index === 0) {
			const rawCareerEventsArray = careerServiceResult.data?.careerServiceEvents
			const events = Array.isArray(rawCareerEventsArray)
				? rawCareerEventsArray.map((event) =>
						getFragmentData(CareerServiceEventFieldsFragmentDoc, event)
					)
				: []
			return <CareerServiceEventsPage events={events} />
		}

		const rawStudentAdvisoryEventsArray =
			studentAdvisoryResult.data?.studentAdvisoryEvents
		const events = Array.isArray(rawStudentAdvisoryEventsArray)
			? rawStudentAdvisoryEventsArray.map((event) =>
					getFragmentData(StudentAdvisoryEventFieldsFragmentDoc, event)
				)
			: []
		return <StudentAdvisoryEventsPage events={events} />
	}

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
				initialPage={0}
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
