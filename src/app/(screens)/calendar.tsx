import { trackEvent } from '@aptabase/react-native'
import { useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { Suspense, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, useWindowDimensions, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import CalendarEventsPage from '@/components/Calendar/CalendarEventsPage'
import ExamsPage from '@/components/Calendar/ExamsPage'
import PagerView from '@/components/Layout/PagerView'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ToggleRow from '@/components/Universal/ToggleRow'

export default function CalendarPage(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')
	const { event } = useLocalSearchParams<{
		event: string
	}>()
	const displayTypes = [
		t('pages.calendar.events.title'),
		t('pages.calendar.exams.title')
	]
	const [selectedData, setSelectedData] = useState<number>(0)
	const primussUrl = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
	const handleLinkPress = (): void => {
		void Linking.openURL(
			selectedData === 0 ? t('pages.calendar.calendar.link') : primussUrl
		)
	}

	const screenHeight = useWindowDimensions().height
	const pagerViewRef = useRef<PagerView>(null)

	// Track which pages have been viewed
	const [viewedPages, setViewedPages] = useState<Set<number>>(new Set([0]))

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

	return (
		<View
			style={{
				...styles.viewTop,
				...styles.pagerContainer
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
				initialPage={0}
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
	viewTop: {
		paddingTop: theme.margins.page
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
