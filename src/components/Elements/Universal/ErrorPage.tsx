import { type Colors } from '@/components/colors'
import { CARD_PADDING, PAGE_PADDING } from '@/utils/style-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

export default function ErrorPage({
    message,
    refreshing,
    onRefresh,
}: {
    message?: string
    refreshing: boolean
    onRefresh: () => void
}): JSX.Element {
    const { t } = useTranslation('common')
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
            <Ionicons name={'alert-circle-outline'} size={48} color={'red'} />
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
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        zIndex: 9999,
        position: 'absolute',
        width: '100%',
        height: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
})
