import FormList from '@/components/Elements/Universal/FormList'
import { linkIcon } from '@/components/Elements/Universal/Icon'
import ShareButton from '@/components/Elements/Universal/ShareButton'
import { type Colors } from '@/components/colors'
import clubs from '@/data/clubs.json'
import { type FormListSections } from '@/types/components'
import { type CLEvents } from '@/types/neuland-api'
import {
    formatFriendlyDateTime,
    formatFriendlyDateTimeRange,
} from '@/utils/date-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import { Buffer } from 'buffer'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Linking,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function ClEventDetail(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { clEventEntry } = useLocalSearchParams<{ clEventEntry: string }>()
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
                                        ios: 'logo-instagram',
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
                      items: [
                          {
                              value: clEvent?.description,
                              layout: 'column' as any,
                          },
                      ],
                  },
              ]
            : []),
    ]

    return (
        <ScrollView
            style={styles.page}
            contentContainerStyle={styles.container}
        >
            <View
                style={[
                    styles.titleContainer,
                    { backgroundColor: colors.card },
                ]}
            >
                <Text
                    style={[styles.titleText, { color: colors.text }]}
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
            <ShareButton
                onPress={async () => {
                    trackEvent('Share', {
                        type: 'clEvent',
                    })
                    await Share.share({
                        message: t('pages.event.shareMessage', {
                            title: clEvent?.title,

                            organizer: clEvent?.organizer,
                            date: formatFriendlyDateTime(
                                clEvent?.begin as unknown as string
                            ),
                        }),
                    })
                }}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    container: {
        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
        gap: 12,
    },
    formList: {
        width: '100%',
        alignSelf: 'center',
        paddingBottom: 12,
    },
    titleContainer: {
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    titleText: {
        fontSize: 18,
        textAlign: 'center',
    },
})
