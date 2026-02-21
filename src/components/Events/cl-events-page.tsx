import { FlashList } from '@shopify/flash-list'
import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { selectionAsync } from 'expo-haptics'
import { router } from 'expo-router'
import type React from 'react'
import { memo, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Platform,
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
	const [selectedOrganizerId, setSelectedOrganizerId] = useState<number | null>(
		null
	)
	const didLongPressRef = useRef(false)

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

	const filteredEvents = useMemo(() => {
		const events = clEventsResult.data ?? []
		if (selectedOrganizerId == null) {
			return events
		}
		return events.filter((event) => event.host.id === selectedOrganizerId)
	}, [clEventsResult.data, selectedOrganizerId])

	const selectedOrganizerName = useMemo(() => {
		if (selectedOrganizerId == null || organizersQuery.data == null) {
			return null
		}
		return (
			organizersQuery.data.find(
				(organizer) => organizer.id === selectedOrganizerId
			)?.name ?? null
		)
	}, [organizersQuery.data, selectedOrganizerId])

	const {
		isRefetchingByUser: isRefetchingByUserClEvents,
		refetchByUser: refetchByUserClEvents
	} = useRefreshByUser(clEventsResult.refetch)

	const onFilterPress = (organizerId: number | null): void => {
		setSelectedOrganizerId((current) => {
			if (organizerId === current) {
				return null
			}
			return organizerId
		})
		if (Platform.OS === 'ios') {
			void selectionAsync()
		}
	}

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
					{clEventsResult.data != null ? (
						<FlashList
							data={filteredEvents}
							renderItem={renderItem}
							keyExtractor={(item) => item.id}
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
												<Pressable
													style={({ pressed }) => [
														styles.clubChip,
														styles.allClubsChip,
														selectedOrganizerId == null &&
															styles.selectedClubFilterChip,
														{ opacity: pressed ? 0.85 : 1 }
													]}
													onPress={() => {
														onFilterPress(null)
													}}
												>
													<Text
														style={[
															styles.clubChipText,
															selectedOrganizerId == null &&
																styles.selectedClubChipText
														]}
													>
														{t('pages.clEvents.clubs.viewAll')}
													</Text>
												</Pressable>
												{featuredOrganizers.map((organizer) => (
													<Pressable
														key={organizer.id}
														style={({ pressed }) => [
															styles.clubChip,
															styles.organizerChip,
															selectedOrganizerId === organizer.id &&
																styles.selectedClubFilterChip,
															{ opacity: pressed ? 0.85 : 1 }
														]}
														onPressIn={() => {
															didLongPressRef.current = false
														}}
														onLongPress={() => {
															didLongPressRef.current = true
															router.push({
																pathname: '/events/club/[id]',
																params: { id: organizer.id.toString() }
															})
														}}
														delayLongPress={250}
														onPress={() => {
															if (didLongPressRef.current) {
																didLongPressRef.current = false
																return
															}
															onFilterPress(organizer.id)
														}}
													>
														<Text
															style={[
																styles.clubChipText,
																selectedOrganizerId === organizer.id &&
																	styles.selectedClubChipText
															]}
														>
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
										{selectedOrganizerName ??
											t('pages.clEvents.events.subtitle')}
									</Text>
								</View>
							}
							ListEmptyComponent={
								<EmptyEventsAnimation
									title={t('pages.clEvents.events.noEvents.title')}
									subtitle={
										selectedOrganizerName == null
											? t('pages.clEvents.events.noEvents.subtitle')
											: t('pages.clEvents.events.noEvents.filteredSubtitle', {
													clubName: selectedOrganizerName
												})
									}
								/>
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
		gap: 24,
		marginBottom: 8,
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
		paddingVertical: 2,
		alignItems: 'center'
	},
	clubChip: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: 999,
		borderWidth: StyleSheet.hairlineWidth,
		paddingHorizontal: 16,
		paddingVertical: 10
	},
	allClubsChip: {
		marginRight: 8
	},
	organizerChip: {
		marginRight: 8
	},
	selectedClubFilterChip: {
		backgroundColor: theme.colors.primary,
		borderColor: theme.colors.primary
	},
	clubChipText: {
		color: theme.colors.text,
		fontSize: 14,
		fontWeight: '600'
	},
	selectedClubChipText: {
		color: theme.colors.background
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
