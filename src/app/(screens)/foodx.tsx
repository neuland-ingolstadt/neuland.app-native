import FoodScreen from '@/components/Food/FoodScreen'
import { FoodHeaderRight } from '@/components/Food/HeaderRight'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'
import { useNavigation } from 'expo-router'
import Head from 'expo-router/head'
import type React from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FoodRootScreen(): React.JSX.Element {
    const [isPageOpen, setIsPageOpen] = useState(false)
    const { t } = useTranslation('navigation')
    const navigation = useNavigation()
    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <FoodHeaderRight />,
        })
    }, [navigation])

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
