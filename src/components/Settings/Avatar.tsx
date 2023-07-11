import React from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'

const Avatar = ({
    size = 50,
    shadow = true,
    background,
    children,
}: {
    size?: number
    background: string
    shadow?: boolean
    children: JSX.Element
}): JSX.Element => {
    const shadowStyle = {
        shadowOpacity: 0.3,
        shadowRadius: 2,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    }

    const avatarSize: StyleProp<ViewStyle> = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
        ...(shadow && shadowStyle),
    }

    return <View style={avatarSize}>{children}</View>
}

export default Avatar
