import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/ErrorView'
import PagerView from '@/components/Layout/PagerView'
import { CalendarRow, ExamRow } from '@/components/Rows/CalendarRow'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ToggleRow from '@/components/Universal/ToggleRow'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import type { Exam } from '@/types/utils'
import { guestError, networkError } from '@/utils/api-utils'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { trackEvent } from '@aptabase/react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Animated,
	Linking,
	RefreshControl,
	ScrollView,
	Text,
	View,
	useWindowDimensions
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function CalendarPage(): React.JSX.Element {
	const { userKind = USER_GUEST } = React.useContext(UserKindContext)
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')
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

	const {
		data: exams,
		error,
		isLoading,
		isError,
		isPaused,
		isSuccess,
		refetch
	} = useQuery({
		queryKey: ['exams'],
		queryFn: loadExamList,
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				router.navigate('/login')
				return false
			}
			return failureCount < 2
		},
		enabled: userKind !== USER_GUEST
	})
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)
	const screenHeight = useWindowDimensions().height
	const pagerViewRef = useRef<PagerView>(null)
	function setPage(page: number): void {
		pagerViewRef.current?.setPage(page)
	}
	const pages = ['events', 'exams']

	const CalendarFooter = (): React.JSX.Element => {
		return (
			<View style={styles.footerContainer}>
				<Text style={styles.footerText1}>
					{t('pages.calendar.footer.part1')}
					<Text style={styles.footerText2} onPress={handleLinkPress}>
						{t('pages.calendar.footer.part2')}
					</Text>
					{t('pages.calendar.footer.part3')}
				</Text>
			</View>
		)
	}

	const renderExamItem = ({ item }: { item: Exam }) => (
		<View style={styles.rowWrapper}>
			<ExamRow event={item} />
		</View>
	)

	return (
		<View
			style={{
				...styles.viewTop,
				...styles.pagerContainer
			}}
		>
			<Animated.View style={styles.toggleContainer}>
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
					trackEvent('Route', {
						path: `calendar/${pages[page]}`
					})
				}}
				scrollEnabled
				overdrag
			>
				{/* Page 1: Events */}
				<ScrollView
					contentContainerStyle={styles.itemsContainer}
					scrollEventThrottle={16}
				>
					<View>
						{calendar?.length > 0 &&
							calendar.map((item, index) => (
								<View key={`event_${index}`} style={styles.rowWrapper}>
									<CalendarRow event={item} />
								</View>
							))}
					</View>
					<CalendarFooter />
				</ScrollView>

				{/* Page 2: Exams */}

				<View style={styles.flashListContainer}>
					{isLoading ? (
						<LoadingIndicator />
					) : isError ? (
						<ErrorView
							title={error?.message ?? t('error.title')}
							onButtonPress={() => {
								void refetchByUser()
							}}
							inModal
						/>
					) : isPaused && !isSuccess ? (
						<ErrorView title={networkError} inModal />
					) : userKind === USER_GUEST ? (
						<ErrorView title={guestError} inModal />
					) : (
						<View style={styles.examPageContainer}>
							{exams && exams.length > 0 ? (
								<FlashList
									data={exams}
									renderItem={renderExamItem}
									estimatedItemSize={100}
									contentContainerStyle={styles.flashListContentContainer}
									showsVerticalScrollIndicator={false}
									scrollEventThrottle={16}
									refreshControl={
										<RefreshControl
											refreshing={isRefetchingByUser}
											onRefresh={() => {
												void refetchByUser()
											}}
										/>
									}
									ListFooterComponent={<CalendarFooter />}
								/>
							) : (
								<ScrollView contentContainerStyle={styles.emptyStateContainer}>
									<ErrorView
										title={t('pages.calendar.exams.noExams.title')}
										message={t('pages.calendar.exams.noExams.subtitle')}
										icon={{
											ios: 'calendar.badge.clock',
											android: 'calendar_clock',
											web: 'CalendarX2'
										}}
										buttonText="Primuss"
										onButtonPress={() => {
											void Linking.openURL(primussUrl)
										}}
										inModal
										isCritical={false}
									/>
									<CalendarFooter />
								</ScrollView>
							)}
						</View>
					)}
				</View>
			</PagerView>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	footerContainer: {
		marginVertical: 10,
		paddingHorizontal: theme.margins.page,
		paddingBottom: theme.margins.bottomSafeArea
	},
	footerText1: {
		color: theme.colors.labelColor,
		fontSize: 12,
		fontWeight: 'normal',
		paddingBottom: 25,
		textAlign: 'justify'
	},
	footerText2: {
		color: theme.colors.text,
		textDecorationLine: 'underline'
	},
	itemsContainer: {
		alignSelf: 'center',
		justifyContent: 'center',
		paddingHorizontal: theme.margins.page,
		width: '100%'
	},
	pagerContainer: {
		flex: 1
	},
	toggleContainer: {
		borderColor: theme.colors.border,
		paddingBottom: 12,
		paddingHorizontal: theme.margins.page
	},
	viewTop: {
		paddingTop: theme.margins.page
	},
	rowWrapper: {
		marginBottom: 8
	},
	flashListContainer: {
		flex: 1,
		width: '100%'
	},
	examPageContainer: {
		flex: 1,
		width: '100%'
	},
	flashListContentContainer: {
		paddingHorizontal: theme.margins.page
	},
	emptyStateContainer: {
		flexGrow: 1,
		paddingHorizontal: theme.margins.page
	}
}))
