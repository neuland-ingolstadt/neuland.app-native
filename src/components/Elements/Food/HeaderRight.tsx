import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export const FoodHeaderRight = (): JSX.Element => {
    const { t } = useTranslation(['accessibility'])
    const colors = useTheme().colors as Colors
    return (
        <Pressable
            onPress={() => {
                router.push('foodPreferences')
            }}
            hitSlop={10}
            style={styles.headerButton}
            accessibilityLabel={t('button.foodPreferences')}
        >
            <View>
                <PlatformIcon
                    color={colors.text}
                    ios={{
                        name: 'line.3.horizontal.decrease',
                        size: 22,
                    }}
                    android={{
                        name: 'filter_list',
                        size: 24,
                    }}
                />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    headerButton: {
        marginHorizontal: 0,
    },
})
