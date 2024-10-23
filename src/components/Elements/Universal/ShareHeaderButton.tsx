import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { Platform, Pressable, StyleSheet } from 'react-native'

import PlatformIcon from './Icon'

interface ShareButtonProps {
    onPress: () => void | Promise<void>
}

export default function ShareHeaderButton({
    onPress,
}: ShareButtonProps): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <Pressable
            onPress={() => {
                void onPress()
            }}
            style={{
                backgroundColor: colors.background,
                ...styles.shareButton,
            }}
        >
            <PlatformIcon
                color={colors.primary}
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

const styles = StyleSheet.create({
    shareButton: {
        marginRight: -5,
        borderRadius: 25,
        padding: 7,
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
