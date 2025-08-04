import Head from 'expo-router/head'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import TimetableScreen from '@/components/Timetable/timetable-screen'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'

export default function TimetableRootScreen(): React.JSX.Element {
	const { t } = useTranslation('navigation')

	if (Platform.OS === 'web') {
		return <TimetableScreen />
	}
	return (
		<>
			<Head>
				<title>{t('navigation.timetable')}</title>
				<meta name="Timetable" content="View your timetable" />
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<WorkaroundStack
				name={'timetable'}
				titleKey={'navigation.timetable'}
				component={TimetableScreen}
				androidFallback
			/>
		</>
	)
}
