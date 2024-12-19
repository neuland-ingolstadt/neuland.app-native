import ErrorView from '@/components/Error/ErrorView'
import { trackEvent } from '@aptabase/react-native'
import { router, useNavigation, usePathname } from 'expo-router'
import React, { useEffect, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function Unmatched(): React.JSX.Element {
    const navigation = useNavigation()
    const cleanedPathname = usePathname().replace('/', '')
    const pathname =
        cleanedPathname.charAt(0).toUpperCase() + cleanedPathname.slice(1)
    const { t } = useTranslation('navigation')

    useEffect(() => {
        trackEvent('Unmatched', { pathname })
    })

    useLayoutEffect(() => {
        navigation.setOptions({
            title: t('unmatched.title'),
        })
    }, [navigation])

    return (
        <>
            <ErrorView
                title={`${pathname} ${t('unmatched.error.title')}`}
                message={t('unmatched.error.message')}
                buttonText={t('unmatched.error.button')}
                onButtonPress={() => {
                    if (router.canGoBack()) {
                        router.back()
                    } else {
                        router.replace('/(tabs)/(index)')
                    }
                }}
            />
        </>
    )
}
