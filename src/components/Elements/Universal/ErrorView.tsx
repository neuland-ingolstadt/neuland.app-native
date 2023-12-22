import { type Colors } from '@/components/colors'
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

export default function ErrorView({
    title,
    message,
    buttonText,
    icon,
    onButtonPress,
    onRefresh,
    refreshing,
    inModal,
}: {
    title: string
    message?: string
    icon?: { ios: string; android: string }
    buttonText?: string
    onButtonPress?: () => void
    onRefresh?: () => void
    refreshing?: boolean
    inModal?: boolean
}): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const networkError = 'Network request failed'
    const guestError = 'User is logged in as guest'
    const permissionError = '"Service for user-group not defined" (-120)'

    const getIcon = (): string => {
        const ios = Platform.OS === 'ios'
        switch (title) {
            case networkError:
                return ios ? 'wifi.slash' : 'wifi-off'
            case guestError:
                return ios
                    ? 'person.crop.circle.badge.questionmark'
                    : 'person-cancel'
            case permissionError:
                return ios
                    ? 'person.crop.circle.badge.exclamationmark'
                    : 'person-slash'
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
            case networkError:
                return t('error.network.title')
            case guestError:
                return t('error.guest.title')
            case permissionError:
                return t('error.permission.title')
            default:
                return title
        }
    }

    const getMessage = (): string => {
        switch (title) {
            case networkError:
                return t('error.network.description')
            case guestError:
                return t('error.guest.description')
            case permissionError:
                return t('error.permission.description')
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
                case guestError:
                    router.push('(user)/login')
                    break
                default:
                    if (onButtonPress != null) {
                        onButtonPress()
                    }
                    break
            }
        }
        let buttonProps = null

        if (title === guestError) {
            buttonProps = {
                onPress: () => {
                    router.push('(user)/login')
                },
                text: t('error.guest.button'),
            }
        } else if (onButtonPress != null && buttonText === undefined) {
            buttonProps = { onPress: buttonAction, text: t('error.button') }
        } else if (onButtonPress != null && buttonText !== undefined) {
            buttonProps = { onPress: buttonAction, text: buttonText }
        }

        return (buttonProps != null || title === guestError) &&
            title !== permissionError ? (
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
                            ...styles.refreshButtonText,
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
                refreshing != null && title !== guestError ? (
                    <RefreshControl
                        refreshing={refreshing ?? false}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <></>
                )
            }
            contentContainerStyle={
                inModal ?? false
                    ? styles.innerContainerModal
                    : styles.innerContainer
            }
        >
            <View
                style={
                    inModal ?? false
                        ? styles.errorContainerModal
                        : styles.errorContainer
                }
            >
                <PlatformIcon
                    color={colors.primary}
                    ios={{
                        name: getIcon(),
                        size: 50,
                    }}
                    android={{
                        name: getIcon(),
                        size: 64,
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
                {refreshing != null && title !== guestError && (
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

const baseStyles = StyleSheet.create({
    baseContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
    },
    errorContainer: {
        gap: 12,
        alignItems: 'center',
    },
})

const styles = StyleSheet.create({
    innerContainerModal: {
        ...baseStyles.baseContainer,
        paddingTop: 50,
    },
    innerContainer: {
        ...baseStyles.baseContainer,
        paddingTop: 150,
    },
    errorContainer: {
        ...baseStyles.errorContainer,
        paddingBottom: 64,
    },
    errorContainerModal: {
        ...baseStyles.errorContainer,
        paddingBottom: 30,
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
    refreshButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    errorInfo: {
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 12,
    },
    errorFooter: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 16,
    },
})
