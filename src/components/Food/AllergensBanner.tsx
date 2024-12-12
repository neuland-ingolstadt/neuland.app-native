import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { getContrastColor } from '@/utils/ui-utils'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'

export const AllergensBanner = ({
    scrollY,
}: {
    scrollY: Animated.Value
}): JSX.Element => {
    const { t } = useTranslation('common')
    const initAllergenSelection = useFoodFilterStore(
        (state) => state.initAllergenSelection
    )
    const { styles } = useStyles(stylesheet)
    return (
        <Animated.View
            style={{
                ...styles.paddingContainer,
                borderBottomWidth: scrollY.interpolate({
                    inputRange: [0, 0, 0],
                    outputRange: [0, 0, 0.5],
                    extrapolate: 'clamp',
                }),
            }}
        >
            <View style={styles.bannerContainer}>
                <TouchableOpacity
                    onPress={() => {
                        initAllergenSelection()
                    }}
                    hitSlop={6}
                    style={styles.dismissButton}
                >
                    <PlatformIcon
                        ios={{
                            name: 'xmark',
                            size: 16,
                        }}
                        android={{
                            name: 'close',
                            size: 20,
                        }}
                        style={styles.contrastColor}
                    />
                </TouchableOpacity>
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            router.navigate('/foodAllergens')
                        }}
                    >
                        <Text style={styles.bannerTitle}>
                            {t('navigation.allergens', {
                                ns: 'navigation',
                            })}
                        </Text>

                        <Text style={styles.bannerText}>
                            {t('empty.config', { ns: 'food' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    bannerContainer: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.md,
        marginBottom: 10,
        marginTop: 2,
        padding: 10,
    },
    bannerText: {
        color: getContrastColor(theme.colors.primary),
        fontSize: 14,
        marginTop: 3,
    },
    bannerTitle: {
        color: getContrastColor(theme.colors.primary),
        fontSize: 16,
        fontWeight: 'bold',
    },
    contrastColor: {
        color: getContrastColor(theme.colors.primary),
    },
    dismissButton: {
        borderRadius: theme.radius.md,
        padding: 5,
        position: 'absolute',
        right: 5,
        top: 5,
        zIndex: 1,
    },
    paddingContainer: {
        borderBottomColor: theme.colors.border,
        borderBottomWidth: 0.5,
        paddingHorizontal: 12,
    },
}))
