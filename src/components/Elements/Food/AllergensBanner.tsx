import { type Colors } from '@/components/colors'
import { FoodFilterContext } from '@/components/contexts'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

import PlatformIcon from '../Universal/Icon'

export const AllergensBanner = ({
    scrollY,
}: {
    scrollY: Animated.Value
}): JSX.Element => {
    const { t } = useTranslation('common')
    const { initAllergenSelection } = useContext(FoodFilterContext)
    const colors = useTheme().colors as Colors
    const contrastTextColor = getContrastColor(colors.primary)
    return (
        <Animated.View
            style={{
                ...styles.paddingContainer,
                borderBottomColor: colors.border,
                borderBottomWidth: scrollY.interpolate({
                    inputRange: [0, 0, 0],
                    outputRange: [0, 0, 0.5],
                    extrapolate: 'clamp',
                }),
            }}
        >
            <View
                style={{
                    backgroundColor: colors.primary,
                    ...styles.bannerContainer,
                }}
            >
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
                        color={contrastTextColor}
                    />
                </TouchableOpacity>
                <View>
                    <TouchableOpacity
                        onPress={() => {
                            router.push('foodAllergens')
                        }}
                    >
                        <Text
                            style={{
                                color: contrastTextColor,
                                ...styles.bannerTitle,
                            }}
                        >
                            {t('navigation.allergens', {
                                ns: 'navigation',
                            })}
                        </Text>

                        <Text
                            style={{
                                color: contrastTextColor,
                                ...styles.bannerText,
                            }}
                        >
                            {t('empty.config', { ns: 'food' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    bannerContainer: {
        padding: 10,
        borderRadius: 8,
        marginTop: 2,
        marginBottom: 10,
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
    },
    bannerText: {
        marginTop: 3,
        fontSize: 14,
    },
    paddingContainer: {
        paddingHorizontal: 12,
        borderBottomWidth: 0.5,
    },
})
