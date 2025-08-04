import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, RefreshControl, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { NoSessionError } from '@/api/thi-session-handler'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { USER_GUEST } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import type { Exam } from '@/types/utils'
import { guestError, networkError } from '@/utils/api-utils'
import { loadExamList } from '@/utils/calendar-utils'
import { ExamRow } from '../Rows/calendar-row'

export default function ExamsPage({
	primussUrl,
	handleLinkPress
}: {
	primussUrl: string
	handleLinkPress: () => void
}): React.JSX.Element {
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

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
		<View style={styles.container}>
			{isLoading ? (
				<View style={styles.loadingContainer}>
					<LoadingIndicator />
				</View>
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
				<ErrorView title={guestError} />
			) : (
				<View style={styles.examPageContainer}>
					{exams && exams.length > 0 ? (
						<FlashList
							data={exams}
							renderItem={renderExamItem}
							estimatedItemSize={80}
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
							ListHeaderComponent={
								<Text style={styles.sectionHeaderText}>
									{t('pages.calendar.exams.subtitle')}
								</Text>
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
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		flex: 1,
		width: '100%'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	footerContainer: {
		marginVertical: 4,
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
	rowWrapper: {
		marginBottom: 8
	},
	examPageContainer: {
		flex: 1,
		width: '100%'
	},
	flashListContentContainer: {
		paddingHorizontal: theme.margins.page
	},
	emptyStateContainer: {
		paddingHorizontal: theme.margins.page
	},
	sectionHeaderText: {
		color: theme.colors.text,
		fontSize: 19,
		fontWeight: '600',
		paddingBottom: 12,
		paddingTop: 8
	}
}))
