// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import ContextMenu from '@/components/Flow/ContextMenu'
import { USER_GUEST } from '@/data/constants'
import { type MaterialIcon } from '@/types/material-icons'
import { type RelativePathString, router } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import { DashboardContext, UserKindContext } from '../contexts'
import { cardIcons } from '../icons'

interface BaseCardProps {
    title: string
    onPressRoute?: string
    removable?: boolean
    children?: React.ReactNode
}

const BaseCard: React.FC<BaseCardProps> = ({
    title,
    onPressRoute,
    children,
    removable = true, // ugly but more efficient than iterating over all cards
}) => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('navigation')

    const { hideDashboardEntry, resetOrder } = useContext(DashboardContext)
    const { userKind = USER_GUEST } = useContext(UserKindContext)

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

    const foodKeys = ['mensa', 'mensaNeuburg', 'canisius', 'reimanns']
    const dynamicTitle = foodKeys.includes(title) ? 'food' : title
    return (
        <ContextMenu
            // @ts-expect-error cannot verify that title is a valid key
            title={t('cards.titles.' + title)}
            actions={actions}
            onPress={(e) => {
                e.nativeEvent.name === t('contextMenu.settings') &&
                    router.navigate('/dashboard')
                e.nativeEvent.name === t('contextMenu.hide') &&
                    hideDashboardEntry(title)
                e.nativeEvent.name === t('contextMenu.reset') &&
                    resetOrder(userKind ?? 'guest')
            }}
            onPreviewPress={() => {
                onPressRoute != null &&
                    router.navigate(onPressRoute as RelativePathString)
            }}
            disabled={Platform.OS === 'android'}
        >
            <Pressable
                disabled={onPressRoute == null}
                onPress={() => {
                    onPressRoute != null &&
                        router.navigate(onPressRoute as RelativePathString)
                }}
                delayLongPress={300}
                onLongPress={() => {}}
            >
                <View style={styles.card}>
                    <View style={styles.titleView}>
                        <PlatformIcon
                            ios={{
                                name: cardIcons[
                                    dynamicTitle as keyof typeof cardIcons
                                ]?.ios,
                                size: 18,
                            }}
                            android={{
                                name: cardIcons[
                                    dynamicTitle as keyof typeof cardIcons
                                ]?.android as MaterialIcon,
                                size: 24,
                                variant: 'outlined',
                            }}
                        />
                        <Text style={styles.title}>
                            {/* @ts-expect-error cannot verify that title is a valid key */}
                            {t('cards.titles.' + title)}
                        </Text>
                        {onPressRoute != null && (
                            <PlatformIcon
                                ios={{
                                    name: 'chevron.forward',
                                    size: 16,
                                }}
                                android={{
                                    name: 'chevron_right',
                                    size: 26,
                                }}
                                style={styles.labelColor}
                            />
                        )}
                    </View>
                    {children != null && <>{children}</>}
                </View>
            </Pressable>
        </ContextMenu>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    card: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        padding: theme.margins.card,
    },
    labelColor: {
        color: theme.colors.labelColor,
    },
    title: {
        color: theme.colors.text,
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        paddingBottom: Platform.OS === 'android' ? 2 : 0,
    },
    titleView: {
        alignItems: 'center',
        color: theme.colors.text,
        flexDirection: 'row',
        gap: 10,
    },
}))

export default BaseCard
