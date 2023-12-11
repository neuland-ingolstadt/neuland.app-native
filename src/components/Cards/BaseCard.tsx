// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { type Colors } from '@/components/colors'
import { CARD_PADDING } from '@/utils/style-utils'
import { type MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'

import PlatformIcon from '../Elements/Universal/Icon'
import { DashboardContext } from '../provider'

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

    const { hideDashboardEntry, resetOrder } =
        React.useContext(DashboardContext)
    return (
        <Pressable
            onPress={onPress}
            delayLongPress={300}
            onLongPress={() => {}}
        >
            <ContextMenu
                title={t('cards.titles.' + title)}
                actions={[
                    {
                        title: t('contextMenu.settings'),
                        systemIcon: Platform.OS === 'ios' ? 'gear' : undefined,
                    },
                    {
                        title: t('contextMenu.hide'),
                        systemIcon:
                            Platform.OS === 'ios' ? 'eye.slash' : undefined,
                        destructive: true,
                    },
                    {
                        title: t('contextMenu.reset'),
                        systemIcon:
                            Platform.OS === 'ios'
                                ? 'arrow.counterclockwise'
                                : undefined,
                        destructive: true,
                    },
                ]}
                onPress={(e) => {
                    e.nativeEvent.name === t('contextMenu.settings') &&
                        router.push('(user)/dashboard')
                    e.nativeEvent.name === t('contextMenu.hide') &&
                        hideDashboardEntry(title)
                    e.nativeEvent.name === t('contextMenu.reset') &&
                        resetOrder()
                }}
                onPreviewPress={onPress}
            >
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
                                size: 16,
                            }}
                            android={{
                                name: 'chevron-right',
                                size: 26,
                            }}
                        />
                    </View>
                    {children != null && <>{children}</>}
                </View>
            </ContextMenu>
        </Pressable>
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
    },
    container: {
        borderRadius: 8,
    },
})

export default BaseCard
