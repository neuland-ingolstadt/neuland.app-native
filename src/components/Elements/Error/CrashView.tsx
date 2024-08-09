import { type Colors } from '@/components/colors'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import { type ErrorBoundaryProps, usePathname } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import LogoTextSVG from '../Flow/svgs/logoText'
import PlatformIcon from '../Universal/Icon'
import StatusBox from './ActionBox'

export const ErrorButton = ({
    onPress,
}: {
    onPress: () => void
}): JSX.Element => {
    const { t } = useTranslation('common')
    const colors = useTheme().colors as Colors
    return (
        <Pressable
            style={[
                styles.logoutContainer,
                {
                    backgroundColor: colors.card,
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.refreshButton}>
                <Text
                    style={{
                        color: colors.primary,
                        ...styles.refreshButtonText,
                    }}
                >
                    {t('error.crash.reload')}
                </Text>
            </View>
        </Pressable>
    )
}

export default function CrashView({
    error,
    retry,
}: ErrorBoundaryProps): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const path = usePathname()
    trackEvent('ErrorView', {
        title: error.message,
        path,
        crash: false,
    })

    const handlePress = (): void => {
        retry().catch((error) => {
            console.info('Error while retrying', error)
        })
    }

    return (
        <View
            style={{
                backgroundColor: colors.background,
                ...styles.flex,
            }}
        >
            <View
                style={{
                    ...styles.innerContainer,
                }}
            >
                <View style={styles.topContainer}>
                    <PlatformIcon
                        color={colors.primary}
                        ios={{
                            name: 'pc',
                            size: 80,
                            renderMode: 'multicolor',
                        }}
                        android={{
                            name: 'error',
                            size: 80,
                        }}
                    />
                    <Text
                        style={{
                            ...styles.errorTitle,
                            color: colors.text,
                        }}
                    >
                        {t('error.crash.title')}
                    </Text>
                    <Text style={[styles.errorInfo, { color: colors.text }]}>
                        {t('error.crash.description')}
                    </Text>
                </View>

                <StatusBox error={error} crash={true} />
                <ErrorButton onPress={handlePress} />
            </View>
            <View style={styles.logoContainer}>
                <LogoTextSVG size={15} color={colors.labelSecondaryColor} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    topContainer: { alignItems: 'center', gap: 20 },

    innerContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '85%',
        alignSelf: 'center',
        paddingVertical: 20,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 8,
        textAlign: 'center',
    },
    logoutContainer: {
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    errorInfo: {
        fontSize: 18,
        textAlign: 'center',
    },
    logoContainer: {
        bottom: 30,
        position: 'absolute',
        alignSelf: 'center',
    },
})
