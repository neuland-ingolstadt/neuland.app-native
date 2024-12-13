import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from './Icon'

interface ShareButtonProps {
    onPress?: () => void
}

export default function ShareButton({
    onPress,
}: ShareButtonProps): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')

    return (
        <Pressable style={styles.shareButton} onPress={onPress}>
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
                />

                <Text style={styles.shareText}>{t('misc.share')}</Text>
            </View>
        </Pressable>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    shareButton: {
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        marginTop: 5,
        paddingHorizontal: 45,
        paddingVertical: 12,
    },
    shareContent: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    shareText: {
        alignItems: 'flex-end',
        color: theme.colors.primary,
        fontSize: 17,
    },
}))
