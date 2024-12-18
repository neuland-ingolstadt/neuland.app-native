import FormList from '@/components/Universal/FormList'
import { linkIcon } from '@/components/Universal/Icon'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import useCLParamsStore from '@/hooks/useCLParamsStore'
import { type LanguageKey } from '@/localization/i18n'
import { type FormListSections } from '@/types/components'
import {
    formatFriendlyDateTime,
    formatFriendlyDateTimeRange,
} from '@/utils/date-utils'
import { isValidRoom } from '@/utils/timetable-utils'
import { trackEvent } from '@aptabase/react-native'
import { Redirect, useFocusEffect, useNavigation } from 'expo-router'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Share, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function ClEventDetail(): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const navigation = useNavigation()
    const clEvent = useCLParamsStore((state) => state.selectedClEvent)

    const { t, i18n } = useTranslation('common')
    const isMultiDayEvent =
        clEvent?.startDateTime != null &&
        clEvent?.endDateTime != null &&
        new Date(clEvent.startDateTime).toDateString() !==
            new Date(clEvent.endDateTime).toDateString()

    const isWebsiteAvailable = clEvent?.host.website != null
    const isInstagramAvailable = clEvent?.host.instagram != null

    const dateRange = formatFriendlyDateTimeRange(
        clEvent?.startDateTime != null ? new Date(clEvent.startDateTime) : null,
        clEvent?.endDateTime != null ? new Date(clEvent.endDateTime) : null
    )
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
                                    title: clEvent?.titles[
                                        i18n.language as LanguageKey
                                    ],
                                    organizer: clEvent?.host.name,
                                    date: dateRange,
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
                              value: dateRange,
                          },
                      ]
                    : [
                          ...(clEvent?.startDateTime != null
                              ? [
                                    {
                                        title: t('pages.event.begin'),
                                        value: formatFriendlyDateTime(
                                            new Date(clEvent.startDateTime)
                                        ),
                                    },
                                ]
                              : []),
                          ...(clEvent?.endDateTime != null
                              ? [
                                    {
                                        title: t('pages.event.end'),
                                        value: formatFriendlyDateTime(
                                            new Date(clEvent.endDateTime)
                                        ),
                                    },
                                ]
                              : []),
                      ]),
                ...(clEvent?.location != null && clEvent?.location !== ''
                    ? [
                          Object.assign(
                              {
                                  title: t('pages.event.location'),
                                  value: clEvent?.location,
                              },
                              isValidRoom(clEvent.location)
                                  ? {
                                        onPress: () => {
                                            router.navigate({
                                                pathname: '/map',
                                                params: {
                                                    room: clEvent?.location,
                                                },
                                            })
                                        },
                                        textColor: theme.colors.primary,
                                    }
                                  : {}
                          ),
                      ]
                    : []),

                {
                    title: t('pages.event.organizer'),
                    value: clEvent?.host.name,
                },
            ],
        },
        ...(isWebsiteAvailable || isInstagramAvailable
            ? [
                  {
                      header: 'Links',
                      items: [
                          isWebsiteAvailable
                              ? {
                                    title: 'Website',
                                    icon: linkIcon,
                                    onPress: () => {
                                        void Linking.openURL(
                                            clEvent.host.website
                                        )
                                    },
                                }
                              : null,
                          isInstagramAvailable
                              ? {
                                    title: 'Instagram',
                                    icon: {
                                        ios: 'instagram',
                                        android: 'instagram',
                                        web: 'Instagram',
                                        iosFallback: true,
                                    },
                                    onPress: () => {
                                        void Linking.openURL(
                                            clEvent.host.instagram
                                        )
                                    },
                                }
                              : null,
                      ].filter((item) => item != null) as any,
                  },
              ]
            : []),
        ...(clEvent?.descriptions != null
            ? [
                  {
                      header: t('pages.event.description'),
                      item: clEvent?.descriptions[i18n.language as LanguageKey],
                  },
              ]
            : []),
    ]

    if (clEvent == null) {
        return <Redirect href={'/clEvents'} />
    }
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
                    {clEvent?.titles[i18n.language as LanguageKey]}
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
