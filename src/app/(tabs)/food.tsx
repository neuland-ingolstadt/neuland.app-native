import FoodScreen from '@/components/Food/FoodScreen'
import { FoodHeaderRight } from '@/components/Food/HeaderRight'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'
import Head from 'expo-router/head'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FoodRootScreen(): JSX.Element {
    const [isPageOpen, setIsPageOpen] = useState(false)
    const { t } = useTranslation('navigation')
    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <title>{t('navigation.food')}</title>
                <meta name="Food" content="Meal plan for the canteens" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <WorkaroundStack
                name={'dashboard'}
                titleKey={'navigation.food'}
                component={isPageOpen ? FoodScreen : () => <></>}
                headerRightElement={FoodHeaderRight}
                fallback
            />
        </>
    )
}
