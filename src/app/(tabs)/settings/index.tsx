import Head from 'expo-router/head'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import Settings from '@/components/Settings/settings-screen'

export default function SettingsRootScreen(): React.JSX.Element {
	const { t } = useTranslation(['navigation', 'common'])

	return (
		<>
			<Head>
				<title>{t('navigation.profile')}</title>
				<meta
					name="Profile"
					content={t('meta.settingsDescription', { ns: 'common' })}
				/>
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<Settings />
		</>
	)
}
