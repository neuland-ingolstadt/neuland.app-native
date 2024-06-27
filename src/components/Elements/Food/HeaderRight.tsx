import { type Colors } from '@/components/colors'
import { ThemeContext } from '@/components/contexts'
import { getStatusBarIconStyle } from '@/utils/ui-utils'
import { type Theme, useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export const FoodHeaderRight = (): JSX.Element => {
    const theme: Theme = useTheme()
    const colorScheme = useColorScheme()
    const { theme: appTheme } = useContext(ThemeContext)
    const colors = theme.colors as Colors
    console.log('FoodHeaderRight', colors.text)

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
                    color={getStatusBarIconStyle(appTheme, colorScheme)}
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
