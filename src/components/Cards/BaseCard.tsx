// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { type Colors } from '@/components/colors'
import { CARD_PADDING } from '@/utils/style-utils'
import { type MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import PlatformIcon from '../Elements/Universal/Icon'

interface BaseCardProps {
    title: string
    onPress: () => void
    androidIcon: typeof MaterialCommunityIcons.defaultProps.name
    iosIcon: string
    children?: React.ReactNode
}

const BaseCard: React.FC<BaseCardProps> = ({
    title,
    onPress,
    androidIcon,
    iosIcon,
    children,
}) => {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('navigation')
    return (
        <TouchableOpacity onPress={onPress}>
            <View
                style={[
                    styles.card,
                    {
                        borderColor: colors.border,
                        backgroundColor: colors.card,
                    },
                ]}
            >
                <View style={styles.titleView}>
                    <PlatformIcon
                        color={colors.primary}
                        ios={{
                            name: iosIcon,
                            size: 18,
                        }}
                        android={{
                            name: androidIcon,
                            size: 24,
                        }}
                    />
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t('cards.titles.' + title)}
                    </Text>

                    <PlatformIcon
                        color={colors.labelColor}
                        ios={{
                            name: 'chevron.forward',
                            size: 20,
                        }}
                        android={{
                            name: 'chevron-right',
                            size: 26,
                        }}
                    />
                </View>
                {children != null && <>{children}</>}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    titleView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    card: {
        borderRadius: 8,
        padding: CARD_PADDING,
        gap: 12,
    },
})

export default BaseCard
