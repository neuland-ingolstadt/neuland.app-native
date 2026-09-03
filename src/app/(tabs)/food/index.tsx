import Head from 'expo-router/head'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import FoodScreen from '@/components/Food/food-screen'

export default function FoodRootScreen(): React.JSX.Element {
	const { t } = useTranslation(['navigation', 'common'])

	return (
		<>
			<Head>
				<title>{t('navigation.food')}</title>
				<meta
					name="Food"
					content={t('meta.foodDescription', { ns: 'common' })}
				/>
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<FoodScreen />
		</>
	)
}
