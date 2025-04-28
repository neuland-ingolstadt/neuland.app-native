import type { CampusLifeEventFieldsFragment } from '@/__generated__/gql/graphql'
import ErrorView from '@/components/Error/ErrorView'
import CLEventRow from '@/components/Rows/EventRow'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { FlashList } from '@shopify/flash-list'
import type { UseQueryResult } from '@tanstack/react-query'
import type React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import LoadingIndicator from '../Universal/LoadingIndicator'

const MemoizedEventRow = memo(CLEventRow)

export default function ClEventsPage({
	clEventsResult
}: {
	clEventsResult: UseQueryResult<CampusLifeEventFieldsFragment[], Error>
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const {
		isRefetchingByUser: isRefetchingByUserClEvents,
		refetchByUser: refetchByUserClEvents
	} = useRefreshByUser(clEventsResult.refetch)

	const renderItem = ({ item }: { item: CampusLifeEventFieldsFragment }) => (
		<View style={styles.rowWrapper}>
			<MemoizedEventRow event={item} />
		</View>
	)

	return (
		<View style={styles.container}>
			{clEventsResult.isLoading ? (
				<LoadingIndicator />
			) : clEventsResult.isError ? (
				<ErrorView
					title={clEventsResult.error?.message ?? t('error.title')}
					onButtonPress={() => {
						void refetchByUserClEvents()
					}}
					inModal
				/>
			) : clEventsResult.isPaused && !clEventsResult.isSuccess ? (
				<ErrorView title={networkError} inModal />
			) : (
				<View style={styles.contentContainer}>
					{clEventsResult.data != null && clEventsResult.data.length > 0 ? (
						<FlashList
							data={clEventsResult.data}
							renderItem={renderItem}
							estimatedItemSize={100}
							contentContainerStyle={styles.flashListContainer}
							showsVerticalScrollIndicator={false}
							scrollEventThrottle={16}
							refreshControl={
								<RefreshControl
									refreshing={isRefetchingByUserClEvents}
									onRefresh={() => {
										void refetchByUserClEvents()
									}}
								/>
							}
						/>
					) : (
						<ErrorView
							title={t('pages.clEvents.events.noEvents.title')}
							message={t('pages.clEvents.events.noEvents.subtitle')}
							icon={{
								ios: 'calendar.badge.clock',
								android: 'calendar_clock',
								web: 'CalendarClock'
							}}
							inModal
							isCritical={false}
						/>
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
	contentContainer: {
		backgroundColor: 'transparent',
		flex: 1,
		width: '100%'
	},
	flashListContainer: {
		paddingHorizontal: theme.margins.page,
		paddingVertical: 4,
		paddingBottom: theme.margins.bottomSafeArea
	},
	rowWrapper: {
		marginBottom: 8
	},
	itemsContainer: {
		alignSelf: 'center',
		justifyContent: 'center',
		paddingBottom: theme.margins.bottomSafeArea,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	}
}))
