import { type MaterialIcon } from '@/types/material-icons'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { type ColorValue, Platform, StyleSheet, Text, View } from 'react-native'
import SweetSFSymbol from 'sweet-sfsymbols'
import { type SystemName } from 'sweet-sfsymbols/build/SweetSFSymbols.types'

interface PlatformIconProps {
    color: string | ColorValue

    android: {
        name: MaterialIcon
        size: number
        variant?: 'filled' | 'outlined'
    }
    ios: {
        name: string
        size: number
        weight?:
            | 'ultraLight'
            | 'thin'
            | 'light'
            | 'regular'
            | 'medium'
            | 'semibold'
            | 'bold'
            | 'heavy'
            | 'black'
        variant?: string
        fallback?: boolean
        renderMode?:
            | 'multicolor'
            | 'monochrome'
            | 'hierarchical'
            | 'palette'
            | undefined
        variableValue?: number | undefined
        additionalColor?: string
    }
    style?: any
}
export const linkIcon = {
    ios: 'safari',
    android: 'link',
}

export const chevronIcon = {
    ios: 'chevron.forward',
    android: 'chevron_right',
}

const PlatformIcon = ({
    color,
    android,
    ios,
    style,
}: PlatformIconProps): JSX.Element => {
    if (Platform.OS === 'ios') {
        return ios.fallback ?? false ? (
            <Ionicons
                name={ios.name as typeof Ionicons.defaultProps.name}
                size={ios.size}
                color={color}
                style={{ width: ios.size - 1, height: ios.size, ...style }}
            />
        ) : (
            <View>
                <SweetSFSymbol
                    name={ios.name as SystemName}
                    size={ios.size}
                    colors={[
                        color as string,
                        ...(ios.additionalColor != null
                            ? [ios.additionalColor]
                            : []),
                    ]}
                    weight={ios.weight ?? 'regular'}
                    style={{
                        ...style,
                    }}
                    variant={ios.variant as any}
                    variableValue={ios.variableValue}
                    renderingMode={ios.renderMode}
                />
            </View>
        )
    } else {
        return (
            <Text
                style={{
                    ...styles.androidIcon,
                    ...(android.variant === 'outlined'
                        ? styles.androidIconOutlined
                        : styles.androidIconFilled),
                    color,
                    fontSize: android.size * 1,
                    lineHeight: android.size,
                    ...style,
                }}
            >
                {communityIcons.includes(android.name) ? (
                    <MaterialCommunityIcons
                        name={android.name as any}
                        size={android.size}
                        color={color}
                        style={{ ...styles.communityIcon, ...style }}
                    />
                ) : (
                    android.name
                )}
            </Text>
        )
    }
}

export default PlatformIcon

const communityIcons: string[] = ['instagram', 'github']

const styles = StyleSheet.create({
    androidIcon: {
        paddingTop: 3,
    },
    androidIconFilled: {
        fontFamily: 'MaterialSymbolsRoundedFill',
    },
    androidIconOutlined: {
        fontFamily: 'MaterialSymbolsRoundedOutline',
    },
    communityIcon: {
        paddingTop: 50,
    },
})
