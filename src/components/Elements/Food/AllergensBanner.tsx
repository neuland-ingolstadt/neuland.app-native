import { FoodFilterContext } from '@/components/contexts'
import { getContrastColor } from '@/utils/ui-utils'
import { router } from 'expo-router'
import React, { useContext } from 'react'
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
    const { initAllergenSelection } = useContext(FoodFilterContext)
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
                            router.push('foodAllergens')
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
        padding: 10,
        borderRadius: 8,
        marginTop: 2,
        marginBottom: 10,
        backgroundColor: theme.colors.primary,
    },
    dismissButton: {
        position: 'absolute',
        zIndex: 1,
        top: 5,
        right: 5,
        padding: 5,
        borderRadius: 8,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: getContrastColor(theme.colors.primary),
    },
    bannerText: {
        marginTop: 3,
        fontSize: 14,
        color: getContrastColor(theme.colors.primary),
    },
    paddingContainer: {
        paddingHorizontal: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border,
    },
    contrastColor: {
        color: getContrastColor(theme.colors.primary),
    },
}))
