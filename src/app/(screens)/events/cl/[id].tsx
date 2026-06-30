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
import { createStyleSheet, useStyles } from 'react-native-unistyles'
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

export default function ClEventDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
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
			<View style={styles.loadingContainer}>
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
			<View style={styles.loadingContainer}>
				<LoadingIndicator />
			</View>
		)
	}

	if (isThiDepartmentOrganizerKind(organizerKind)) {
		if (thiFlagPending) {
			return (
				<View style={styles.loadingContainer}>
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
											textColor: theme.colors.primary
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
					textColor: theme.colors.primary,
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
								linkColor={theme.colors.primary}
								textStyle={styles.columnDetails}
								containerStyle={styles.linkTextContainer}
								toggleStyle={styles.showMoreButton}
							/>
						)
					}
				]
			: [])
	]

	return (
		<Animated.ScrollView
			style={styles.page}
			contentContainerStyle={styles.container}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{eventTitle}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{eventTitle}
				</Text>
			</View>
			<View style={styles.formList}>
				<FormList sections={sections} sheet />
			</View>
		</Animated.ScrollView>
	)
}

const isIoS26 =
	Platform.OS === 'ios' && Number.parseInt(Platform.Version, 10) >= 26
const stylesheet = createStyleSheet((theme) => ({
	container: {
		gap: 12,
		paddingBottom: theme.margins.modalBottomMargin
	},
	formList: {
		alignSelf: 'center',
		width: '100%',
		paddingBottom: 100
	},
	linkTextContainer: {
		gap: 8
	},
	headerTitle: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	page: {
		paddingHorizontal: theme.margins.page
	},
	titleContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	titleText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 24,
		fontWeight: '600',
		paddingTop: 16,
		marginLeft: isIoS26 ? 6 : 0,
		textAlign: 'left'
	},
	columnDetails: {
		color: theme.colors.text,
		fontSize: 16.5,
		paddingTop: 2,
		textAlign: 'left'
	},
	showMoreButton: {
		color: theme.colors.primary,
		fontSize: 14,
		fontWeight: '600'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
