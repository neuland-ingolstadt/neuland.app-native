import { type Colors } from '@/components/colors'
import { STATUS_URL } from '@/data/constants'
import { useTheme } from '@react-navigation/native'
import * as Application from 'expo-application'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export const FeedbackButton = ({
    error,
    crash,
}: {
    error: Error
    crash: boolean
}): JSX.Element => {
    const { t } = useTranslation('common')
    const colors = useTheme().colors as Colors
    const platform = Platform.OS
    const appVersion = `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`
    const subject = crash ? 'App-Crash' : 'App-Error'
    const mailContent = `mailto:app-feedback@informatik.sexy?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Schritte zur Reproduktion:\nSonstiges:\n\nApp Version: ${appVersion}\nPlatform: ${platform}\nFehler: ${error.message}`)}`

    const sendMail = (): void => {
        Linking.openURL(mailContent).catch((err) => {
            console.error('Error opening mail client:', err)
        })
    }
    return (
        <Pressable
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
            onPress={() => {
                sendMail()
            }}
        >
            <View style={styles.refreshButton}>
                <Text
                    style={{
                        color: colors.text,
                        ...styles.actionButtonText,
                    }}
                >
                    {t('error.crash.feedback')}
                </Text>
            </View>
        </Pressable>
    )
}

export const StatusButton = (): JSX.Element => {
    const { t } = useTranslation('common')
    const colors = useTheme().colors as Colors

    return (
        <Pressable
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
            onPress={() => {
                void Linking.openURL(STATUS_URL)
            }}
        >
            <View style={styles.refreshButton}>
                <Text
                    style={{
                        color: colors.text,
                        ...styles.actionButtonText,
                    }}
                >
                    {t('error.crash.status')}
                </Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
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

    actionButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
})
