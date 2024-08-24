import { type Colors } from '@/components/colors'
import { handleBiometricAuth } from '@/utils/app-utils'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text } from 'react-native'

import PlatformIcon from '../Universal/Icon'

const GradesButton = (): JSX.Element => {
    const theme = useTheme()
    const { t } = useTranslation('settings')
    const colors = theme.colors as Colors
    return (
        <Pressable
            onPress={() => {
                void handleBiometricAuth('grades')
            }}
            style={styles.gradesRow}
        >
            <Text
                style={{
                    color: colors.text,
                    ...styles.gradesText,
                }}
            >
                {t('profile.formlist.grades.button')}
            </Text>
            <PlatformIcon
                color={colors.labelSecondaryColor}
                ios={{
                    name: 'book',
                    size: 15,
                }}
                android={{
                    name: 'bar_chart_4_bars',
                    size: 18,
                }}
                style={styles.iconAlign}
            />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    gradesRow: {
        flexDirection: 'row',
        flex: 1,
        paddingVertical: 13,
        paddingHorizontal: 16,
    },
    gradesText: {
        flex: 1,
        fontSize: 16,
    },
    iconAlign: {
        alignSelf: 'center',
    },
})

export default GradesButton
