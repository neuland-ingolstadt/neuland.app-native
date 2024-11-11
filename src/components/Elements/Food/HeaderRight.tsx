import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'

export const FoodHeaderRight = (): JSX.Element => {
    const { t } = useTranslation(['accessibility'])
    const { styles } = useStyles(stylesheet)
    return (
        <Pressable
            onPress={() => {
                router.push('foodPreferences')
            }}
            hitSlop={10}
            style={styles.headerButton}
            accessibilityLabel={t('button.foodPreferences')}
        >
            <View>
                <PlatformIcon
                    ios={{
                        name: 'line.3.horizontal.decrease',
                        size: 22,
                    }}
                    android={{
                        name: 'filter_list',
                        size: 24,
                    }}
                />
            </View>
        </Pressable>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    headerButton: {
        marginHorizontal: 0,
    },
    icon: {
        color: theme.colors.text,
    },
}))
