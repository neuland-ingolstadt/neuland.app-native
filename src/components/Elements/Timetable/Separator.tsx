import { type Colors } from '@/stores/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, View } from 'react-native'

export default function Separator(): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <View
            style={{
                ...styles.separator,
                backgroundColor: colors.border,
            }}
        />
    )
}

const styles = StyleSheet.create({
    separator: {
        marginLeft: 50 + 12,
        height: 1,
        marginVertical: 12,
    },
})
