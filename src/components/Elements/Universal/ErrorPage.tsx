import { type Colors } from '@/components/colors'
import { CARD_PADDING, PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

import PlatformIcon from './Icon'

function ErrorPage({
    message,
    refreshing,
    onRefresh,
}: {
    message?: string
    refreshing: boolean
    onRefresh: () => void
}): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                />
            }
            contentContainerStyle={styles.container}
        >
            <ErrorView message={message} />
        </ScrollView>
    )
}

function ErrorView({ message }: { message?: string }): JSX.Element {
    const { t } = useTranslation('common')
    const colors = useTheme().colors as Colors

    return (
        <View style={styles.innerContainer}>
            <PlatformIcon
                color={colors.primary}
                ios={{
                    name: 'exclamationmark.triangle',
                    variant: 'fill',
                    size: 44,
                }}
                android={{
                    name: 'error',
                    size: 48,
                }}
            />
            <Text
                style={{
                    ...styles.errorTitle,
                    color: colors.text,
                }}
            >
                {t('error.title')}
            </Text>
            <View
                style={{
                    ...styles.messageContainer,
                    backgroundColor: colors.card,
                }}
            >
                {message !== null && (
                    <Text style={{ color: colors.text }}>{message}</Text>
                )}
                <Text style={{ color: colors.text }}>
                    {t('error.description')}
                </Text>
            </View>
        </View>
    )
}

function ErrorButtonView({
    message,
    onRefresh,
}: {
    message?: string
    onRefresh: () => void
}): JSX.Element {
    const { t } = useTranslation('common')
    const colors = useTheme().colors as Colors

    return (
        <View style={styles.innerContainer}>
            <View style={styles.errorContainer}>
                <PlatformIcon
                    color={colors.primary}
                    ios={{
                        name: 'exclamationmark.triangle',
                        variant: 'fill',
                        size: 44,
                    }}
                    android={{
                        name: 'error',
                        size: 48,
                    }}
                />
                <Text
                    style={{
                        ...styles.errorTitle,
                        color: colors.text,
                    }}
                >
                    {t('error.title')}
                </Text>
                <Text style={[styles.errorMessage, { color: colors.text }]}>
                    {message}
                </Text>
                <Text style={[styles.errorInfo, { color: colors.text }]}>
                    {t('error.refreshButton', { ns: 'common' })}
                </Text>
                <Pressable
                    style={[
                        styles.logoutContainer,
                        { backgroundColor: colors.card },
                    ]}
                    onPress={onRefresh}
                >
                    <View style={styles.refreshButton}>
                        <Text
                            style={{
                                color: colors.primary,
                                fontSize: 16,
                                fontWeight: '600',
                            }}
                        >
                            {t('error.button')}
                        </Text>
                    </View>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    innerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingTop: 150,
    },
    container: {
        zIndex: 9999,
        position: 'absolute',
        width: '100%',
        height: '100%',
        flex: 1,
        gap: 12,
        padding: PAGE_PADDING,
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
    },
    logoutContainer: {
        borderRadius: 10,
        marginBottom: 30,
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
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    errorContainer: {
        paddingBottom: 64,
        gap: 12,
        alignItems: 'center',
    },
})

export { ErrorPage, ErrorView, ErrorButtonView }
