import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { FeedbackButton, StatusButton } from './ActionButtons'

export default function StatusBox({
    error,
    crash,
}: {
    error: Error
    crash: boolean
}): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')
    return (
        <View style={styles.boxContainer}>
            <Text style={styles.errorDetail}>{t('error.crash.steps')}</Text>
            <FeedbackButton error={error} crash={crash} />
            <StatusButton />
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    errorDetail: {
        fontSize: 17,
        textAlign: 'center',
        fontWeight: '500',
        paddingBottom: 30,
        color: theme.colors.text,
    },
    boxContainer: {
        alignItems: 'center',
        gap: 15,
        borderRadius: 12,
        padding: 25,
        backgroundColor: theme.colors.card,
    },
}))
