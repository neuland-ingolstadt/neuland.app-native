import Head from 'expo-router/head'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import Settings from '@/components/Settings/settings-screen'
import WorkaroundStack from '@/components/Universal/workaround-stack'

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
				headerTransparent={false}
				component={isPageOpen ? Settings : () => <></>}
				androidFallback
			/>
		</>
	)
}
