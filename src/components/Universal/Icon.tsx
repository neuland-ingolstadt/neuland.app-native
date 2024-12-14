import { type MaterialIcon } from '@/types/material-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { FileWarning, icons } from 'lucide-react-native'
import React from 'react'
import { Platform, Text } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import SweetSFSymbol from 'sweet-sfsymbols'
import { type SystemName } from 'sweet-sfsymbols/build/SweetSFSymbols.types'

export type LucideIcon = keyof typeof icons
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
    web?: {
        name: LucideIcon
        size: number
    }
    style?: any
}

export const lucidErrorIcon = {
    name: 'error',
    size: 24,
    color: 'red',
}

export const linkIcon = {
    ios: 'safari',
    android: 'link' as MaterialIcon,
    web: 'Link' as LucideIcon,
}

export const chevronIcon = {
    ios: 'chevron.forward',
    android: 'chevron_right' as MaterialIcon,
    web: { name: 'chevron_right', size: 24 },
}

const PlatformIcon = ({
    android,
    ios,
    web,
    style,
}: PlatformIconProps): JSX.Element => {
    const { styles, theme } = useStyles(stylesheet)

    const lucidFallback = <FileWarning size={24} color={lucidErrorIcon.color} />

    if (Platform.OS === 'web') {
        if (web != null) {
            const LucideIcon = icons[web?.name]

            return (
                <LucideIcon
                    name={web.name}
                    size={web.size}
                    color={style?.color ?? theme.colors.primary}
                    style={style}
                />
            )
        } else {
            return lucidFallback
        }
    } else if (Platform.OS === 'ios') {
        return (ios.fallback ?? false) ? (
            <MaterialCommunityIcons
                name={
                    ios.name as typeof MaterialCommunityIcons.defaultProps.name
                }
                size={ios.size}
                color={style?.color ?? theme.colors.primary}
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
                    style?.color ?? theme.colors.primary,
                    ...(ios.additionalColor ? [ios.additionalColor] : []),
                ]}
                weight={ios.weight ?? 'regular'}
                style={style}
                variant={ios.variant as any}
                variableValue={ios.variableValue}
                renderingMode={ios.renderMode}
            />
        )
    } else {
        return android ? (
            <Text
                style={{
                    ...styles.androidIcon,
                    ...(android.variant === 'outlined'
                        ? styles.androidIconOutlined
                        : styles.androidIconFilled),
                    fontSize: android.size,
                    lineHeight: android.size,
                    color: style?.color ?? theme.colors.primary,
                    ...style,
                }}
            >
                {communityIcons.includes(android.name) ? (
                    <MaterialCommunityIcons
                        name={android.name as any}
                        size={android.size}
                        color={style?.color ?? theme.colors.primary}
                        style={{ ...styles.communityIcon, ...style }}
                    />
                ) : (
                    android.name
                )}
            </Text>
        ) : (
            lucidFallback
        )
    }
}

export default PlatformIcon

const communityIcons: string[] = ['instagram', 'github']

export type CommunityIcon = 'instagram' | 'github' | 'map-marker'

const stylesheet = createStyleSheet((theme) => ({
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
}))
