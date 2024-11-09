// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { type Colors } from '@/components/colors'
import i18n from '@/localization/i18n'
import { type Announcement } from '@/types/neuland-api'
import { CARD_PADDING, PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'

import PlatformIcon from '../Elements/Universal/Icon'
import { DashboardContext } from '../contexts'

interface PopUpCardProps {
    data: Announcement[] | undefined
}

const PopUpCard: React.FC<PopUpCardProps> = ({ data }) => {
    const { hiddenAnnouncements, hideAnnouncement } =
        useContext(DashboardContext)
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('navigation')

    if (data === undefined) {
        return <></>
    }
    const filter = (data: Announcement[]): Announcement[] => {
        const now = Date.now()
        const activeAnnouncements = data.filter(
            (announcement: Announcement) =>
                new Date(announcement.startDateTime).getTime() < now &&
                new Date(announcement.endDateTime).getTime() > now &&
                !hiddenAnnouncements.includes(announcement.id)
        )
        activeAnnouncements.sort(
            (a: Announcement, b: Announcement) => b.priority - a.priority
        )
        return activeAnnouncements
    }
    const filtered = filter(data)
    return filtered != null && filtered.length > 0 ? (
        <Pressable
            onPress={() => {
                if (filtered[0].url !== null && filtered[0].url !== '') {
                    void Linking.openURL(filtered[0].url)
                }
            }}
            style={[
                styles.card,
                {
                    marginHorizontal: PAGE_PADDING,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                },
            ]}
        >
            <View style={styles.titleView}>
                <PlatformIcon
                    color={colors.primary}
                    ios={{
                        name: 'megaphone.fill',
                        size: 18,
                    }}
                    android={{
                        name: 'campaign',
                        size: 24,
                    }}
                />
                <Text style={[styles.title, { color: colors.text }]}>
                    {/* @ts-expect-error cannot verify that title is a valid key */}
                    {filtered[0].title[i18n.language]}
                </Text>
                <Pressable
                    onPress={() => {
                        hideAnnouncement(filtered[0].id)
                    }}
                    hitSlop={10}
                >
                    <PlatformIcon
                        color={colors.labelColor}
                        ios={{
                            name: 'xmark',
                            size: 16,
                        }}
                        android={{
                            name: 'close',
                            size: 26,
                        }}
                    />
                </Pressable>
            </View>
            <Text style={{ color: colors.text, ...styles.description }}>
                {/* @ts-expect-error cannot verify that description is a valid key */}
                {filtered[0].description[i18n.language]}
            </Text>
            {filtered[0].url !== null && filtered[0].url !== '' ? (
                <Text style={{ color: colors.labelColor, ...styles.footer }}>
                    {t('cards.announcements.readMore')}
                </Text>
            ) : (
                <></>
            )}
        </Pressable>
    ) : (
        <></>
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
        paddingTop: CARD_PADDING,
        paddingHorizontal: CARD_PADDING,
        paddingBottom: 14,
        marginVertical: 6,
    },
    description: {
        marginTop: 10,
        fontSize: 15,
    },
    footer: {
        marginTop: 10,
        fontSize: 11,
        textAlign: 'right',
    },
})

export default PopUpCard
