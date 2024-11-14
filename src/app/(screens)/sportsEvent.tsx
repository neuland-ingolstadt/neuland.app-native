import FormList from '@/components/Universal/FormList'
import ShareHeaderButton from '@/components/Universal/ShareHeaderButton'
import { type LanguageKey } from '@/localization/i18n'
import { type FormListSections } from '@/types/components'
import { type UniversitySports } from '@/types/neuland-api'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
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

export default function SportsEventDetail(): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const { sportsEventEntry } = useLocalSearchParams<{
        sportsEventEntry: string
    }>()
    const sportsEvent: UniversitySports | undefined =
        sportsEventEntry != null
            ? JSON.parse(Buffer.from(sportsEventEntry, 'base64').toString())
            : undefined
    const { t, i18n } = useTranslation('common')
    const navigation = useNavigation()
    useFocusEffect(
        useCallback(() => {
            if (sportsEvent == null) {
                return
            }
            navigation.setOptions({
                headerRight: () => (
                    <ShareHeaderButton
                        onPress={async () => {
                            trackEvent('Share', {
                                type: 'sportsEvent',
                            })
                            await Share.share({
                                message: t('pages.event.shareSports', {
                                    title: sportsEvent?.title[
                                        i18n.language as LanguageKey
                                    ],
                                    weekday: t(
                                        `dates.weekdays.${
                                            sportsEvent.weekday.toLowerCase() as Lowercase<
                                                UniversitySports['weekday']
                                            >
                                        }`
                                    ),
                                    time: formatFriendlyTimeRange(
                                        sportsEvent.startTime,
                                        sportsEvent.endTime
                                    ),
                                }),
                            })
                        }}
                    />
                ),
            })
        }, [])
    )

    if (sportsEvent == null) {
        return <></>
    }

    const isDescriptionAvailable =
        !((sportsEvent?.description.de ?? '') === '') ||
        !((sportsEvent?.description.en ?? '') === '')
    const isEmailAvailable = !((sportsEvent?.eMail ?? '') === '')
    const isInvitationLinkAvailable = sportsEvent?.invitationLink !== null

    const sections: FormListSections[] = [
        {
            header: 'Details',
            items: [
                {
                    title: t('pages.event.weekday'),
                    value: t(
                        `dates.weekdays.${
                            sportsEvent.weekday.toLowerCase() as Lowercase<
                                UniversitySports['weekday']
                            >
                        }`
                    ),
                },
                {
                    title: t('pages.event.time'),
                    value: formatFriendlyTimeRange(
                        sportsEvent.startTime,
                        sportsEvent.endTime
                    ),
                },
                {
                    title: 'Campus',
                    value: sportsEvent?.campus,
                },
                {
                    title: t('pages.event.location'),
                    value: sportsEvent.location,
                },
            ],
        },
        ...(isDescriptionAvailable
            ? [
                  {
                      header: t('pages.event.description'),
                      item:
                          sportsEvent?.description[
                              i18n.language as LanguageKey
                          ] ?? undefined,
                  },
              ]
            : []),
        {
            header: t('pages.event.contact'),
            items: [
                {
                    title: t('pages.event.registration'),
                    value: sportsEvent?.requiresRegistration
                        ? t('pages.event.required')
                        : t('pages.event.optional'),
                    icon: sportsEvent?.requiresRegistration
                        ? {
                              ios: 'exclamationmark.triangle.fill',
                              android: 'warning',
                          }
                        : {
                              ios: 'checkmark.seal',
                              android: 'new_releases',
                              androidVariant: 'outlined',
                          },
                    iconColor: styles.warning(
                        sportsEvent?.requiresRegistration ?? false
                    ).color,
                },
                ...(isEmailAvailable
                    ? [
                          {
                              title: t('pages.event.eMail'),
                              value: sportsEvent.eMail ?? undefined,
                              onPress: () => {
                                  void Linking.openURL(
                                      `mailto:${sportsEvent.eMail}`
                                  )
                              },
                              textColor: theme.colors.primary,
                          },
                      ]
                    : []),
                ...(isInvitationLinkAvailable
                    ? [
                          {
                              title: t('pages.event.invitationLink'),
                              value: 'Link',
                              onPress: () => {
                                  void Linking.openURL(
                                      sportsEvent.invitationLink ?? ''
                                  )
                              },
                              textColor: theme.colors.primary,
                          },
                      ]
                    : []),
            ],
        },
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
                    {sportsEvent?.title[i18n.language as LanguageKey]}
                </Text>
            </View>
            <View style={styles.formList}>
                <FormList sections={sections} />
            </View>
            {}
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        gap: 12,
        paddingBottom: theme.margins.bottomSafeArea,
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
    warning: (active: boolean) => ({
        color: active ? theme.colors.warning : theme.colors.success,
    }),
}))
