import { STATUS_URL } from '@/data/constants'
import * as Application from 'expo-application'
import { usePathname } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const FeedbackButton = ({
    error,
    crash,
}: {
    error: Error
    crash: boolean
}): React.JSX.Element => {
    const { t } = useTranslation('common')
    const { styles } = useStyles(stylesheet)
    const platform = Platform.OS
    const appVersion = `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`
    const subject = crash ? 'App-Crash' : 'App-Error'
    const pathname = usePathname()
    const mailContent = `mailto:app-feedback@informatik.sexy?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Schritte zur Reproduktion:\nSonstiges:\n\nApp Version: ${appVersion}\nPlatform: ${platform}\nSeite: ${pathname}\nFehler: ${error.message}`)}`

    const sendMail = (): void => {
        Linking.openURL(mailContent).catch((err) => {
            console.error('Error opening mail client:', err)
        })
    }
    return (
        <Pressable
            style={styles.container}
            onPress={() => {
                sendMail()
            }}
        >
            <View style={styles.refreshButton}>
                <Text style={styles.actionButtonText}>
                    {t('error.crash.feedback')}
                </Text>
            </View>
        </Pressable>
    )
}

export const StatusButton = (): React.JSX.Element => {
    const { t } = useTranslation('common')
    const { styles } = useStyles(stylesheet)

    return (
        <Pressable
            style={styles.container}
            onPress={() => {
                void Linking.openURL(STATUS_URL)
            }}
        >
            <View style={styles.refreshButton}>
                <Text style={styles.actionButtonText}>
                    {t('error.crash.status')}
                </Text>
            </View>
        </Pressable>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    actionButtonText: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: '600',
    },
    container: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.mg,
    },

    refreshButton: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
}))
