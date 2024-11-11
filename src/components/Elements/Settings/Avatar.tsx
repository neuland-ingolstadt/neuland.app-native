import React from 'react'
import {
    type ColorValue,
    type StyleProp,
    View,
    type ViewStyle,
} from 'react-native'

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
    background,
    children,
}: {
    size?: number
    background: ColorValue
    children: JSX.Element
}): JSX.Element => {
    const avatarSize: StyleProp<ViewStyle> = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: background,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    }

    return <View style={avatarSize}>{children}</View>
}

export default Avatar
