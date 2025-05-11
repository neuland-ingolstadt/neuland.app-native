import FormList from '@/components/Universal/FormList'
import type { LucideIcon } from '@/components/Universal/Icon'
import type { FormListSections } from '@/types/components'
import type { MaterialIcon } from '@/types/material-icons'
import { trackEvent } from '@aptabase/react-native'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Share } from 'react-native'
import DeviceInfo from 'react-native-device-info'

export default function SettingsMenu(): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation(['settings'])

	const sections: FormListSections[] = [
		{
			header: t('menu.formlist.preferences.title'),
			items: [
				// {
				// 	title: 'Dashboard',
				// 	icon: {
				// 		ios: 'rectangle.stack',
				// 		android: 'dashboard_customize',
				// 		web: 'LayoutDashboard'
				// 	},
				// 	onPress: () => {
				// 		router.navigate('/dashboard')
				// 	}
				// },
				{
					title: t('menu.formlist.preferences.food'),
					icon: {
						android: 'restaurant',
						ios: 'fork.knife',
						web: 'Utensils'
					},
					onPress: () => {
						router.navigate('/food-preferences')
					}
				},
				{
					title: t('menu.formlist.preferences.timetable'),
					icon: {
						ios: 'calendar',
						android: 'event',
						web: 'Calendar'
					},
					onPress: () => {
						router.navigate('/timetable-preferences')
					}
				},
				{
					title: t('menu.formlist.preferences.language'),
					icon: {
						ios: 'globe',
						android: 'language',
						web: 'Globe'
					},
					onPress: async () => {
						if (
							Platform.OS === 'ios' ||
							(Platform.OS === 'android' && Platform.Version >= 33)
						) {
							await Linking.openSettings()
						} else {
							// Language alert will be handled by parent component
							router.navigate('/language')
						}
					}
				}
			]
		},
		{
			header: t('menu.formlist.appearance.title'),
			items: [
				{
					title: t('menu.formlist.appearance.theme'),
					icon: {
						ios: 'moon.stars',
						android: 'routine',
						web: 'MoonStar'
					},
					onPress: () => {
						router.navigate('/theme')
					}
				},
				...(Platform.OS === 'ios' && DeviceInfo.getDeviceType() !== 'Desktop'
					? [
							{
								title: 'App Icon',
								icon: {
									ios: 'star.square.on.square',
									android: '' as MaterialIcon,
									web: 'StarSquare' as LucideIcon
								},
								onPress: () => {
									router.navigate('/app-icon')
								}
							}
						]
					: [])
			]
		},
		{
			header: t('menu.formlist.legal.title'),
			items: [
				{
					title: t('menu.formlist.legal.about'),
					icon: {
						ios: 'info.circle',
						android: 'info',
						web: 'Info'
					},
					onPress: () => {
						router.navigate('/about')
					}
				},
				{
					title: t('menu.formlist.legal.share'),
					icon: {
						ios: 'square.and.arrow.up',
						android: 'share',
						web: 'Share'
					},
					onPress: () => {
						trackEvent('Share', { type: 'app' })

						void Share.share({
							url: 'https://next.neuland.app/get', // url option is only available on iOS
							message:
								Platform.OS === 'ios'
									? t('menu.formlist.legal.shareMessage')
									: t('menu.formlist.legal.shareMessageAndroid')
						})
					}
				},
				...(Platform.OS === 'web'
					? [
							{
								title: t('menu.formlist.legal.download'),
								icon: {
									ios: 'square.and.arrow.up',
									android: 'share' as MaterialIcon,
									web: 'Download' as LucideIcon
								},
								onPress: () => {
									void Linking.openURL('https://next.neuland.app/get')
								}
							}
						]
					: [])
			]
		}
	]

	return <FormList sections={sections} />
}
