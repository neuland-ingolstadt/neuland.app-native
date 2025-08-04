import { useNavigation } from 'expo-router'
import Head from 'expo-router/head'
import type React from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import FoodScreen from '@/components/Food/food-screen'
import { FoodHeaderRight } from '@/components/Food/header-right'
import WorkaroundStack from '@/components/Universal/workaround-stack'

export default function FoodRootScreen(): React.JSX.Element {
	const [isPageOpen, setIsPageOpen] = useState(false)
	const { t } = useTranslation('navigation')
	const navigation = useNavigation()
	useEffect(() => {
		setIsPageOpen(true)
	}, [])

	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => <FoodHeaderRight />
		})
	}, [navigation])

	if (Platform.OS === 'web') {
		return <FoodScreen />
	}

	return (
		<>
			<Head>
				<title>{t('navigation.food')}</title>
				<meta name="Food" content="Meal plan for the canteens" />
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<WorkaroundStack
				name={'food'}
				titleKey={'navigation.food'}
				component={isPageOpen ? FoodScreen : () => <></>}
				headerRightElement={FoodHeaderRight}
				androidFallback
			/>
		</>
	)
}
