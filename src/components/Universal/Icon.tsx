import { type MaterialIcon } from '@/types/material-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import { Platform, Text } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import SweetSFSymbol from 'sweet-sfsymbols'
import { type SystemName } from 'sweet-sfsymbols/build/SweetSFSymbols.types'

interface PlatformIconProps {
    android: {
        name: MaterialIcon | CommunityIcon
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
    android: 'link' as MaterialIcon,
}

export const chevronIcon = {
    ios: 'chevron.forward',
    android: 'chevron_right' as MaterialIcon,
}

const PlatformIcon = ({
    android,
    ios,
    style,
}: PlatformIconProps): JSX.Element => {
    if (Platform.OS === 'ios') {
        return (ios.fallback ?? false) ? (
            <MaterialCommunityIcons
                name={
                    ios.name as typeof MaterialCommunityIcons.defaultProps.name
                }
                size={ios.size}
                color={style?.color ?? styles.defaultColor.color}
                style={{
                    width: ios.size,
                    height: ios.size,
                    ...styles.iosFallbackOffset,
                    ...style,
                }}
            />
        ) : (
            <SweetSFSymbol
                name={ios.name as SystemName}
                size={ios.size}
                colors={[
                    style?.color ?? styles.defaultColor.color,
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
        )
    } else {
        return (
            <Text
                style={{
                    ...styles.androidIcon,
                    ...(android.variant === 'outlined'
                        ? styles.androidIconOutlined
                        : styles.androidIconFilled),
                    fontSize: android.size,
                    lineHeight: android.size,
                    color: style?.color ?? styles.defaultColor.color,
                    ...style,
                }}
            >
                {communityIcons.includes(android.name) ? (
                    <MaterialCommunityIcons
                        name={android.name as any}
                        size={android.size}
                        color={style?.color ?? styles.defaultColor.color}
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

export type CommunityIcon = 'instagram' | 'github' | 'map-marker'

const styles = StyleSheet.create((theme) => ({
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
    iosFallbackOffset: {
        marginRight: -2,
    },
    defaultColor: {
        color: theme.colors.primary,
    },
}))
