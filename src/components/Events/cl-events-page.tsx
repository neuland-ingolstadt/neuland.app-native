import { type UseQueryResult, useQuery } from '@tanstack/react-query'
import { selectionAsync } from 'expo-haptics'
import { type Href, router } from 'expo-router'
import type React from 'react'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	LayoutAnimation,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	UIManager,
	View
} from 'react-native'
import ErrorView from '@/components/Error/error-view'
import CLEventRow from '@/components/Rows/event-row'
import { FlashList } from '@/components/Universal/styled'
import { useRefreshByUser } from '@/hooks'
import {
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	type CampusLifeEvent,
	type CampusLifeOrganizer,
	type CampusLifePublicOrganizerKind
} from '@/types/campus-life'
import { networkError } from '@/utils/api-utils'
import {
	campusLifeOrganiserParams,
	isThiDepartmentOrganizerKind
} from '@/utils/campus-life-utils'
import { loadCampusLifeOrganizers, QUERY_KEYS } from '@/utils/events-utils'
import { hairlineBorder } from '@/utils/uniwind-utils'

import LoadingIndicator from '../Universal/loading-indicator'
import { EmptyEventsAnimation } from './empty-events-animation'

const MemoizedEventRow = memo(CLEventRow)

const clubOrderLayoutAnimation = {
	duration: 250,
	update: {
		type: LayoutAnimation.Types.easeInEaseOut
	}
} as const

const shouldAnimateClubOrder = (
	currentId: number | null,
	nextId: number | null,
	organizers: CampusLifeOrganizer[]
): boolean => {
	if (currentId === nextId) {
		return false
	}
	if (currentId != null) {
		return true
	}
	if (nextId == null) {
		return false
	}
	return organizers.findIndex((organizer) => organizer.id === nextId) > 0
}

interface ClEventsPageProps {
	clEventsResult: UseQueryResult<CampusLifeEvent[], Error>
	organizerKind?: CampusLifePublicOrganizerKind
	clubsListRoute?: Href
}

