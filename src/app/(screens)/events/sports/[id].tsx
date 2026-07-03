import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { useQuery } from '@tanstack/react-query'
import {
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
import { useCSSVariable } from 'uniwind'
import type {
	UniversitySportsFieldsFragment,
	WeekdayType
} from '@/__generated__/gql/graphql'
import { EventErrorView } from '@/components/Error/event-error-view'
import FormList from '@/components/Universal/form-list'
import type { LucideIcon } from '@/components/Universal/icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { loadUniversitySportsEvents, QUERY_KEYS } from '@/utils/events-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import { pressLink as pressLinkUtil } from '@/utils/linking'
import { copyToClipboard } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function SportsEventDetail(): React.JSX.Element {
	const textColor = toColor(useCSSVariable('--color-text'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const warningColor = toColor(useCSSVariable('--color-warning'))
	const successColor = toColor(useCSSVariable('--color-success'))
	const { id } = useLocalSearchParams<{ id: string }>()
	const { t, i18n } = useTranslation('common')

	const {
		data: queryData,
		isLoading,
		error
	} = useQuery({
		queryKey: [QUERY_KEYS.UNIVERSITY_SPORTS],
		queryFn: loadUniversitySportsEvents,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	})

	const sportsEvent: UniversitySportsFieldsFragment | null | undefined =
		queryData?.flatMap((group) => group.data).find((event) => event.id === id)

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
	const navigation = useNavigation()
	useFocusEffect(
		useCallback(() => {
			if (sportsEvent == null) {
				return
			}
			navigation.setOptions({
				...getPlatformHeaderButtons({
					onShare: async () => {
						trackEvent('Share', {
							type: 'sportsEvent'
						})
						const message = t('pages.event.shareSports', {
							title: sportsEvent?.title[i18n.language as LanguageKey],
							weekday: t(
								`dates.weekdays.${
									sportsEvent.weekday.toLowerCase() as Lowercase<WeekdayType>
								}`
							),
							time: formatFriendlyTimeRange(
								sportsEvent.startTime,
								sportsEvent.endTime
							),
							link: `https://web.neuland.app/events/sports/${id}`
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
		}, [navigation, sportsEvent, t, i18n.language])
	)

	if (isLoading || !queryData) {
		return (
			<View className="flex-1 justify-center items-center">
				<LoadingIndicator />
			</View>
		)
	}

	if (error || sportsEvent == null) {
		return <EventErrorView eventType="sports" />
	}

	const isDescriptionAvailable =
		!((sportsEvent?.description?.de ?? '') === '') ||
		!((sportsEvent?.description?.en ?? '') === '')
	const isEmailAvailable = !((sportsEvent?.eMail ?? '') === '')
	const isInvitationLinkAvailable = sportsEvent?.invitationLink !== null

	const pressLink = (url: string | null | undefined) => {
		pressLinkUtil(url, `sportsEvent-${id}`)
	}

	const sections: FormListSections[] = [
		{
			header: t('labels.details'),
			items: [
				{
					title: t('pages.event.weekday'),
					value: t(
						`dates.weekdays.${
							sportsEvent.weekday.toLowerCase() as Lowercase<WeekdayType>
						}`
					)
				},
				{
					title: t('pages.event.time'),
					value: formatFriendlyTimeRange(
						sportsEvent.startTime,
						sportsEvent.endTime
					)
				},
				{
					title: t('labels.campus'),
					value: sportsEvent?.campus
				},
				{
					title: t('pages.event.location'),
					value: sportsEvent.location
				}
			]
		},
		...(isDescriptionAvailable
			? [
					{
						header: t('pages.event.description'),
						item:
							sportsEvent?.description?.[i18n.language as LanguageKey] ??
							undefined
					}
				]
			: []),
		{
			header: t('pages.event.contact'),
			items: [
				{
					title: t('pages.event.registration'),
					value: sportsEvent?.requiresRegistration
						? t('pages.event.required')
						: t('pages.event.optional'),
					icon: sportsEvent?.requiresRegistration
						? {
								ios: 'exclamationmark.triangle.fill',
								android: 'warning',
								web: 'TriangleAlert'
							}
						: {
								ios: 'checkmark.seal',
								android: 'new_releases',
								androidVariant: 'outlined',
								web: 'BadgeCheck'
							},
					iconColor:
						(sportsEvent?.requiresRegistration ?? false)
							? warningColor
							: successColor
				},
				...(isEmailAvailable
					? [
							{
								title: t('pages.event.eMail'),
								value: sportsEvent.eMail ?? undefined,
								icon: {
									ios: 'envelope',
									android: 'mail' as MaterialIcon,
									web: 'Mail' as LucideIcon
								},
								onPress: () => {
									void Linking.openURL(`mailto:${sportsEvent.eMail}`)
								},
								textColor: primaryColor
							}
						]
					: []),
				...(isInvitationLinkAvailable
					? [
							{
								title: t('pages.event.invitationLink'),
								value: 'Link',
								icon: {
									ios: 'link',
									android: 'link' as MaterialIcon,
									web: 'Link' as LucideIcon
								},
								onPress: () => {
									pressLink(sportsEvent.invitationLink)
								},
								textColor: primaryColor
							}
						]
					: [])
			]
		}
	]

	const title = sportsEvent?.title[i18n.language as LanguageKey] ?? ''
	return (
		<Animated.ScrollView
			className="px-page"
			contentContainerClassName="gap-3 pb-bottom-safe"
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
									{title}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View className="flex-row items-start pl-1.5 pb-1.5 justify-between">
				<Text
					className="text-text flex-1 text-2xl font-semibold pt-4 text-left"
					allowFontScaling={true}
					minimumFontScale={0.8}
					numberOfLines={2}
				>
					{title}
				</Text>
			</View>
			<View className="self-center pb-3 w-full">
				<FormList sections={sections} sheet />
			</View>
		</Animated.ScrollView>
	)
}
