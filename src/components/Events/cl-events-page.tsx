import { FlashList } from '@shopify/flash-list'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type React from 'react'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import CLEventRow from '@/components/Rows/event-row'
import { useRefreshByUser } from '@/hooks'
import type { CampusLifeEvent, CampusLifeOrganizer } from '@/types/campus-life'
import { networkError } from '@/utils/api-utils'
import { loadCampusLifeOrganizers, QUERY_KEYS } from '@/utils/events-utils'

import LoadingIndicator from '../Universal/loading-indicator'
import { EmptyEventsAnimation } from './empty-events-animation'

const MemoizedEventRow = memo(CLEventRow)

export default function ClEventsPage({
	clEventsResult
}: {
	clEventsResult: UseQueryResult<CampusLifeEvent[], Error>
}): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const organizersQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_ORGANIZERS],
		queryFn: loadCampusLifeOrganizers,
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60 * 24
	})

	const featuredOrganizers = useMemo<CampusLifeOrganizer[]>(() => {
		if (organizersQuery.data == null) {
			return []
		}
		return organizersQuery.data.slice(0, 8)
	}, [organizersQuery.data])

	const remainingOrganizersCount = useMemo(() => {
		if (organizersQuery.data == null) {
			return 0
		}
		return Math.max(0, organizersQuery.data.length - 8)
	}, [organizersQuery.data])

	const {
		isRefetchingByUser: isRefetchingByUserClEvents,
		refetchByUser: refetchByUserClEvents
	} = useRefreshByUser(clEventsResult.refetch)

	const renderItem = ({ item }: { item: CampusLifeEvent }) => (
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
								<View style={styles.listHeaderContainer}>
									{organizersQuery.isLoading ? (
										<View style={styles.clubsLoadingContainer}>
											<LoadingIndicator />
										</View>
									) : featuredOrganizers.length > 0 ? (
										<View style={styles.clubsContainer}>
											<View style={styles.clubsHeaderRow}>
												<Text style={styles.clubsTitle}>
													{t('pages.clEvents.clubs.title')}
												</Text>
												<Pressable
													onPress={() => {
														router.push('/cl-clubs')
													}}
												>
													<Text style={styles.viewAllText}>
														{t('pages.clEvents.clubs.viewAll')}
													</Text>
												</Pressable>
											</View>
											<ScrollView
												horizontal
												showsHorizontalScrollIndicator={false}
												contentContainerStyle={styles.clubsScrollContent}
											>
												{featuredOrganizers.map((organizer) => (
													<Pressable
														key={organizer.id}
														style={({ pressed }) => [
															styles.clubChip,
															{ opacity: pressed ? 0.85 : 1 }
														]}
														onPress={() => {
															router.push({
																pathname: '/events/club/[id]',
																params: { id: organizer.id.toString() }
															})
														}}
													>
														<Text style={styles.clubChipText}>
															{organizer.name}
														</Text>
													</Pressable>
												))}
												{remainingOrganizersCount > 0 && (
													<Pressable
														style={({ pressed }) => [
															styles.clubChip,
															styles.addClubChip,
															{ opacity: pressed ? 0.85 : 1 }
														]}
														onPress={() => {
															router.push('/cl-clubs')
														}}
													>
														<Text style={styles.addClubChipText}>
															+{remainingOrganizersCount}{' '}
															{t('pages.clEvents.clubs.clubs')}
														</Text>
													</Pressable>
												)}
											</ScrollView>
										</View>
									) : null}
									<Text style={styles.sectionHeaderText}>
										{t('pages.clEvents.events.subtitle')}
									</Text>
								</View>
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
	listHeaderContainer: {
		gap: 12,
		marginBottom: 12,
		marginHorizontal: -theme.margins.page,
		paddingHorizontal: theme.margins.page
	},
	clubsLoadingContainer: {
		alignItems: 'flex-start'
	},
	clubsContainer: {
		gap: 12
	},
	clubsHeaderRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	clubsTitle: {
		color: theme.colors.text,
		fontSize: 18,
		fontWeight: '600'
	},
	viewAllText: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: '600'
	},
	clubsScrollContent: {
		paddingRight: theme.margins.page,
		paddingVertical: 2
	},
	clubChip: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: 999,
		borderWidth: StyleSheet.hairlineWidth,
		marginRight: 8,
		paddingHorizontal: 16,
		paddingVertical: 10
	},
	lastClubChip: {
		marginRight: 0
	},
	clubChipText: {
		color: theme.colors.text,
		fontSize: 14,
		fontWeight: '600'
	},
	addClubChip: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary,
		marginRight: 0
	},
	addClubChipText: {
		color: theme.colors.background,
		fontSize: 14,
		fontWeight: '600'
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
