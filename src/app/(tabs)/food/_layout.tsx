import { Stack } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { FoodHeaderRight } from '@/components/Food/header-right'
import { useTransparentHeaderStyle } from '@/hooks/useTransparentHeader'

export default function FoodLayout(): React.JSX.Element {
	const { t } = useTranslation('navigation')
	const transparentHeaderStyle = useTransparentHeaderStyle()

	return (
		<Stack screenOptions={transparentHeaderStyle}>
			<Stack.Screen
				name="index"
				options={{
					title: t('navigation.food'),
					headerRight: () => <FoodHeaderRight />,
					...transparentHeaderStyle
				}}
			/>
		</Stack>
	)
}
