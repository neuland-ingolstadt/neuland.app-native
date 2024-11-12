import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import clubs from '@/data/clubs.json'
import { type FormListSections } from '@/types/components'
import { type CLEvents } from '@/types/neuland-api'
import {
    formatFriendlyDateTime,
    formatFriendlyDateTimeRange,
} from '@/utils/date-utils'
import { trackEvent } from '@aptabase/react-native'
import { Buffer } from 'buffer/'
import {
    useFocusEffect,
    useLocalSearchParams,
    useNavigation,
} from 'expo-router'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Share, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function ClEventDetail(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { clEventEntry } = useLocalSearchParams<{ clEventEntry: string }>()
    const navigation = useNavigation()
    const clEvent: CLEvents | undefined =
        clEventEntry != null
            ? JSON.parse(Buffer.from(clEventEntry, 'base64').toString())
            : undefined
    const { t } = useTranslation('common')
    const isMultiDayEvent =
        clEvent?.begin != null &&
        clEvent?.end != null &&
        new Date(clEvent.begin).toDateString() !==
            new Date(clEvent.end).toDateString()

    const club = clubs.find((club) => club.club === clEvent?.organizer)
    const isWebsiteAvailable = club?.website != null && club?.website !== ''
    const isInstagramAvailable =
        club?.instagram != null && club?.instagram !== ''

    useFocusEffect(
        useCallback(() => {
            navigation.setOptions({
                headerRight: () => (
                    <ShareHeaderButton
                        onPress={async () => {
                            trackEvent('Share', {
                                type: 'clEvent',
                            })
                            await Share.share({
                                message: t('pages.event.shareMessage', {
                                    title: clEvent?.title,
                                    organizer: clEvent?.organizer,
                                    date: formatFriendlyDateTimeRange(
                                        new Date(
                                            clEvent?.begin as unknown as string
                                        ),
                                        new Date(
                                            clEvent?.end as unknown as string
                                        )
                                    ),
                                }),
                            })
                        }}
                    />
                ),
            })
        }, [])
    )
    const sections: FormListSections[] = [
        {
            header: 'Details',
            items: [
                ...(!isMultiDayEvent
                    ? [
                          {
                              title: t('pages.event.date'),
                              value: formatFriendlyDateTimeRange(
                                  new Date(clEvent?.begin as unknown as string),
                                  new Date(clEvent?.end as unknown as string)
                              ),
                          },
                      ]
                    : [
                          ...(clEvent?.begin != null
                              ? [
                                    {
                                        title: t('pages.event.begin'),
                                        value: formatFriendlyDateTime(
                                            new Date(
                                                clEvent.begin as unknown as string
                                            )
                                        ),
                                    },
                                ]
                              : []),
                          ...(clEvent?.end != null
                              ? [
                                    {
                                        title: t('pages.event.end'),
                                        value: formatFriendlyDateTime(
                                            new Date(
                                                clEvent.end as unknown as string
                                            )
                                        ),
                                    },
                                ]
                              : []),
                      ]),
                ...(clEvent?.location != null && clEvent?.location !== ''
                    ? [
                          {
                              title: t('pages.event.location'),
                              value: clEvent?.location,
                          },
                      ]
                    : []),

                {
                    title: t('pages.event.organizer'),
                    value: clEvent?.organizer,
                },
            ],
        },
        ...(club != null && (isWebsiteAvailable || isInstagramAvailable)
            ? [
                  {
                      header: 'Links',
                      items: [
                          isWebsiteAvailable
                              ? {
                                    title: 'Website',
                                    icon: linkIcon,
                                    onPress: () => {
                                        void Linking.openURL(club.website)
                                    },
                                }
                              : null,
                          isInstagramAvailable
                              ? {
                                    title: 'Instagram',
                                    icon: {
                                        ios: 'instagram',
                                        android: 'instagram',
                                        iosFallback: true,
                                    },
                                    onPress: () => {
                                        void Linking.openURL(club.instagram)
                                    },
                                }
                              : null,
                      ].filter((item) => item != null) as any,
                  },
              ]
            : []),
        ...(clEvent?.description != null && clEvent?.description !== ''
            ? [
                  {
                      header: t('pages.event.description'),
                      item: clEvent?.description,
                  },
              ]
            : []),
    ]

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.container}
        >
            <View style={styles.titleContainer}>
                <Text
                    style={styles.titleText}
                    allowFontScaling={true}
                    adjustsFontSizeToFit={true}
                    numberOfLines={2}
                >
                    {clEvent?.title}
                </Text>
            </View>
            <View style={styles.formList}>
                <FormList sections={sections} />
            </View>
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        gap: 12,
        paddingBottom: theme.margins.modalBottomMargin,
    },
    formList: {
        alignSelf: 'center',
        paddingBottom: 12,
        width: '100%',
    },
    page: {
        padding: theme.margins.page,
    },
    titleContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        paddingHorizontal: 5,
        paddingVertical: 10,
        width: '100%',
    },
    titleText: {
        color: theme.colors.text,
        fontSize: 18,
        textAlign: 'center',
    },
}))
