import React from 'react'
import { Platform, Pressable } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from './Icon'

interface ShareButtonProps {
    onPress: () => void | Promise<void>
}

export default function ShareHeaderButton({
    onPress,
}: ShareButtonProps): JSX.Element {
    const { styles } = useStyles(stylesheet)

    return (
        <Pressable
            onPress={() => {
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
                    size: 18,
                }}
                style={Platform.select({
                    android: {
                        marginRight: 2,
                    },
                    ios: {
                        marginBottom: 3,
                    },
                })}
            />
        </Pressable>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    shareButton: {
        marginRight: -5,
        borderRadius: 25,
        padding: 7,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
}))
