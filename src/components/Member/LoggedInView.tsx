import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/FormList'
import PlatformIcon from '@/components/Universal/Icon'
import { useMemberStore } from '@/hooks/useMemberStore'
import type { FormListSections } from '@/types/components'
import { AddToWalletButton } from './AddToWalletButton'
import { IDCard } from './IDCard'
import { stylesheet } from './styles'

export function LoggedInView(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('member')
	const { info, logout, refreshTokens, idToken } = useMemberStore()

	// JWT refresh logic: only refresh on mount if expired
	useEffect(() => {
		if (!info?.exp) {
			return
		}

		const expirationTime = info.exp * 1000
		const now = Date.now()
		const remaining = expirationTime - now

		if (remaining <= 0) {
			console.log('[JWT] Token expired on mount, attempting refresh...')
			void refreshTokens()
		} else {
			console.log(
				'[JWT] Token valid on mount, expires in',
				Math.floor(remaining / 1000),
				'seconds'
			)
		}
	}, [info, refreshTokens])

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
		}
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

			<AddToWalletButton />

			<Pressable onPress={logout} style={styles.logoutButton}>
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
				<Text style={styles.logoutText}>{t('logout')}</Text>
			</Pressable>
		</ScrollView>
	)
}
