import { type Colors } from '@/components/colors'
import { PreferencesContext } from '@/components/contexts'
import { quicklinks } from '@/data/constants'
import { type MaterialIcon } from '@/types/material-icons'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Elements/Universal/Icon'
import BaseCard from './BaseCard'

const LinkCard = (): JSX.Element => {
    const { t } = useTranslation('common')
    const colors = useTheme().colors as Colors
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
                    return (
                        <Pressable
                            key={index}
                            onPress={() => {
                                void linkPress(link.key, link.url)
                            }}
                            style={{
                                backgroundColor: colors.cardButton,
                                ...styles.linkBox,
                            }}
                        >
                            <PlatformIcon
                                color={colors.primary}
                                ios={{
                                    name: link.icon.ios,
                                    size: 18,
                                }}
                                android={{
                                    name: link.icon.android as MaterialIcon,
                                    size: 20,
                                    variant: 'outlined',
                                }}
                            />
                            <Text
                                style={{
                                    ...styles.eventTitle,
                                    color: colors.text,
                                }}
                                numberOfLines={2}
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

const styles = StyleSheet.create({
    cardsFilled: {
        paddingTop: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    eventTitle: {
        fontWeight: '500',
        fontSize: 16,
    },
    linkBox: {
        padding: 12,
        borderRadius: 8,

        flexDirection: 'row',
        gap: 10,
        flex: 1,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
})

export default LinkCard
