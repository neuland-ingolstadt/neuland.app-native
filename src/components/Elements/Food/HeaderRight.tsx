import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'

import PlatformIcon from '../Universal/Icon'

export const FoodHeaderRight = (): JSX.Element => {
    const isDark = useTheme().dark

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
                    color={isDark ? 'white' : 'black'}
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
        marginHorizontal: Platform.OS === 'ios' ? 14 : 0,
    },
})
