import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, RefreshControl, ScrollView, Text, View } from 'react-native'
import { NoSessionError } from '@/api/thi-session'
import { CalendarFooter } from '@/components/Calendar/calendar-footer'
import { UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import { ExamRow } from '@/components/Rows/calendar-row'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { FlashList } from '@/components/Universal/styled'
import { USER_GUEST } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import type { Exam } from '@/types/utils'
import { guestError, networkError } from '@/utils/api-utils'
import { loadExamList } from '@/utils/calendar-utils'
import { ServiceStatus } from '@/utils/gatus-status'

const renderExamItem = ({ item }: { item: Exam }) => (
	<View className="mb-2">
		<ExamRow event={item} />
	</View>
)

export default function ExamsPage({
	primussUrl,
	handleLinkPress
}: {
	primussUrl: string
	handleLinkPress: () => void
}): React.JSX.Element {
	const { userKind = USER_GUEST } = use(UserKindContext)
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
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24,
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

	return (
		<View className="flex-1 w-full">
			{isLoading ? (
				<View className="flex-1 justify-center items-center">
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
				<ErrorView
					title={networkError}
					statusServices={ServiceStatus.Thi}
					inModal
				/>
			) : userKind === USER_GUEST ? (
				<ErrorView title={guestError} />
			) : (
				<View className="flex-1 w-full">
					{exams && exams.length > 0 ? (
						<FlashList
							data={exams}
							renderItem={renderExamItem}
							contentContainerClassName="px-page"
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
								<Text className="text-text text-[19px] font-semibold pb-3 pt-2">
									{t('pages.calendar.exams.subtitle')}
								</Text>
							}
							ListFooterComponent={
								<CalendarFooter onLinkPress={handleLinkPress} />
							}
						/>
					) : (
						<ScrollView contentContainerClassName="px-page">
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
							<CalendarFooter onLinkPress={handleLinkPress} />
						</ScrollView>
					)}
				</View>
			)}
		</View>
	)
}
