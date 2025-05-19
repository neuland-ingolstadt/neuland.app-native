import type { WeekdayType } from '@/__generated__/gql/graphql'
import FormList from '@/components/Universal/FormList'
import type { LucideIcon } from '@/components/Universal/Icon'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import useCLParamsStore from '@/hooks/useCLParamsStore'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import {
	Stack,
	useFocusEffect,
	useNavigation,
	useLocalSearchParams
} from 'expo-router'
import type React from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Share, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function SportsEventDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const { id } = useLocalSearchParams<{ id: string }>()
	const sportsEvent = useCLParamsStore((state) => state.selectedSportsEvent)
	const { t, i18n } = useTranslation('common')

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
	const navigation = useNavigation()
	useFocusEffect(
		useCallback(() => {
			if (sportsEvent == null) {
				return
			}
			navigation.setOptions({
				headerRight: () => (
					<ShareHeaderButton
						onPress={async () => {
							trackEvent('Share', {
								type: 'sportsEvent'
							})
							await Share.share({
								message: t('pages.event.shareSports', {
									title: sportsEvent?.title[i18n.language as LanguageKey],
									weekday: t(
										`dates.weekdays.${
											sportsEvent.weekday.toLowerCase() as Lowercase<WeekdayType>
										}`
									),
									time: formatFriendlyTimeRange(
										sportsEvent.startTime,
										sportsEvent.endTime
									)
								})
							})
						}}
					/>
				)
			})
		}, [])
	)

	if (sportsEvent == null) {
		return <></>
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

	const title = sportsEvent?.title[i18n.language as LanguageKey] ?? ''
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
									{title}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					allowFontScaling={true}
					minimumFontScale={0.8}
					numberOfLines={2}
				>
					{title}
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
		paddingBottom: theme.margins.bottomSafeArea
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
	})
}))
