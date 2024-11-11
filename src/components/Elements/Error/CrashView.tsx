import { trackEvent } from '@aptabase/react-native'
import { type ErrorBoundaryProps, usePathname } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import LogoTextSVG from '../Flow/svgs/logoText'
import PlatformIcon from '../Universal/Icon'
import StatusBox from './ActionBox'

export const ErrorButton = ({
    onPress,
}: {
    onPress: () => void
}): JSX.Element => {
    const { t } = useTranslation('common')
    const { styles } = useStyles(stylesheet)
    return (
        <Pressable style={styles.logoutContainer} onPress={onPress}>
            <View style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>
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
    const { styles } = useStyles(stylesheet)
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
        <View style={styles.flex}>
            <View style={styles.innerContainer}>
                <View style={styles.topContainer}>
                    <PlatformIcon
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
                    <Text style={styles.errorTitle}>
                        {t('error.crash.title')}
                    </Text>
                    <Text style={styles.errorInfo}>
                        {t('error.crash.description')}
                    </Text>
                </View>

                <StatusBox error={error} crash={true} />
                <ErrorButton onPress={handlePress} />
            </View>
            <View style={styles.logoContainer}>
                <LogoTextSVG size={15} color={styles.logoColor.color} />
            </View>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    flex: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.text,
    },
    logoutContainer: {
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
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
        color: theme.colors.primary,
    },
    errorInfo: {
        fontSize: 18,
        textAlign: 'center',
        color: theme.colors.text,
    },
    logoContainer: {
        bottom: 30,
        position: 'absolute',
        alignSelf: 'center',
    },
    logoColor: {
        color: theme.colors.labelSecondaryColor,
    },
}))
