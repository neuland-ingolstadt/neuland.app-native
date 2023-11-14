// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { type Colors } from '@/components/colors'
import { CARD_PADDING } from '@/utils/style-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface BaseCardProps {
    title: string
    onPress: () => void
    icon: typeof Ionicons.defaultProps.name
    children?: React.ReactNode
}

const BaseCard: React.FC<BaseCardProps> = ({
    title,
    onPress,
    icon,
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
                    <Ionicons name={icon} size={20} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>
                        {t('cards.titles.' + title)}
                    </Text>
                    <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color={colors.labelColor}
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
        gap: 12,
    },
    card: {
        borderRadius: 8,
        padding: CARD_PADDING,
        gap: 12,
    },
})

export default BaseCard
