import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { type ColorValue, Platform, StyleSheet, Text, View } from 'react-native'
import SweetSFSymbol from 'sweet-sfsymbols'
import { type SystemName } from 'sweet-sfsymbols/build/SweetSFSymbols.types'

interface PlatformIconProps {
    color: string | ColorValue

    android: {
        name: AndroidIconName | typeof MaterialCommunityIcons.defaultProps.name
        size: number
    }
    ios: {
        name: string
        size: number
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
    android: 'link' as AndroidIconName,
}

export const chevronIcon = {
    ios: 'chevron.forward',
    android: 'chevron-right' as AndroidIconName,
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
                style={{ width: ios.size - 1, height: ios.size + 1, ...style }}
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
        if (
            ![...Object.keys(ANDROID_ICONS), ...communityIcons].includes(
                android.name
            )
        ) {
            console.warn(`Android icon ${android.name} not found`)
        }

        return (
            <Text
                style={{
                    ...styles.androidIcon,
                    color,
                    fontSize: android.size * 1,
                    lineHeight: android.size,
                    ...style,
                }}
            >
                {communityIcons.includes(android.name) ? (
                    <MaterialCommunityIcons
                        name={android.name}
                        size={android.size}
                        color={color}
                        style={{ ...styles.communityIcon, ...style }}
                    />
                ) : (
                    ANDROID_ICONS[android.name as AndroidIconName] ??
                    ANDROID_ICONS.default
                )}
            </Text>
        )
    }
}

export default PlatformIcon

const communityIcons: string[] = ['instagram', 'github']

const ANDROID_ICONS = {
    home: <>&#xE9B2;</>,
    map: <>&#xE55B;</>,
    restaurant: <>&#xE56C;</>,
    'chevron-right': <>&#xE5CC;</>,
    calendar: <>&#xE935;</>,
    'calendar-month': <>&#xEBCC;</>,
    celebration: <>&#xEA65;</>,
    list: <>&#xE241;</>,
    book: <>&#xF53E;</>,
    group: <>&#xE7EF;</>,
    newspaper: <>&#xEB81;</>,
    'barcode-scanner': <>&#xE70C;</>,
    place: <>&#xE0C8;</>,
    'account-circle': <>&#xE853;</>,
    warning: <>&#xE002;</>,
    error: <>&#xE000;</>,
    check: <>&#xE5CA;</>,
    'check-circle': <>&#xF0BE;</>,
    palette: <>&#xE3B7;</>,
    'dashboard-customize': <>&#xE99B;</>,
    language: <>&#xE894;</>,
    link: <>&#xE157;</>,
    star: <>&#xF0EC;</>,
    person: <>&#xE7FD;</>,
    share: <>&#xE80D;</>,
    'manage-search': <>&#xF02F;</>,
    close: <>&#xE14C;</>,
    filter: <>&#xE152;</>,
    'chevron-up': <>&#xE316;</>,
    'chevron-down': <>&#xE313;</>,
    delete: <>&#xE872;</>,
    logout: <>&#xE9BA;</>,
    'lock-open': <>&#xE898;</>,
    mail: <>&#xE0BE;</>,
    default: <>&#xF56D;</>,
}

export type AndroidIconName = keyof typeof ANDROID_ICONS

const styles = StyleSheet.create({
    androidIcon: {
        paddingTop: 3,
        fontFamily: 'Material Symbols Rounded',
    },
    communityIcon: {
        paddingTop: 50,
    },
})
