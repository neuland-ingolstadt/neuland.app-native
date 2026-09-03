import { Stack } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useTransparentHeaderStyle } from '@/hooks/useTransparentHeader'

export default function TimetableLayout(): React.JSX.Element {
	const { t } = useTranslation('navigation')
	const transparentHeaderStyle = useTransparentHeaderStyle()

	return (
		<Stack screenOptions={transparentHeaderStyle}>
			<Stack.Screen
				name="index"
				options={{
					title: t('navigation.timetable'),
					...transparentHeaderStyle
				}}
			/>
		</Stack>
	)
}
