import TimetableScreen from '@/components/Timetable/TimetableScreen'
import WorkaroundStack from '@/components/Universal/WorkaroundStack'
import Head from 'expo-router/head'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function FoodRootScreen(): JSX.Element {
    const { t } = useTranslation('navigation')

    return (
        <>
            <Head>
                <title>{t('navigation.timetable')}</title>
                <meta name="Timetable" content="View your timetable" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <WorkaroundStack
                name={'dashboard'}
                titleKey={'navigation.food'}
                component={TimetableScreen}
                fallback
            />
        </>
    )
}
