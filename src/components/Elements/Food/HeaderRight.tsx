import { type Colors } from '@/components/colors'
import { type Theme, useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export const FoodHeaderRight = (): JSX.Element => {
    const theme: Theme = useTheme()
    const colors = theme.colors as Colors

    return (
        <Pressable
            onPress={() => {
                router.push('(food)/preferences')
            }}
            hitSlop={10}
            style={styles.headerButton}
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
        marginHorizontal: 14,
    },
})
