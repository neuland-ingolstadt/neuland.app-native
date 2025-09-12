import { trackEvent } from '@aptabase/react-native'
import { useQuery } from '@tanstack/react-query'
import {
	useFocusEffect,
	useLocalSearchParams,
	useNavigation
} from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Share, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import type {
	UniversitySportsFieldsFragment,
	WeekdayType
} from '@/__generated__/gql/graphql'
import { EventErrorView } from '@/components/Error/event-error-view'
import FormList from '@/components/Universal/form-list'
import type { LucideIcon } from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { ShareHeaderButton } from '@/components/Universal/share-header-button'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { loadUniversitySportsEvents, QUERY_KEYS } from '@/utils/events-utils'
import { copyToClipboard } from '@/utils/ui-utils'

export default function SportsEventDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
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

	const navigation = useNavigation()
	useFocusEffect(
		useCallback(() => {
			if (sportsEvent == null) {
				return
			}
			navigation.setOptions({
				title: sportsEvent?.title[i18n.language as LanguageKey] ?? '',
				headerLeft: () => (
					<ShareHeaderButton
						onPress={async () => {
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
						}}
					/>
				)
			})
		}, [navigation, sportsEvent, t, i18n.language])
	)

	if (isLoading || !queryData) {
		return (
			<View style={styles.loadingContainer}>
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

	const sections: FormListSections[] = [
		{
			header: 'Details',
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
					title: 'Campus',
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
					iconColor: styles.warning(sportsEvent?.requiresRegistration ?? false)
						.color
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
								textColor: theme.colors.primary
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
									void Linking.openURL(sportsEvent.invitationLink ?? '')
								},
								textColor: theme.colors.primary
							}
						]
					: [])
			]
		}
	]

	return (
		<Animated.ScrollView
			style={styles.page}
			contentContainerStyle={styles.container}
		>
			<View style={styles.formList}>
				<FormList sections={sections} />
			</View>
		</Animated.ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		gap: 12,
		paddingBottom: theme.margins.bottomSafeArea,
		paddingTop: 140
	},
	formList: {
		alignSelf: 'center',
		paddingBottom: 12,
		width: '100%'
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
	warning: (active: boolean) => ({
		color: active ? theme.colors.warning : theme.colors.success
	}),
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
