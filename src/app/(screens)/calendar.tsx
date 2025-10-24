import { trackEvent } from '@aptabase/react-native'
import { router, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, useWindowDimensions, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import CalendarEventsPage from '@/components/Calendar/calendar-events-page'
import ExamsPage from '@/components/Calendar/exams-page'
import PagerView from '@/components/Layout/pager-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import ToggleRow from '@/components/Universal/toggle-row'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'

export default function CalendarPage(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')
	const headerPadding = useTransparentHeaderPadding() + 12
	const { event, openExam } = useLocalSearchParams<{
		event?: string
		openExam?: string
	}>()

	const shouldOpenExam = openExam === 'true'
	const [initialPage, _] = useState(shouldOpenExam ? 1 : 0)

	const displayTypes = [
		t('pages.calendar.events.title'),
		t('pages.calendar.exams.title')
	]
	const [selectedData, setSelectedData] = useState<number>(initialPage)
	const primussUrl = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
	const handleLinkPress = (): void => {
		void Linking.openURL(
			selectedData === 0 ? t('pages.calendar.calendar.link') : primussUrl
		)
	}

	const screenHeight = useWindowDimensions().height
	const pagerViewRef = useRef<PagerView>(null)

	const [viewedPages, setViewedPages] = useState<Set<number>>(
		() => new Set([initialPage])
	)

	function setPage(page: number): void {
		pagerViewRef.current?.setPage(page)
	}
	const pages = ['events', 'exams']

	// Render page function for lazy loading
	const renderPage = (index: number) => {
		if (!viewedPages.has(index)) {
			return <LoadingIndicator />
		}

		return (
			<View style={styles.pageContainer}>
				<Suspense
					fallback={
						<View style={styles.centerContainer}>
							<LoadingIndicator />
						</View>
					}
				>
					{index === 0 ? (
						<CalendarEventsPage
							handleLinkPress={handleLinkPress}
							selectedEventId={event}
						/>
					) : (
						<ExamsPage
							primussUrl={primussUrl}
							handleLinkPress={handleLinkPress}
						/>
					)}
				</Suspense>
			</View>
		)
	}

	useEffect(() => {
		if (shouldOpenExam) {
			setSelectedData(1)
			setViewedPages((prev) => new Set([...prev, 1]))
			pagerViewRef.current?.setPage(1)
			// requestIdleCallback to ensure navigation happens after transition is done
			requestIdleCallback(() => {
				router.setParams({ openExam: '' })

				router.navigate({
					pathname: '/exam'
				})
			})
		}
	}, [shouldOpenExam])

	return (
		<View
			style={{
				...styles.pagerContainer,
				paddingTop: headerPadding
			}}
		>
			<View style={styles.toggleContainer}>
				<ToggleRow
					items={displayTypes}
					selectedElement={selectedData}
					setSelectedElement={setPage}
				/>
			</View>

			<PagerView
				ref={pagerViewRef}
				style={{
					...styles.pagerContainer,
					height: screenHeight
				}}
				initialPage={initialPage}
				onPageSelected={(e) => {
					const page = e.nativeEvent.position
					setSelectedData(page)

					// Only update state if the page is not already viewed
					setViewedPages((prev) => {
						if (prev.has(page)) return prev
						const newSet = new Set(prev)
						newSet.add(page)
						return newSet
					})

					trackEvent('Route', {
						path: `calendar/${pages[page]}`
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
	pagerContainer: {
		flex: 1
	},
	toggleContainer: {
		borderColor: theme.colors.border,
		paddingBottom: 14,
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
