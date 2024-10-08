import { type Colors } from '@/components/colors'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from './Icon'

interface ShareButtonProps {
    onPress?: () => void | Promise<void>
}

export default function ShareButton({
    onPress,
}: ShareButtonProps): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')

    return (
        <Pressable
            style={[
                {
                    backgroundColor: colors.card,
                },
                styles.shareButton,
            ]}
            onPress={onPress}
        >
            <View style={styles.shareContent}>
                <PlatformIcon
                    ios={{
                        name: 'square.and.arrow.up',
                        size: 15,
                    }}
                    android={{
                        name: 'share',
                        size: 18,
                    }}
                    color={colors.primary}
                />

                <Text style={[{ color: colors.primary }, styles.shareText]}>
                    {t('misc.share')}
                </Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    shareButton: {
        alignSelf: 'center',
        paddingHorizontal: 45,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 5,
    },
    shareContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    shareText: { fontSize: 17, alignItems: 'flex-end' },
})
