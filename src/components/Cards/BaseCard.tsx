// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
// @ts-expect-error - types for react-native-context-menu-view are not available
import { ContextMenuView } from '@/components/Elements/Universal/ContextMenuView'
import { type Colors } from '@/components/colors'
import { CARD_PADDING } from '@/utils/style-utils'
import { type MaterialCommunityIcons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'

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
            {...Platform.select({
                ios: {
                    delayLongPress: 300,
                    onLongPress: () => {},
                },
            })}
        >
            <ContextMenuView
                style={styles.container}
                menuConfig={{
                    menuTitle: t('cards.titles.' + title),
                    menuItems: [
                        {
                            actionKey: 'settings',
                            actionTitle: t('contextMenu.settings'),
                            icon: {
                                iconType: 'SYSTEM',
                                iconValue: 'rectangle.stack',
                            },
                        },
                        {
                            actionKey: 'hide',
                            actionTitle: t('contextMenu.hide'),
                            icon: {
                                iconType: 'SYSTEM',
                                iconValue: 'trash',
                            },
                            menuAttributes: ['destructive'],
                        },
                        {
                            actionKey: 'reset',
                            actionTitle: t('contextMenu.reset'),
                            icon: {
                                iconType: 'SYSTEM',
                                iconValue: 'arrow.clockwise',
                            },
                            menuAttributes: ['destructive'],
                        },
                    ],
                }}
                onPressMenuItem={({
                    nativeEvent,
                }: {
                    nativeEvent: { actionKey: string }
                }) => {
                    switch (nativeEvent.actionKey) {
                        case 'hide':
                            hideDashboardEntry(title)
                            break
                        case 'reset':
                            resetOrder()
                            break
                        case 'settings':
                            router.push('(user)/dashboard/')
                            break
                    }
                }}
                onPressMenuPreview={() => {
                    onPress()
                }}
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
            </ContextMenuView>
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
