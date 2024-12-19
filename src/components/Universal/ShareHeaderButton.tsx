import React from 'react'
import { Platform, Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from './Icon'

interface ShareButtonProps {
    onPress: () => void | Promise<void>
}

export default function ShareHeaderButton({
    onPress,
}: ShareButtonProps): React.JSX.Element {
    const { styles } = useStyles(stylesheet)

    return (
        <Pressable
            onPressOut={() => {
                void onPress()
            }}
            style={styles.shareButton}
        >
            <PlatformIcon
                ios={{
                    name: 'square.and.arrow.up',
                    size: 16,
                    weight: 'semibold',
                }}
                android={{
                    name: 'share',
                    size: 20,
                }}
                web={{
                    name: 'Share',
                    size: 20,
                }}
                style={styles.icon}
            />
        </Pressable>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    icon: {
        ...Platform.select({
            android: {
                marginRight: 2,
                color: theme.colors.text,
            },
            ios: {
                marginBottom: 3,
                color: theme.colors.primary,
            },
        }),
    },
    shareButton: {
        alignItems: 'center',
        backgroundColor: Platform.select({
            android: undefined,
            ios: theme.colors.background,
        }),
        borderRadius: Platform.select({
            android: undefined,
            ios: theme.radius.infinite,
        }),
        height: 34,
        justifyContent: 'center',
        marginEnd: Platform.OS === 'web' ? 14 : -5,
        padding: 7,
        width: 34,
    },
}))
