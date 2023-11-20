import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { type ColorValue, Platform, View } from 'react-native'
import SweetSFSymbol from 'sweet-sfsymbols'
import { type SystemName } from 'sweet-sfsymbols/build/SweetSFSymbols.types'

interface PlatformIconProps {
    color: string | ColorValue

    android: {
        name: typeof MaterialCommunityIcons.defaultProps.name
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
    android: 'link-variant',
}

export const chevronIcon = {
    ios: 'chevron.forward',
    android: 'chevron-right',
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
        return (
            <MaterialCommunityIcons
                name={android.name}
                size={android.size}
                color={color}
                style={{ ...style }}
            />
        )
    }
}

export default PlatformIcon
