import { type Colors } from '@/components/colors'
import { CARD_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PlatformIcon from './Icon'

export default function ErrorGuestView({
    title,
    message,
    buttonText,
    icon,
    onButtonPress,
    footer,
    onRefresh,
    refreshing,
    inModal,
}: {
    title: string
    message?: string

    icon?: { ios: string; android: string }
    buttonText?: string
    onButtonPress?: () => void
    footer?: string
    onRefresh?: () => void
    refreshing?: boolean
    inModal?: boolean
}): JSX.Element {
    const colors = useTheme().colors as Colors
    console.log(title)
    const { t } = useTranslation('common')
    const getIcon = (): string => {
        const ios = Platform.OS === 'ios'
        switch (title) {
            case 'Network request failed':
                return ios ? 'wifi.slash' : 'wifi-slash'
            case 'User is logged in as guest':
                return ios ? 'person.crop.circle.badge.questionmark' : 'person'
            default:
                return icon !== undefined
                    ? ios
                        ? icon.ios
                        : icon.android
                    : ios
                    ? 'exclamationmark.triangle.fill'
                    : 'error'
        }
    }

    const getTitle = (): string => {
        switch (title) {
            case 'Network request failed':
                return t('error.network.title')
            case 'User is logged in as guest':
                return t('error.guest.title')
            default:
                return title
        }
    }

    const getMessage = (): string => {
        switch (title) {
            case 'Network request failed':
                return t('error.network.description')
            case 'User is logged in as guest':
                return t('error.guest.description')
            default:
                if (message != null) {
                    return message
                }
                return t('error.description')
        }
    }

    const ErrorButton = (): JSX.Element => {
        const buttonAction = (): void => {
            switch (title) {
                case 'User is logged in as guest':
                    router.push('(user)/login')
                    break
                default:
                    if (onButtonPress != null) {
                        onButtonPress()
                    }
                    break
            }
        }
        const buttonProps =
            title === 'User is logged in as guest'
                ? {
                      onPress: () => {
                          router.push('(user)/login')
                      },
                      text: t('error.guest.button'),
                  }
                : onButtonPress != null
                ? { onPress: buttonAction, text: t('error.button') }
                : null

        return buttonProps != null || title === 'User is logged in as guest' ? (
            <Pressable
                style={[
                    styles.logoutContainer,
                    {
                        backgroundColor:
                            inModal ?? false ? colors.background : colors.card,
                    },
                ]}
                onPress={buttonProps?.onPress}
            >
                <View style={styles.refreshButton}>
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 16,
                            fontWeight: '600',
                        }}
                    >
                        {buttonProps?.text}
                    </Text>
                </View>
            </Pressable>
        ) : (
            <></>
        )
    }

    return (
        <ScrollView
            refreshControl={
                refreshing != null && title !== 'User is logged in as guest' ? (
                    <RefreshControl
                        refreshing={refreshing ?? false}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <></>
                )
            }
            contentContainerStyle={{
                ...styles.innerContainer,
                paddingTop: inModal ?? false ? 50 : 150,
            }}
        >
            <View
                style={{
                    ...styles.errorContainer,
                    paddingBottom: inModal ?? false ? 30 : 64,
                }}
            >
                <PlatformIcon
                    color={colors.primary}
                    ios={{
                        name: getIcon(),
                        size: 50,
                    }}
                    android={{
                        name: getIcon(),
                        size: 48,
                    }}
                />
                <Text
                    style={{
                        ...styles.errorTitle,
                        color: colors.text,
                    }}
                >
                    {getTitle()}
                </Text>
                <Text style={[styles.errorInfo, { color: colors.text }]}>
                    {getMessage()}
                </Text>
                <ErrorButton />
                {refreshing != null &&
                    title !== 'User is logged in as guest' && (
                        <Text
                            style={[
                                styles.errorFooter,
                                { color: colors.labelColor },
                            ]}
                        >
                            {t('error.pull')}
                        </Text>
                    )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    innerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
    },
    messageContainer: {
        padding: CARD_PADDING,
        borderRadius: 8,
        width: '100%',
        maxWidth: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 8,
        textAlign: 'center',
    },
    logoutContainer: {
        borderRadius: 10,
        marginBottom: 20,
        marginTop: 30,
        alignItems: 'center',
        alignSelf: 'center',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 40,
    },
    errorMessage: {
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 12,
    },
    errorFooter: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
    errorContainer: {
        gap: 12,
        alignItems: 'center',
    },
})
