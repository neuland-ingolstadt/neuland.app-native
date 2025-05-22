import type { CampusLifeEventFieldsFragment } from '@/__generated__/gql/graphql'
import { EventErrorView } from '@/components/Error/EventErrorView'
import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections, SectionGroup } from '@/types/components'
import {
	formatFriendlyDateTime,
	formatFriendlyDateTimeRange
} from '@/utils/date-utils'
import { QUERY_KEYS, loadCampusLifeEvents } from '@/utils/events-utils'
import { isValidRoom } from '@/utils/timetable-utils'
import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { Stack, useFocusEffect, useNavigation } from 'expo-router'
import { router } from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { Linking } from 'react-native'
import { Share } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
						<Pressable
							key={index}
							onPress={() => {
								void Linking.openURL(part)
							}}
						>
							<Text style={[styles.columnDetails, { color }]}>{part}</Text>
						</Pressable>
					)
				}
				return <Text key={index}>{part}</Text>
			})}
		</Text>
	)
}

export default function ClEventDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { id } = useLocalSearchParams<{ id: string }>()
	const { t, i18n } = useTranslation('common')

	const {
		data: queryData,
		isLoading,
		error
	} = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS],
		queryFn: loadCampusLifeEvents,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	})

	const event = queryData?.find((event) => event.id === id)
	const eventData: CampusLifeEventFieldsFragment | null = event ?? null

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

	const ref = useAnimatedRef<Animated.ScrollView>()
	const scroll = useScrollViewOffset(ref)
	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scroll.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	const isMultiDayEvent =
		eventData?.startDateTime != null &&
		eventData.endDateTime != null &&
		new Date(eventData.startDateTime).toDateString() !==
			new Date(eventData.endDateTime).toDateString()

	const isWebsiteAvailable = eventData?.host.website != null
	const isInstagramAvailable = eventData?.host.instagram != null

	const dateRange = formatFriendlyDateTimeRange(
		eventData?.startDateTime != null ? new Date(eventData.startDateTime) : null,
		eventData?.endDateTime != null ? new Date(eventData.endDateTime) : null
	)
	const navigation = useNavigation()

	useFocusEffect(
		useCallback(() => {
			navigation.setOptions({
				headerRight: () => (
					<ShareHeaderButton
						onPress={async () => {
							trackEvent('Share', {
								type: 'clEvent'
							})
							await Share.share({
								message: t('pages.event.shareMessage', {
									title: eventData?.titles[i18n.language as LanguageKey],
									organizer: eventData?.host.name,
									date: dateRange,
									link: `https://neuland.app/events/cl/${id}`
								})
							})
						}}
					/>
				)
			})
		}, [navigation, t, eventData, id, i18n.language, dateRange])
	)

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
					value: eventData?.host.name
				}
			]
		},
		...(isWebsiteAvailable || isInstagramAvailable
			? [
					{
						header: t('pages.event.links'),
						items: [
							isWebsiteAvailable
								? {
										title: 'Website',
										icon: linkIcon,
										onPress: () => {
											if (eventData?.host.website) {
												void Linking.openURL(eventData.host.website)
											}
										}
									}
								: null,
							isInstagramAvailable
								? {
										title: 'Instagram',
										icon: {
											ios: 'instagram',
											android: 'instagram',
											web: 'Instagram',
											iosFallback: true
										},
										onPress: () => {
											if (eventData?.host.instagram) {
												void Linking.openURL(eventData.host.instagram)
											}
										}
									}
								: null
						].filter((item) => item != null) as SectionGroup[]
					}
				]
			: []),
		...(eventData?.descriptions != null
			? [
					{
						header: t('pages.event.description'),
						item: (
							<LinkText
								text={
									eventData.descriptions[i18n.language as LanguageKey] ?? ''
								}
								color={theme.colors.primary}
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
			ref={ref}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{eventData.titles[i18n.language as LanguageKey] ?? ''}
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
					{eventData.titles[i18n.language as LanguageKey] ?? ''}
				</Text>
			</View>
			<View style={styles.formList}>
				<FormList sections={sections} />
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
		fontSize: 16,
		paddingTop: 2,
		textAlign: 'left'
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
