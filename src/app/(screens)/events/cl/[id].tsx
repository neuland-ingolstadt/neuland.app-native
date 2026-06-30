import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import {
	Redirect,
	router,
	Stack,
	useFocusEffect,
	useLocalSearchParams,
	useNavigation
} from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Share, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { useCSSVariable, useResolveClassNames } from 'uniwind'
import { EventErrorView } from '@/components/Error/event-error-view'
import FormList from '@/components/Universal/form-list'
import { linkIcon } from '@/components/Universal/icon'
import LinkText from '@/components/Universal/link-text'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useFeatureFlagEnabled } from '@/hooks'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import type { CampusLifeOrganizer } from '@/types/campus-life'
import type { FormListSections, SectionGroup } from '@/types/components'
import {
	campusLifeEventListScreen,
	campusLifeEventWebShareUrl,
	campusLifeOrganiserParams,
	isThiDepartmentOrganizerKind,
	resolveEventOrganizerKind
} from '@/utils/campus-life-utils'
import {
	formatFriendlyDateTime,
	formatFriendlyDateTimeRange
} from '@/utils/date-utils'
import {
	loadCampusLifeEvent,
	loadCampusLifeOrganizer,
	QUERY_KEYS
} from '@/utils/events-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import { pressLink as pressLinkUtil } from '@/utils/linking'
import { isValidRoom } from '@/utils/timetable-utils'
import { copyToClipboard } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function ClEventDetail(): React.JSX.Element {
	const textColor = toColor(useCSSVariable('--color-text'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const columnDetailsStyle = useResolveClassNames(
		'text-text text-[16.5px] pt-0.5 text-left'
	)
	const showMoreButtonStyle = useResolveClassNames(
		'text-primary text-sm font-semibold'
	)
	const { id, org: orgParam } = useLocalSearchParams<{
		id: string
		org?: string | string[]
	}>()
	const { enabled: thiEventsVisible, isPending: thiFlagPending } =
		useFeatureFlagEnabled(FeatureFlagKeys.thiEventsVisible)
	const { t, i18n } = useTranslation('common')
	const getLocalizedValue = useCallback(
		(values?: { de?: string | null; en?: string | null } | null) => {
			if (values == null) {
				return ''
			}
			const locale: 'de' | 'en' = i18n.language.startsWith('de') ? 'de' : 'en'
			return values[locale] ?? values.en ?? values.de ?? ''
		},
		[i18n.language]
	)

	const eventId = Number(id)
	const isIdValid = !Number.isNaN(eventId) && Number.isInteger(eventId)

	const {
		data: eventData = null,
		isLoading,
		error
	} = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS, 'event', eventId],
		queryFn: () => loadCampusLifeEvent(eventId),
		enabled: isIdValid,
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 24
	})

	const organizerId = eventData?.host.id
	const organizerQuery = useQuery<CampusLifeOrganizer>({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_ORGANIZER, organizerId],
		queryFn: () => loadCampusLifeOrganizer(organizerId as number),
		enabled: organizerId != null,
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24
	})
	const organizerDetails = organizerQuery.data ?? null
	const organizerName = organizerDetails?.name ?? eventData?.host.name ?? ''
	const navigation = useNavigation()

	const scrollOffset = useSharedValue(0)
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (scrollOffset && typeof scrollOffset.value !== 'undefined') {
				scrollOffset.value = event.contentOffset.y
			}
		}
	})

	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	const dateRange = formatFriendlyDateTimeRange(
		eventData?.startDateTime != null ? new Date(eventData.startDateTime) : null,
		eventData?.endDateTime != null ? new Date(eventData.endDateTime) : null
	)
	const eventTitle = getLocalizedValue(eventData?.titles ?? null)
	const organizerKind = resolveEventOrganizerKind(
		eventData,
		orgParam,
		organizerDetails
	)

	useFocusEffect(
		useCallback(() => {
			if (eventData) {
				navigation.setOptions({
					...getPlatformHeaderButtons({
						onShare: async () => {
							trackEvent('Share', {
								type: 'clEvent',
								org: organizerKind
							})
							const message = t('pages.event.shareMessage', {
								title: eventTitle,
								organizer: organizerName,
								date: dateRange,
								link: campusLifeEventWebShareUrl(id, organizerKind)
							})
							if (Platform.OS === 'web') {
								await copyToClipboard(message)
								return
							}

							await Share.share({
								message
							})
						}
					})
				})
			}
		}, [
			navigation,
			t,
			eventData,
			id,
			i18n.language,
			dateRange,
			eventTitle,
			organizerName,
			organizerKind
		])
	)

	if (!isIdValid || error || (!isLoading && !eventData)) {
		return (
			<EventErrorView
				eventType={campusLifeEventListScreen(
					resolveEventOrganizerKind(eventData, orgParam)
				)}
			/>
		)
	}

	if (isLoading || !eventData) {
		return (
			<View className="flex-1 justify-center items-center">
				<LoadingIndicator />
			</View>
		)
	}

	if (
		eventData.organizerKind == null &&
		organizerId != null &&
		organizerQuery.isLoading
	) {
		return (
			<View className="flex-1 justify-center items-center">
				<LoadingIndicator />
			</View>
		)
	}

	if (isThiDepartmentOrganizerKind(organizerKind)) {
		if (thiFlagPending) {
			return (
				<View className="flex-1 justify-center items-center">
					<LoadingIndicator />
				</View>
			)
		}

		if (!thiEventsVisible) {
			return <Redirect href="/(tabs)" />
		}
	}

	const pressLink = (url: string | null | undefined) => {
		pressLinkUtil(url, `clEvent-${id}`)
	}

	const isMultiDayEvent =
		eventData?.startDateTime != null &&
		eventData.endDateTime != null &&
		new Date(eventData.startDateTime).toDateString() !==
			new Date(eventData.endDateTime).toDateString()

	const isEventUrlAvailable = Boolean(eventData?.eventUrl)
	const descriptionText = getLocalizedValue(eventData?.descriptions)

	const linkItems: SectionGroup[] = []
	const eventUrl = eventData?.eventUrl ?? null

	if (isEventUrlAvailable && eventUrl != null) {
		linkItems.push({
			title: t('pages.event.eventLink'),
			icon: linkIcon,
			onPress: () => {
				pressLink(eventUrl)
			}
		})
	}

	const sections: FormListSections[] = [
		{
			header: t('pages.event.details'),
			footer: t('pages.event.organizerDetails.tapHint'),
			items: [
				...(!isMultiDayEvent
					? [
							{
								title: t('pages.event.date'),
								value: dateRange
							}
						]
					: [
							...(eventData.startDateTime != null
								? [
										{
											title: t('pages.event.begin'),
											value:
												formatFriendlyDateTime(
													new Date(eventData.startDateTime)
												) ?? undefined
										}
									]
								: []),
							...(eventData.endDateTime != null
								? [
										{
											title: t('pages.event.end'),
											value:
												formatFriendlyDateTime(
													new Date(eventData.endDateTime)
												) ?? undefined
										}
									]
								: [])
						]),
				...(eventData?.location != null && eventData.location !== ''
					? [
							Object.assign(
								{
									title: t('pages.event.location'),
									value: eventData?.location
								},
								isValidRoom(eventData.location)
									? {
											onPress: () => {
												router.dismissTo({
													pathname: '/map',
													params: {
														room: eventData?.location
													}
												})
											},
											textColor: primaryColor
										}
									: {}
							)
						]
					: []),
				{
					title: t('pages.event.organizer'),
					value: organizerName,
					onPress: () => {
						if (eventData?.host?.id != null) {
							router.dismissTo({
								pathname: '/events/organiser/[id]',
								params: campusLifeOrganiserParams(
									eventData.host.id,
									organizerKind
								)
							})
						}
					},
					textColor: primaryColor,
					disabled: eventData?.host?.id == null
				}
			]
		},
		...(linkItems.length > 0
			? [
					{
						header: t('pages.event.links'),
						items: linkItems
					}
				]
			: []),
		...(descriptionText.trim() !== ''
			? [
					{
						header: t('pages.event.description'),
						item: (
							<LinkText
								text={descriptionText}
								linkColor={String(primaryColor)}
								textStyle={columnDetailsStyle}
								containerStyle={{ gap: 8 }}
								toggleStyle={showMoreButtonStyle}
							/>
						)
					}
				]
			: [])
	]

	return (
		<Animated.ScrollView
			className="px-page"
			contentContainerClassName="gap-3 pb-modal-bottom"
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View
							className="overflow-hidden"
							style={{
								marginBottom: Platform.OS === 'ios' ? -10 : 0,
								paddingRight: Platform.OS === 'ios' ? 0 : 50
							}}
						>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={String(textColor)}>
									{eventTitle}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View className="flex-row items-start justify-between">
				<Text
					className="text-text flex-1 text-2xl font-semibold pt-4 text-left"
					style={{
						marginLeft:
							Platform.OS === 'ios' &&
							Number.parseInt(Platform.Version, 10) >= 26
								? 6
								: 0
					}}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{eventTitle}
				</Text>
			</View>
			<View className="self-center w-full pb-[100px]">
				<FormList sections={sections} sheet />
			</View>
		</Animated.ScrollView>
	)
}
