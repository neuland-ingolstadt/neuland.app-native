// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { type Colors } from '@/components/colors'
import { CARD_PADDING } from '@/utils/style-utils'
import { type MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'

import PlatformIcon from '../Elements/Universal/Icon'
import { DashboardContext, UserKindContext } from '../provider'

interface BaseCardProps {
    title: string
    onPress: () => void
    androidIcon: typeof MaterialCommunityIcons.defaultProps.name
    iosIcon: string
    removable?: boolean
    children?: React.ReactNode
}

const BaseCard: React.FC<BaseCardProps> = ({
    title,
    onPress,
    androidIcon,
    iosIcon,
    children,
    removable = true, // ugly but more efficient than iterating over all cards
}) => {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('navigation')

    const { hideDashboardEntry, resetOrder } = useContext(DashboardContext)
    const { userKind } = useContext(UserKindContext)

    const actions = []

    // Settings action
    actions.push({
        title: t('contextMenu.settings'),
        systemIcon: Platform.OS === 'ios' ? 'gear' : undefined,
    })

    // Hide action (conditionally pushed)
    if (removable) {
        actions.push({
            title: t('contextMenu.hide'),
            systemIcon: Platform.OS === 'ios' ? 'eye.slash' : undefined,
            destructive: true,
        })
    }

    // Reset action
    actions.push({
        title: t('contextMenu.reset'),
        systemIcon:
            Platform.OS === 'ios' ? 'arrow.counterclockwise' : undefined,
        destructive: true,
    })

    return (
        <Pressable
            onPress={onPress}
            delayLongPress={300}
            onLongPress={() => {}}
        >
            <ContextMenu
                // @ts-expect-error cannot verify that title is a valid key
                title={t('cards.titles.' + title)}
                actions={actions}
                onPress={(e) => {
                    e.nativeEvent.name === t('contextMenu.settings') &&
                        router.push('(user)/dashboard')
                    e.nativeEvent.name === t('contextMenu.hide') &&
                        hideDashboardEntry(title)
                    e.nativeEvent.name === t('contextMenu.reset') &&
                        resetOrder(userKind)
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
                            {/* @ts-expect-error cannot verify that title is a valid key */}
                            {t('cards.titles.' + title)}
                        </Text>

                        <PlatformIcon
                            color={colors.labelColor}
                            ios={{
                                name: 'chevron.forward',
                                size: 16,
                            }}
                            android={{
                                name: 'chevron_right',
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
})

export default BaseCard
