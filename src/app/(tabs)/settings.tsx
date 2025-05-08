import Settings from '@/components/Settings/SettingsScreen'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'
import Head from 'expo-router/head'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

export default function FoodRootScreen(): React.JSX.Element {
	const [isPageOpen, setIsPageOpen] = useState(false)
	const { t } = useTranslation('navigation')
	useEffect(() => {
		setIsPageOpen(true)
	}, [])

	if (Platform.OS === 'web') {
		return <Settings />
	}

	return (
		<>
			<Head>
				<title>{t('navigation.profile')}</title>
				<meta name="Profile" content="Profile and Settings" />
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<WorkaroundStack
				name={'profile'}
				titleKey={'navigation.profile'}
				component={isPageOpen ? Settings : () => <></>}
				androidFallback
			/>
		</>
	)
}
