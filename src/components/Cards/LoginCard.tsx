import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import BaseCard from './BaseCard'

const LoginCard = (): JSX.Element => {
    const router = useRouter()
    const colors = useTheme().colors as Colors

    const { t } = useTranslation('navigation')

    return (
        <BaseCard
            title="login"
            removable={false}
            onPress={() => {
                router.push('login')
            }}
        >
            <View
                style={{
                    ...styles.calendarView,
                    ...styles.cardsFilled,
                }}
            >
                <View>
                    <Text style={{ ...styles.eventTitle, color: colors.text }}>
                        {t('cards.login.title')}
                    </Text>
                    <Text
                        style={{
                            ...styles.eventDetails,
                            color: colors.labelColor,
                        }}
                    >
                        {t('cards.login.message')}
                    </Text>
                </View>
            </View>
        </BaseCard>
    )
}

const styles = StyleSheet.create({
    calendarView: {
        gap: 12,
    },
    cardsFilled: {
        paddingTop: 10,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 16,
    },
    eventDetails: {
        fontSize: 15,
    },
})

export default LoginCard
