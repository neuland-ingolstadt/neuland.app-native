import { router } from 'expo-router'
import React from 'react'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from './Icon'

interface ShareButtonProps {
    onPress: () => void | Promise<void>
    noShare?: boolean
}

export default function ShareHeaderButton({
    onPress,
    noShare = false,
}: ShareButtonProps): React.JSX.Element {
    const { styles } = useStyles(stylesheet)
    return (
        <View style={styles.shareRow}>
            {!noShare && (
                <Pressable
                    onPressOut={() => {
                        void onPress()
                    }}
                    style={styles.shareButton}
                >
                    <PlatformIcon
                        ios={{
                            name: 'square.and.arrow.up',
                            size: 15,
                            weight: 'bold',
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
            )}
            {Platform.OS === 'ios' && (
                <Pressable
                    onPressOut={() => {
                        router.back()
                    }}
                    style={styles.shareButton}
                >
                    <PlatformIcon
                        ios={{
                            name: 'xmark',
                            size: 15,
                            weight: 'bold',
                        }}
                        android={{
                            name: 'expand_more',
                            size: 20,
                        }}
                        web={{
                            name: 'Share',
                            size: 20,
                        }}
                        style={styles.iconClose}
                    />
                </Pressable>
            )}
        </View>
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
                color: theme.colors.labelColor,
            },
        }),
    },
    iconClose: {
        ...Platform.select({
            android: {
                color: theme.colors.text,
            },
            ios: {
                color: theme.colors.labelColor,
            },
        }),
    },
    shareButton: {
        alignItems: 'center',
        backgroundColor: Platform.select({
            android: undefined,
            ios: theme.colors.sheetButton,
        }),
        borderRadius: Platform.select({
            android: undefined,
            ios: theme.radius.infinite,
        }),
        height: 30,
        justifyContent: 'center',
        marginEnd: Platform.OS === 'web' ? 14 : -8,
        padding: 5,
        width: 30,
    },
    shareRow: {
        flexDirection: 'row',
        gap: 20,
        paddingStart: 12,
    },
}))
