import Head from 'expo-router/head'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import TimetableScreen from '@/components/Timetable/timetable-screen'

export default function TimetableRootScreen(): React.JSX.Element {
	const { t } = useTranslation(['navigation', 'common'])

	return (
		<>
			<Head>
				<title>{t('navigation.timetable')}</title>
				<meta
					name="Timetable"
					content={t('meta.timetableDescription', { ns: 'common' })}
				/>
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<TimetableScreen />
		</>
	)
}
