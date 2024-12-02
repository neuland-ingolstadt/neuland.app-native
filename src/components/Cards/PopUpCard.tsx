// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { type AnnouncementFieldsFragment } from '@/gql/graphql'
import i18n from '@/localization/i18n'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import { DashboardContext } from '../contexts'

interface PopUpCardProps {
    data: AnnouncementFieldsFragment[]
}

const PopUpCard: React.FC<PopUpCardProps> = ({ data }) => {
    const { hiddenAnnouncements, hideAnnouncement } =
        useContext(DashboardContext)
    const { t } = useTranslation('navigation')
    const { styles } = useStyles(stylesheet)

    if (data === undefined) {
        return <></>
    }
    const filter = (
        data: AnnouncementFieldsFragment[]
    ): AnnouncementFieldsFragment[] => {
        const now = Date.now()
        const activeAnnouncements = data.filter(
            (announcement) =>
                new Date(announcement.startDateTime).getTime() < now &&
                new Date(announcement.endDateTime).getTime() > now &&
                !hiddenAnnouncements.includes(announcement.id)
        )
        activeAnnouncements.sort((a, b) => a.priority - b.priority)
        return activeAnnouncements
    }
    const filtered = filter(data)
    return filtered != null && filtered.length > 0 ? (
        <Pressable
            onPress={() => {
                if (filtered[0].url != null && filtered[0].url !== '') {
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
    card: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        marginHorizontal: theme.margins.page,
        marginVertical: 6,
        paddingBottom: 14,
        paddingHorizontal: theme.margins.card,
        paddingTop: theme.margins.card,
    },
    closeIcon: {
        color: theme.colors.labelColor,
    },
    description: {
        color: theme.colors.text,
        fontSize: 15,
        marginTop: 10,
    },
    footer: {
        color: theme.colors.labelColor,
        fontSize: 11,
        marginTop: 10,
        textAlign: 'right',
    },
    title: {
        color: theme.colors.text,
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    titleView: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
}))

export default PopUpCard
