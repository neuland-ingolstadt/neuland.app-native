import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { FeedbackButton, StatusButton } from './ActionButtons'

export default function StatusBox({
    error,
    crash,
}: {
    error: Error
    crash: boolean
}): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    return (
        <View
            style={{
                backgroundColor: colors.card,
                ...styles.boxContainer,
            }}
        >
            <Text style={[styles.errorDetail, { color: colors.text }]}>
                {t('error.crash.steps')}
            </Text>
            <FeedbackButton error={error} crash={crash} />
            <StatusButton />
        </View>
    )
}

const styles = StyleSheet.create({
    errorDetail: {
        fontSize: 17,
        textAlign: 'center',
        fontWeight: '500',
        paddingBottom: 30,
    },
    boxContainer: {
        alignItems: 'center',
        gap: 15,
        borderRadius: 12,
        padding: 25,
    },
})
