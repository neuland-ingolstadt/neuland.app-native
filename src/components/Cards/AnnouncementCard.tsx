import {
    type AnnouncementFieldsFragment,
    type Platform as AppPlatform,
    type UserKind,
} from '@/__generated__/gql/graphql'
import i18n from '@/localization/i18n'
import { trackEvent } from '@aptabase/react-native'
import React, { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import { DashboardContext, UserKindContext } from '../contexts'

interface AnnouncementCardProps {
    data: AnnouncementFieldsFragment[]
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ data }) => {
    const { hiddenAnnouncements, hideAnnouncement } =
        useContext(DashboardContext)
    const { t } = useTranslation('navigation')
    const { userKind = 'guest' } = useContext(UserKindContext)
    const { styles } = useStyles(stylesheet)

    const filterAnnouncements = useCallback(
        (
            announcements: AnnouncementFieldsFragment[]
        ): AnnouncementFieldsFragment[] => {
            const now = Date.now()
            return announcements
                .filter(
                    (announcement) =>
                        announcement?.platform?.includes(
                            Platform.OS.toUpperCase() as AppPlatform
                        ) &&
                        announcement?.userKind?.includes(
                            userKind?.toUpperCase() as UserKind
                        ) &&
                        new Date(announcement.startDateTime).getTime() < now &&
                        new Date(announcement.endDateTime).getTime() > now &&
                        !hiddenAnnouncements.includes(announcement.id)
                )
                .sort((a, b) => a.priority - b.priority)
        },
        [hiddenAnnouncements, userKind]
    )

    const filteredAnnouncements = useMemo(
        () => filterAnnouncements(data),
        [data, filterAnnouncements]
    )

    const handlePressClose = useCallback(
        (id: string) => () => {
            trackEvent('Announcement', { close: id })
            hideAnnouncement(id)
        },
        [hideAnnouncement]
    )

    const handlePressLink = useCallback(
        (url: string | null | undefined, id: string) => () => {
            if (url != null) {
                trackEvent('Announcement', { link: id })
                void Linking.openURL(url)
            }
        },
        []
    )

    if (filteredAnnouncements.length === 0) {
        return null
    }

    const { id, title, description, url } = filteredAnnouncements[0]

    return (
        <Pressable onPress={handlePressLink(url, id)} style={styles.card}>
            <View style={styles.titleView}>
                <PlatformIcon
                    ios={{ name: 'megaphone.fill', size: 18 }}
                    android={{ name: 'campaign', size: 24 }}
                    web={{ name: 'Megaphone', size: 24 }}
                />
                <Text style={styles.title}>
                    {/* @ts-expect-error cannot verify that title is a valid key */}
                    {title[i18n.language]}
                </Text>
                <Pressable onPress={handlePressClose(id)} hitSlop={10}>
                    <PlatformIcon
                        ios={{ name: 'xmark', size: 16 }}
                        android={{ name: 'close', size: 26 }}
                        web={{ name: 'X', size: 26 }}
                        style={styles.closeIcon}
                    />
                </Pressable>
            </View>
            <Text style={styles.description}>
                {/* @ts-expect-error cannot verify that description is a valid key */}
                {description[i18n.language]}
            </Text>
            {url != null && (
                <Text style={styles.footer}>
                    {t('cards.announcements.readMore')}
                </Text>
            )}
        </Pressable>
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

export default AnnouncementCard
