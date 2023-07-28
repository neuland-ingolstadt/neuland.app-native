import React from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'

/**
 * Avatar component that displays a circular image or icon with optional shadow and background color.
 * @param size The size of the avatar in pixels. Defaults to 50.
 * @param shadow Whether to display a shadow around the avatar. Defaults to true.
 * @param background The background color of the avatar.
 * @param children The content to display inside the avatar.
 * @returns A JSX element representing the Avatar component.
 */
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
