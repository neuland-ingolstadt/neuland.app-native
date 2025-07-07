import * as Haptics from 'expo-haptics'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Alert,
	Linking,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import { useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/FormList'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/Icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { IDCard } from './IDCard'
import { SecurityWarningModal } from './SecurityWarningModal'
import { stylesheet } from './styles'

export function LoggedInView(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('member')
	const { info, logout, refreshTokens, idToken } = useMemberStore()
	const [showSecurityWarning, setShowSecurityWarning] = useState(false)

	// JWT refresh logic: only refresh on mount if expired
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
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
	}

	const handleConfirmAddToWallet = async () => {
		setShowSecurityWarning(false)
		// Wallet logic is now handled directly in the SecurityWarningModal
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
					onPress: () => Linking.openURL('https://wiki.informatik.sexy'),
					icon: {
						ios: 'book.closed',
						android: 'menu_book',
						web: 'BookOpen'
					}
				},
				{
					title: t('quickLinks.ssoProfile'),
					onPress: () => Linking.openURL('https://sso.informatik.sexy/'),
					icon: {
						ios: 'circle.grid.3x3',
						android: 'apps',
						web: 'LayoutGrid'
					}
				}
			]
		},
		...(Platform.OS === 'ios'
			? [
					{
						items: [
							{
								title: 'Add to Wallet',
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
			: [])
	]

	return (
		<ScrollView
			contentContainerStyle={styles.container}
			showsVerticalScrollIndicator={false}
		>
			{info && (
				<View style={styles.cardWrapper}>
					<IDCard info={info} idToken={idToken} />
				</View>
			)}

			<FormList sections={quickLinksSections} />

			<Pressable onPress={logoutAlert} style={styles.logoutButton}>
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
					style={styles.notification}
				/>
				<Text style={styles.logoutText}>{t('logout.button')}</Text>
			</Pressable>

			<SecurityWarningModal
				visible={showSecurityWarning}
				onConfirm={handleConfirmAddToWallet}
				onCancel={handleCancelAddToWallet}
			/>
		</ScrollView>
	)
}
