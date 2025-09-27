import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import {
	router,
	Stack,
	useFocusEffect,
	useLocalSearchParams,
	useNavigation
} from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Share, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { EventErrorView } from '@/components/Error/event-error-view'
import FormList from '@/components/Universal/form-list'
import { linkIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import type { CampusLifeEvent } from '@/types/campus-life'
import type { FormListSections, SectionGroup } from '@/types/components'
import {
	formatFriendlyDateTime,
	formatFriendlyDateTimeRange
} from '@/utils/date-utils'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import { isValidRoom } from '@/utils/timetable-utils'
import { copyToClipboard } from '@/utils/ui-utils'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

const LinkText: React.FC<{ text: string; color: string }> = ({
	text,
	color
}) => {
	const { styles } = useStyles(stylesheet)
	const parts = text.split(URL_REGEX)
	return (
		<Text style={styles.columnDetails}>
			{parts.map((part, index) => {
				if (part.match(URL_REGEX)) {
					return (
						<Text
							key={index}
							onPress={() => {
								void Linking.openURL(part)
							}}
							style={{ color }}
						>
							{part}
						</Text>
					)
				}
				return part
			})}
		</Text>
	)
}

export default function ClEventDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { id } = useLocalSearchParams<{ id: string }>()
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

	const {
		data: queryData = [],
		isLoading,
		error
	} = useQuery<CampusLifeEvent[]>({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS],
		queryFn: () => loadCampusLifeEvents(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	})

	const eventData = queryData.find((item) => item.id === id) ?? null
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

	useFocusEffect(
		useCallback(() => {
			if (eventData) {
				navigation.setOptions({
					...getPlatformHeaderButtons({
						onShare: async () => {
							trackEvent('Share', {
								type: 'clEvent'
							})
							const message = t('pages.event.shareMessage', {
								title: eventTitle,
								organizer: eventData?.host.name,
								date: dateRange,
								link: `https://web.neuland.app/events/cl/${id}`
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
		}, [navigation, t, eventData, id, i18n.language, dateRange, eventTitle])
	)

	if (isLoading || !queryData) {
		return (
			<View style={styles.loadingContainer}>
				<LoadingIndicator />
			</View>
		)
	}

	if (error || !eventData) {
		return <EventErrorView eventType="clEvents" />
	}

	const isMultiDayEvent =
		eventData?.startDateTime != null &&
		eventData.endDateTime != null &&
		new Date(eventData.startDateTime).toDateString() !==
			new Date(eventData.endDateTime).toDateString()

	const isWebsiteAvailable = Boolean(eventData?.host.website)
	const isInstagramAvailable = Boolean(eventData?.host.instagram)
	const isEventUrlAvailable = Boolean(eventData?.eventUrl)
	const descriptionText = getLocalizedValue(eventData?.descriptions)

	const linkItems: SectionGroup[] = []
	const eventUrl = eventData?.eventUrl ?? null
	const organizerWebsite = eventData?.host.website ?? null
	const organizerInstagram = eventData?.host.instagram ?? null

	if (isEventUrlAvailable && eventUrl != null) {
		linkItems.push({
			title: t('pages.event.eventLink'),
			icon: linkIcon,
			onPress: () => {
				void Linking.openURL(eventUrl)
			}
		})
	}

	if (isWebsiteAvailable && organizerWebsite != null) {
		linkItems.push({
			title: t('pages.event.organizerDetails.website'),
			icon: linkIcon,
			onPress: () => {
				void Linking.openURL(organizerWebsite)
			}
		})
	}

	if (isInstagramAvailable && organizerInstagram != null) {
		linkItems.push({
			title: t('pages.event.organizerDetails.instagram'),
			icon: {
				ios: 'instagram',
				android: 'instagram',
				web: 'Instagram',
				iosFallback: true
			},
			onPress: () => {
				void Linking.openURL(organizerInstagram)
			}
		})
	}

	const sections: FormListSections[] = [
		{
			header: t('pages.event.details'),
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
					value: eventData?.host.name,
					onPress: () => {
						if (eventData?.host?.id != null) {
							console.log('eventData.host.id', eventData.host.id)
							router.dismissTo({
								pathname: '/events/organizer/[id]',
								params: { id: eventData.host.id.toString() }
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
							<LinkText text={descriptionText} color={theme.colors.primary} />
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
		textAlign: 'left'
	},
	columnDetails: {
		color: theme.colors.text,
		fontSize: 16.5,
		paddingTop: 2,
		textAlign: 'left'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
