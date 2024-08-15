import { type Colors } from '@/components/colors'
import { PreferencesContext } from '@/components/contexts'
import { quicklinks } from '@/data/constants'
import { type MaterialIcon } from '@/types/material-icons'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

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
                                style={{
                                    ...styles.eventTitle,
                                    color: colors.text,
                                }}
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

const styles = StyleSheet.create({
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
    },
})

export default LinkCard
