import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/components/colors'
import { type LanguageKey } from '@/localization/i18n'
import { type FormListSections } from '@/types/components'
import { type UniversitySports } from '@/types/neuland-api'
import { formatFriendlyTimeRange } from '@/utils/date-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { Buffer } from 'buffer'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function SportsEventDetail(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { sportsEventEntry } = useLocalSearchParams<{
        sportsEventEntry: string
    }>()
    const sportsEvent: UniversitySports | undefined =
        sportsEventEntry != null
            ? JSON.parse(Buffer.from(sportsEventEntry, 'base64').toString())
            : undefined
    const { t, i18n } = useTranslation('common')

    if (sportsEvent == null) {
        return <></>
    }

    const isDescriptionAvailable =
        sportsEvent?.description.de != null ||
        sportsEvent?.description.en != null
    const isEmailAvailable =
        sportsEvent?.eMail != null || sportsEvent?.eMail !== ''
    const isInvitationLinkAvailable = sportsEvent?.invitationLink !== null

    const sections: FormListSections[] = [
        {
            header: 'Details',
            items: [
                {
                    title: t('pages.event.date'),
                    value: formatFriendlyTimeRange(
                        sportsEvent.startTime,
                        sportsEvent.endTime
                    ),
                },
                {
                    title: t('pages.event.location'),
                    value: sportsEvent.location,
                },
                {
                    title: 'Campus',
                    value: sportsEvent?.campus,
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
            header: 'Contact',
            items: [
                {
                    title: t('pages.event.registration'),
                    value: sportsEvent?.requiresRegistration
                        ? t('misc.true')
                        : t('misc.false'),
                },
                ...(isEmailAvailable
                    ? [
                          {
                              title: t('pages.event.eMail'),
                              value: sportsEvent.eMail ?? undefined,
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
