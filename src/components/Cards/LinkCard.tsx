import { PreferencesContext } from '@/components/contexts'
import { quicklinks } from '@/data/constants'
import { type MaterialIcon } from '@/types/material-icons'
import { trackEvent } from '@aptabase/react-native'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Elements/Universal/Icon'
import BaseCard from './BaseCard'

const LinkCard = (): JSX.Element => {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')
    const { recentQuicklinks, addRecentQuicklink } =
        useContext(PreferencesContext)

    const userQuicklinks = recentQuicklinks
        .map((title) => quicklinks.find((quicklink) => quicklink.key === title))
        .filter((quicklink) => quicklink !== undefined)
    const linkPress = async (key: string, url: string): Promise<void> => {
        addRecentQuicklink(key)
        trackEvent('Quicklink', { link: key })
        await Linking.openURL(url)
    }

    return (
        <BaseCard title="links" onPressRoute="links">
            <View style={styles.cardsFilled}>
                {userQuicklinks.map((link, index) => {
                    if (link === undefined) {
                        return null
                    }
                    return (
                        <Pressable
                            key={index}
                            onPress={() => {
                                void linkPress(link.key, link.url)
                            }}
                            style={styles.linkBox}
                        >
                            <PlatformIcon
                                ios={{
                                    name: link.icon.ios,
                                    size: 17,
                                    weight: 'semibold',
                                }}
                                android={{
                                    name: link.icon.android as MaterialIcon,
                                    size: 21,
                                    variant: 'outlined',
                                }}
                            />
                            <Text
                                style={styles.eventTitle}
                                numberOfLines={1}
                                adjustsFontSizeToFit={Platform.OS === 'ios'}
                                minimumFontScale={0.8}
                                ellipsizeMode="tail"
                            >
                                {t(
                                    // @ts-expect-error Type cannot be verified
                                    ['quicklinks.' + link.key, link.key]
                                )}
                            </Text>
                        </Pressable>
                    )
                })}
            </View>
        </BaseCard>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    cardsFilled: {
        paddingTop: 14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 14.5,
        flexShrink: 1,
        color: theme.colors.text,
    },
    linkBox: {
        paddingTop: 12,
        paddingBottom: 7,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: Platform.OS === 'android' ? 2 : 7,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.cardButton,
    },
}))

export default LinkCard