export default function ClEventsPage({
	clEventsResult,
	organizerKind = CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	clubsListRoute
}: ClEventsPageProps): React.JSX.Element {
	const { t } = useTranslation('common')
	const isThiDepartment = isThiDepartmentOrganizerKind(organizerKind)
	const i18nPage = isThiDepartment ? 'thiEvents' : 'clEvents'
	const organizersSection = isThiDepartment ? 'departments' : 'clubs'
	const [selectedOrganizerId, setSelectedOrganizerId] = useState<number | null>(
		null
	)
	const didLongPressRef = useRef(false)
	const clubsScrollRef = useRef<ScrollView>(null)
	const skipClubScrollRef = useRef(true)
	const selectedOrganizerIdRef = useRef(selectedOrganizerId)
	selectedOrganizerIdRef.current = selectedOrganizerId

	const organizersQuery = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_ORGANIZERS, organizerKind],
		queryFn: () => loadCampusLifeOrganizers(organizerKind),
		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60 * 24
	})

	const baseFeaturedOrganizers = useMemo<CampusLifeOrganizer[]>(() => {
		if (organizersQuery.data == null) {
			return []
		}
		return organizersQuery.data.slice(0, 8)
	}, [organizersQuery.data])

	const featuredOrganizers = useMemo<CampusLifeOrganizer[]>(() => {
		if (selectedOrganizerId == null) {
			return baseFeaturedOrganizers
		}
		const selectedIndex = baseFeaturedOrganizers.findIndex(
			(organizer) => organizer.id === selectedOrganizerId
		)
		if (selectedIndex <= 0) {
			return baseFeaturedOrganizers
		}
		const reordered = [...baseFeaturedOrganizers]
		const [selected] = reordered.splice(selectedIndex, 1)
		reordered.unshift(selected)
		return reordered
	}, [baseFeaturedOrganizers, selectedOrganizerId])

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

	useEffect(() => {
		if (Platform.OS !== 'android') {
			return
		}
		UIManager.setLayoutAnimationEnabledExperimental?.(true)
	}, [])

	const onFilterPress = (organizerId: number | null): void => {
		const current = selectedOrganizerIdRef.current
		const nextId = organizerId === current ? null : organizerId
		if (nextId === current) {
			return
		}
		if (shouldAnimateClubOrder(current, nextId, baseFeaturedOrganizers)) {
			LayoutAnimation.configureNext(clubOrderLayoutAnimation)
		}
		selectedOrganizerIdRef.current = nextId
		setSelectedOrganizerId(nextId)
		if (Platform.OS === 'ios') {
			void selectionAsync()
		}
	}

	useEffect(() => {
		if (skipClubScrollRef.current) {
			skipClubScrollRef.current = false
			return
		}
		clubsScrollRef.current?.scrollTo({ x: 0, animated: true })
	}, [selectedOrganizerId])

	const renderItem = ({ item }: { item: CampusLifeEvent }) => (
		<View className="mb-2">
			<MemoizedEventRow event={item} organizerKind={organizerKind} />
		</View>
	)

	return (
		<View className="flex-1 px-page">
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
				<View className="bg-transparent flex-1 w-full">
					{clEventsResult.data != null ? (
						<FlashList
							data={filteredEvents}
							renderItem={renderItem}
							keyExtractor={(item) => item.id}
							estimatedItemSize={70}
							contentContainerClassName="pb-bottom-safe"
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
								<View className="gap-6 mb-2 -mx-page px-page">
									{organizersQuery.isLoading ? (
										<View className="items-start">
											<LoadingIndicator />
										</View>
									) : featuredOrganizers.length > 0 ? (
										<View className="gap-3">
											<View className="flex-row items-center justify-between">
												<Text className="text-text text-lg font-semibold">
													{t(
														`pages.${i18nPage}.${organizersSection}.title` as 'pages.clEvents.clubs.title'
													)}
												</Text>
												{clubsListRoute != null && (
													<Pressable
														onPress={() => {
															router.push(clubsListRoute)
														}}
													>
														<Text className="text-primary text-sm font-semibold">
															{t(
																`pages.${i18nPage}.${organizersSection}.viewAll` as 'pages.clEvents.clubs.viewAll'
															)}
														</Text>
													</Pressable>
												)}
											</View>
											<ScrollView
												ref={clubsScrollRef}
												horizontal
												showsHorizontalScrollIndicator={false}
												contentContainerClassName="pr-page py-0.5 items-center"
											>
												<Pressable
													className={`bg-card border-border rounded-infinite px-4 py-2.5 mr-2 ${
														selectedOrganizerId == null
															? 'bg-primary border-primary'
															: ''
													}`}
													style={hairlineBorder}
													onPress={() => {
														onFilterPress(null)
													}}
												>
													<Text
														className={`text-sm font-semibold ${
															selectedOrganizerId == null
																? 'text-background'
																: 'text-text'
														}`}
													>
														{t(
															`pages.${i18nPage}.${organizersSection}.filterAll` as 'pages.clEvents.clubs.filterAll'
														)}
													</Text>
												</Pressable>
												{featuredOrganizers.map((organizer) => (
													<Pressable
														key={organizer.id}
														className={`bg-card border-border rounded-infinite px-4 py-2.5 mr-2 ${
															selectedOrganizerId === organizer.id
																? 'bg-primary border-primary'
																: ''
														}`}
														style={hairlineBorder}
														onPressIn={() => {
															didLongPressRef.current = false
														}}
														onLongPress={() => {
															didLongPressRef.current = true
															router.push({
																pathname: '/events/organiser/[id]',
																params: campusLifeOrganiserParams(
																	organizer.id,
																	organizerKind
																)
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
															className={`text-sm font-semibold ${
																selectedOrganizerId === organizer.id
																	? 'text-background'
																	: 'text-text'
															}`}
														>
															{organizer.name}
														</Text>
													</Pressable>
												))}
												{clubsListRoute != null &&
													remainingOrganizersCount > 0 && (
														<Pressable
															className="bg-primary border-primary rounded-infinite px-4 py-2.5"
															style={hairlineBorder}
															onPress={() => {
																router.push(clubsListRoute)
															}}
														>
															<Text className="text-background text-sm font-semibold">
																+{remainingOrganizersCount}{' '}
																{t(
																	`pages.${i18nPage}.${organizersSection}.${organizersSection}` as 'pages.clEvents.clubs.clubs'
																)}
															</Text>
														</Pressable>
													)}
											</ScrollView>
										</View>
									) : null}
									<Text className="text-text text-[19px] font-semibold pb-2">
										{selectedOrganizerName ??
											t(
												`pages.${i18nPage}.events.subtitle` as 'pages.clEvents.events.subtitle'
											)}
									</Text>
								</View>
							}
							ListEmptyComponent={
								<EmptyEventsAnimation
									title={t(
										`pages.${i18nPage}.events.noEvents.title` as 'pages.clEvents.events.noEvents.title'
									)}
									subtitle={
										selectedOrganizerName == null
											? t(
													`pages.${i18nPage}.events.noEvents.subtitle` as 'pages.clEvents.events.noEvents.subtitle'
												)
											: isThiDepartment
												? t(
														'pages.thiEvents.events.noEvents.filteredSubtitle',
														{
															organizerName: selectedOrganizerName
														}
													)
												: t('pages.clEvents.events.noEvents.filteredSubtitle', {
														clubName: selectedOrganizerName
													})
									}
								/>
							}
						/>
					) : (
						<EmptyEventsAnimation
							title={t(
								`pages.${i18nPage}.events.noEvents.title` as 'pages.clEvents.events.noEvents.title'
							)}
							subtitle={t(
								`pages.${i18nPage}.events.noEvents.subtitle` as 'pages.clEvents.events.noEvents.subtitle'
							)}
						/>
					)}
				</View>
			)}
		</View>
	)
}
