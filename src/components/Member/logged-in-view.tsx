import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Linking,
	Platform,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import FormList from '@/components/Universal/form-list'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/icon'
import { useIsFeatureEnabled, useRefreshByUser } from '@/hooks'
import { useMemberStore } from '@/hooks/useMemberStore'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { hairlineBorder } from '@/utils/uniwind-utils'
import { IDCard } from './id-card'
import {
	OfficePresenceSection,
	officePresenceQueryKey
} from './office-presence-section'
import { SecurityWarningModal } from './security-warning-modal'

export function LoggedInView(): React.JSX.Element {
	const notificationColor = String(
		useCSSVariable('--color-notification') ?? '#ff3b30'
	)
	const { t } = useTranslation('member')
	const { info, logout, refreshTokens, idToken } = useMemberStore()
	const [showSecurityWarning, setShowSecurityWarning] = useState(false)
	const queryClient = useQueryClient()
	const officePresenceEnabled = useIsFeatureEnabled(
		FeatureFlagKeys.memberOfficePresenceEnabled
	)

	const memberSub = info?.sub as string | undefined

	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(async () => {
		if (!officePresenceEnabled || !memberSub) {
			return
		}
		await queryClient.invalidateQueries({
			queryKey: officePresenceQueryKey(memberSub)
		})
	})

	useEffect(() => {
		if (!info?.exp) {
			return
		}

		const expirationTime = info.exp * 1000
		const now = Date.now()
		const remaining = expirationTime - now

		if (remaining <= 0) {
			void refreshTokens()
		}
	}, [info, refreshTokens])

	const handleAddToWallet = () => {
		setShowSecurityWarning(true)
		if (Platform.OS === 'ios') {
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
		}
	}

	const handleConfirmAddToWallet = async () => {
		setShowSecurityWarning(false)
	}

	const handleCancelAddToWallet = () => {
		setShowSecurityWarning(false)
	}

	const logoutAlert = (): void => {
		if (Platform.OS === 'web') {
			if (!window.confirm(t('logout.alert.message'))) {
				return
			}
			logout()
			return
		}
		Alert.alert(t('logout.alert.title'), t('logout.alert.message'), [
			{
				text: t('logout.alert.cancel'),
				style: 'cancel'
			},
			{
				text: t('logout.alert.confirm'),
				style: 'destructive',
				onPress: logout
			}
		])
	}

	const perksSection: FormListSections = {
		header: t('perks.header'),
		items: [
			{
				title: t('perks.theme'),
				icon: {
					ios: 'paintbrush',
					android: 'palette',
					web: 'Palette'
				},
				onPress: () => router.navigate('/theme')
			},
			...(Platform.OS === 'ios'
				? [
						{
							title: t('perks.appIcon'),
							icon: {
								ios: 'star.square.on.square',
								android: 'apps' as MaterialIcon,
								web: 'AppWindow' as LucideIcon
							},
							onPress: () => router.navigate('/app-icon')
						}
					]
				: [])
		]
	}

	const quickLinksSections: FormListSections[] = [
		{
			header: t('quickLinks.title'),
			items: [
				{
					title: t('quickLinks.neulandWebsite'),
					onPress: () => Linking.openURL('https://neuland-ingolstadt.de'),
					icon: {
						ios: 'globe',
						android: 'public',
						web: 'Globe'
					}
				},
				{
					title: t('quickLinks.wiki'),
					onPress: () => Linking.openURL('https://outline.neuland.ing'),
					icon: {
						ios: 'book.closed',
						android: 'menu_book',
						web: 'BookOpen'
					}
				},
				{
					title: t('quickLinks.ssoProfile'),
					onPress: () => Linking.openURL('https://auth.neuland.ing/'),
					icon: {
						ios: 'circle.grid.3x3',
						android: 'apps',
						web: 'LayoutGrid'
					}
				}
			]
		},
		{
			header: t('labels.wallet', { ns: 'common' }),
			items: [
				{
					title: t('securityWarning.buttons.addToWallet'),
					onPress: handleAddToWallet,
					icon: {
						ios: 'wallet.pass',
						android: 'wallet' as MaterialIcon,
						web: 'Wallet' as LucideIcon
					}
				}
			]
		}
	]

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={false}
			contentInsetAdjustmentBehavior="automatic"
			refreshControl={
				officePresenceEnabled ? (
					<RefreshControl
						refreshing={isRefetchingByUser}
						onRefresh={() => {
							void refetchByUser()
						}}
					/>
				) : undefined
			}
		>
			{info && (
				<View style={styles.cardWrapper}>
					<IDCard info={info} idToken={idToken} />
				</View>
			)}

			{officePresenceEnabled ? <OfficePresenceSection /> : null}

			<FormList sections={[perksSection, ...quickLinksSections]} />

			<Pressable
				onPress={logoutAlert}
				className="items-center self-center bg-card rounded-mg flex-row gap-2.5 justify-center my-[30px] min-w-[165px] px-10 py-3"
				style={hairlineBorder}
			>
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
					{t('logout.button')}
				</Text>
			</Pressable>

			<SecurityWarningModal
				visible={showSecurityWarning}
				onConfirm={handleConfirmAddToWallet}
				onCancel={handleCancelAddToWallet}
			/>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	cardWrapper: {
		marginBottom: 50
	},
	container: {
		paddingBottom: 30,
		paddingHorizontal: 12,
		paddingTop: 20
	}
})
