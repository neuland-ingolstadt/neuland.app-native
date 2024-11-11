import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const LoginCard = (): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')
    return (
        <BaseCard title="login" removable={false} onPressRoute="login">
            <View style={styles.calendarView}>
                <View>
                    <Text style={styles.eventTitle}>
                        {t('cards.login.title')}
                    </Text>
                    <Text style={styles.eventDetails}>
                        {t('cards.login.message')}
                    </Text>
                </View>
            </View>
        </BaseCard>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    calendarView: {
        gap: 12,
        paddingTop: 10,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 16,
        color: theme.colors.text,
    },
    eventDetails: {
        fontSize: 15,
        color: theme.colors.labelColor,
    },
}))

export default LoginCard
