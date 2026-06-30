import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { use, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	AppState,
	type AppStateStatus,
	Linking,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	Text,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import { NoSessionError } from '@/api/thi-session-handler'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import ErrorView from '@/components/Error/error-view'
import { queryClient } from '@/components/provider'
import FormList from '@/components/Universal/form-list'
import PlatformIcon from '@/components/Universal/icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { printLink, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { FormListSections } from '@/types/components'
import { getPersonalData, networkError, performLogout } from '@/utils/api-utils'
import { copyToClipboard } from '@/utils/ui-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

export default function Profile(): React.JSX.Element {
	const router = useRouter()
	const notificationColor = toColor(useCSSVariable('--color-notification'))
	const { toggleUserKind, userKind } = use(UserKindContext)
	const { resetOrder } = use(DashboardContext)
	const { t } = useTranslation(['settings', 'common'])
	const [isLoggingOut, setIsLoggingOut] = React.useState(false)
	const resetPreferences = usePreferencesStore((state) => state.reset)
	const resetFood = useFoodFilterStore((state) => state.reset)
	const { data, error, isLoading, isPaused, isSuccess, refetch, isError } =
		useQuery({
			queryKey: ['personalData'],
			queryFn: getPersonalData,
			staleTime: 1000 * 60 * 60 * 12, // 12 hours
			gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
			enabled: userKind === USER_STUDENT,
			retry(failureCount, error) {
				if (error instanceof NoSessionError) {
					router.replace('/login')
					return false
				}
				return failureCount < 2
			}
		})

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)
	const [isBackground, setIsBackground] = React.useState(false)
	useEffect(() => {
		const handleAppStateChange = (nextAppState: AppStateStatus): void => {
			if (nextAppState === 'inactive' || nextAppState === 'background') {
				setIsBackground(true)
			} else {
				setIsBackground(false)
			}
		}

		const subscription = AppState.addEventListener(
			'change',
			handleAppStateChange
		)

		return () => {
			subscription.remove()
		}
	}, [])

	const logoutAlert = (): void => {
		if (Platform.OS === 'web') {
			if (!window.confirm(t('profile.logout.alert.message'))) {
				return
			}
			setIsLoggingOut(true)
			resetFood()
			resetPreferences()
			performLogout(toggleUserKind, resetOrder, queryClient)
				.catch((e) => {
					console.error(e)
				})
				.finally(() => {
					setIsLoggingOut(false)
				})
			return
		}
		Alert.alert(
			t('profile.logout.alert.title'),
			t('profile.logout.alert.message'),
			[
				{
					text: t('profile.logout.alert.cancel'),
					style: 'cancel'
				},
				{
					text: t('profile.logout.alert.confirm'),
					style: 'destructive',
					onPress: () => {
						setIsLoggingOut(true)
						resetFood()
						resetPreferences()
						performLogout(toggleUserKind, resetOrder, queryClient)
							.catch((e) => {
								console.error(e)
							})
							.finally(() => {
								setIsLoggingOut(false)
							})
					}
				}
			]
		)
	}

	const sections: FormListSections[] = [
		{
			header: t('profile.formlist.user.title'),
			items: [
				{
					title: t('labels.name', { ns: 'common' }),
					value: `${data?.vname} ${data?.name}`
				},
				{
					title: t('profile.formlist.user.matrical'),
					value: data?.mtknr,
					onPress: async () => {
						await copyToClipboard(data?.mtknr ?? '')
					}
				},
				{
					title: t('profile.formlist.user.library'),
					value: data?.bibnr,
					onPress: async () => {
						await copyToClipboard(data?.bibnr ?? '')
					}
				},
				{
					title: t('profile.formlist.user.printer'),
					value: data?.pcounter,
					onPress: () => {
						void Linking.openURL(printLink)
					}
				}
			]
		},
		{
			header: t('profile.formlist.study.title'),
			items: [
				{
					title: t('profile.formlist.study.degree'),
					value: `${data?.fachrich} (${data?.stg})`
				},
				{
					title: t('profile.formlist.study.spo'),
					value:
						data?.pvers === 'k.A.'
							? t('misc.unknown', { ns: 'common' })
							: data?.pvers,
					onPress: () => {
						if (
							data?.po_url !== undefined &&
							data.po_url !== '' &&
							data.po_url !== 'http://www.thi.de'
						) {
							void Linking.openURL(data.po_url)
						}
					}
				},
				{
					title: t('profile.formlist.study.group'),
					value: data?.stgru
				},
				{
					title: t('profile.formlist.user.status'),
					value:
						data?.rue === '1'
							? data.rue_sem
							: t('profile.formlist.user.statusInactive')
				}
			]
		},
		{
			header: t('profile.formlist.contact.title'),
			items: [
				{
					title: t('labels.thiEmail', { ns: 'common' }),
					value: data?.fhmail,
					onPress: async () => {
						await copyToClipboard(data?.fhmail ?? '')
					}
				},
				...(data?.email === ''
					? []
					: [
							{
								title: t('labels.email', { ns: 'common' }),
								value: data?.email,
								onPress: async () => {
									await copyToClipboard(data?.email ?? '')
								}
							}
						]),
				...(data?.telefon === ''
					? []
					: [
							{
								title: t('profile.formlist.contact.phone'),
								value: data?.telefon,
								onPress: async () => {
									await copyToClipboard(data?.telefon ?? '')
								}
							}
						]),
				{
					title: t('profile.formlist.contact.street'),
					value: data?.str
				},
				{
					title: t('profile.formlist.contact.city'),
					value: `${data?.plz} ${data?.ort}`
				}
			]
		}
	]

	return (
		<ScrollView
			contentContainerClassName="pb-8"
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
			refreshControl={
				isSuccess ? (
					<RefreshControl
						refreshing={isRefetchingByUser}
						onRefresh={() => {
							void refetchByUser()
						}}
					/>
				) : undefined
			}
		>
			{isLoading && (
				<View className="items-center justify-center py-10">
					<LoadingIndicator />
				</View>
			)}
			{isError && (
				<ErrorView
					title={error.message}
					onRefresh={refetchByUser}
					refreshing={isRefetchingByUser}
				/>
			)}
			{isPaused && (
				<ErrorView
					title={networkError}
					onRefresh={refetchByUser}
					refreshing={isRefetchingByUser}
				/>
			)}
			{isSuccess &&
				(data.mtknr !== undefined ? (
					<View className="self-center px-page py-4 w-full">
						<FormList sections={sections} privacyHidden={isBackground} />
					</View>
				) : (
					<ErrorView
						title={t('profile.error.title')}
						message={t('profile.error.message')}
						buttonText="Primuss"
						onButtonPress={() => {
							void Linking.openURL(
								'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
							)
						}}
						refreshing={isRefetchingByUser}
						onRefresh={refetchByUser}
						icon={{
							ios: 'person.crop.circle.badge.exclamationmark',
							android: 'account_circle_off',
							web: 'UserRoundX'
						}}
						isCritical={false}
					/>
				))}

			<Pressable
				onPress={logoutAlert}
				className="items-center self-center bg-card rounded-mg border-border flex-row gap-2.5 justify-center mb-[30px] mt-2.5 min-w-copy-button-min px-10 py-3"
				style={hairlineBorder}
				disabled={isLoggingOut}
			>
				{isLoggingOut ? (
					<LoadingIndicator />
				) : (
					<>
						<PlatformIcon
							ios={{
								name: 'rectangle.portrait.and.arrow.right',
								size: 18
							}}
							android={{
								name: 'logout',
								size: 22
							}}
							web={{
								name: 'LogOut',
								size: 22
							}}
							style={{ color: notificationColor }}
						/>
						<Text className="text-notification text-base">
							{t('profile.logout.button')}
						</Text>
					</>
				)}
			</Pressable>
		</ScrollView>
	)
}
