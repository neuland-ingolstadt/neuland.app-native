import { FlashList } from '@shopify/flash-list'
import type { UseQueryResult } from '@tanstack/react-query'
import type React from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type { CampusLifeEventFieldsFragment } from '@/__generated__/gql/graphql'
import ErrorView from '@/components/Error/error-view'
import CLEventRow from '@/components/Rows/event-row'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'

import LoadingIndicator from '../Universal/loading-indicator'
import { EmptyEventsAnimation } from './empty-events-animation'

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
				/>
			) : clEventsResult.isPaused && !clEventsResult.isSuccess ? (
				<ErrorView title={networkError} />
			) : (
				<View style={styles.contentContainer}>
					{clEventsResult.data != null && clEventsResult.data.length > 0 ? (
						<FlashList
							data={clEventsResult.data}
							renderItem={renderItem}
							estimatedItemSize={70}
							contentContainerStyle={styles.flashListContainer}
							showsVerticalScrollIndicator={false}
							scrollEventThrottle={16}
							disableAutoLayout
							refreshControl={
								<RefreshControl
									refreshing={isRefetchingByUserClEvents}
									onRefresh={() => {
										void refetchByUserClEvents()
									}}
								/>
							}
							ListHeaderComponent={
								<Text style={styles.sectionHeaderText}>
									{t('pages.clEvents.events.subtitle')}
								</Text>
							}
						/>
					) : (
						<EmptyEventsAnimation
							title={t('pages.clEvents.events.noEvents.title')}
							subtitle={t('pages.clEvents.events.noEvents.subtitle')}
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
		paddingHorizontal: theme.margins.page
	},
	contentContainer: {
		backgroundColor: 'transparent',
		flex: 1,
		width: '100%'
	},
	flashListContainer: {
		paddingBottom: theme.margins.bottomSafeArea
	},
	rowWrapper: {
		marginBottom: 8
	},
	itemsContainer: {
		alignSelf: 'center',
		justifyContent: 'center',
		paddingBottom: theme.margins.bottomSafeArea
	},
	sectionHeaderText: {
		color: theme.colors.text,
		fontSize: 19,
		fontWeight: '600',
		paddingBottom: 8
	}
}))
