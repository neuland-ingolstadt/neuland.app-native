// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import i18n from '@/localization/i18n'
import { type Announcement } from '@/types/neuland-api'
import { CARD_PADDING, PAGE_PADDING } from '@/utils/style-utils'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Elements/Universal/Icon'
import { DashboardContext } from '../contexts'

interface PopUpCardProps {
    data: Announcement[] | undefined
}

const PopUpCard: React.FC<PopUpCardProps> = ({ data }) => {
    const { hiddenAnnouncements, hideAnnouncement } =
        useContext(DashboardContext)
    const { t } = useTranslation('navigation')
    const { styles } = useStyles(stylesheet)

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
            (a: Announcement, b: Announcement) => a.priority - b.priority
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
            style={styles.card}
        >
            <View style={styles.titleView}>
                <PlatformIcon
                    ios={{
                        name: 'megaphone.fill',
                        size: 18,
                    }}
                    android={{
                        name: 'campaign',
                        size: 24,
                    }}
                />
                <Text style={styles.title}>
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
                        ios={{
                            name: 'xmark',
                            size: 16,
                        }}
                        android={{
                            name: 'close',
                            size: 26,
                        }}
                        style={styles.closeIcon}
                    />
                </Pressable>
            </View>
            <Text style={styles.description}>
                {/* @ts-expect-error cannot verify that description is a valid key */}
                {filtered[0].description[i18n.language]}
            </Text>
            {filtered[0].url !== null && filtered[0].url !== '' ? (
                <Text style={styles.footer}>
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

const stylesheet = createStyleSheet((theme) => ({
    title: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        color: theme.colors.text,
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
        marginHorizontal: PAGE_PADDING,
        paddingBottom: 14,
        marginVertical: 6,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    description: {
        marginTop: 10,
        fontSize: 15,
        color: theme.colors.text,
    },
    footer: {
        marginTop: 10,
        fontSize: 11,
        textAlign: 'right',
        color: theme.colors.labelColor,
    },
    closeIcon: {
        color: theme.colors.labelColor,
    },
}))

export default PopUpCard
