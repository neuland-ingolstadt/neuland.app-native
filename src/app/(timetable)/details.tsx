import FormList from '@/components/Elements/Universal/FormList'
import ShareButton from '@/components/Elements/Universal/ShareButton'
import { type Colors } from '@/stores/colors'
import { formatFriendlyDate } from '@/utils/date-utils'
import { type FriendlyTimetableEntry } from '@/utils/timetable-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { type FormListSections } from '@customTypes/components'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import moment from 'moment'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function TimetableDetails(): JSX.Element {
    const router = useRouter()

    const colors = useTheme().colors as Colors
    const { eventParam } = useLocalSearchParams<{ eventParam: string }>()
    const event: FriendlyTimetableEntry | undefined =
        eventParam != null ? JSON.parse(eventParam) : undefined
    const { t, i18n } = useTranslation('timetable')

    if (event == null) {
        throw new Error('Event is undefined')
    }

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    const examSplit = event.exam.split('-').slice(-1)[0].trim()
    const exam = `${examSplit[0].toUpperCase()}${examSplit.slice(1)}`

    const detailsList: FormListSections[] = [
        {
            header: t('overview.title'),
            items: [
                {
                    title: t('overview.goal'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(timetable)/webView')
                        router.setParams({
                            title: t('overview.goal'),
                            html: event.goal ?? '',
                        })
                    },
                },
                {
                    title: t('overview.content'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(timetable)/webView')
                        router.setParams({
                            title: t('overview.content'),
                            html: event.contents ?? '',
                        })
                    },
                },
                {
                    title: t('overview.literature'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(timetable)/webView')
                        router.setParams({
                            title: t('overview.literature'),
                            html: event.literature ?? '',
                        })
                    },
                },
            ],
        },
        {
            header: t('details.title'),
            items: [
                {
                    title: t('details.exam'),
                    value: exam,
                    layout: 'column',
                },
                {
                    title: t('details.studyGroup'),
                    value: event.studyGroup,
                },
                {
                    title: t('details.courseOfStudies'),
                    value: event.course,
                },
                {
                    title: t('details.weeklySemesterHours'),
                    value: event.sws,
                },
            ],
        },
    ]

    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <ScrollView>
                <View style={styles.page}>
                    <DetailsRow>
                        <DetailsSymbol>
                            <View
                                style={{
                                    ...styles.eventColorCircle,
                                    backgroundColor: colors.primary,
                                }}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <Text
                                style={{
                                    ...styles.eventName,
                                    color: colors.text,
                                }}
                            >
                                {event.name}
                            </Text>

                            <Text
                                style={{
                                    ...styles.eventShortName,
                                    color: colors.labelColor,
                                }}
                            >
                                {event.shortName}
                            </Text>
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />

                    <DetailsRow>
                        <DetailsSymbol>
                            <Ionicons
                                name="time-outline"
                                size={24}
                                color={colors.labelColor}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <Text
                                style={{
                                    ...styles.text1,
                                    color: colors.text,
                                }}
                            >
                                {formatFriendlyDate(startDate, {
                                    weekday: 'long',
                                    relative: false,
                                })}
                            </Text>

                            <View style={styles.detailsContainer}>
                                <Text
                                    style={{
                                        ...styles.text2,
                                        color: colors.text,
                                    }}
                                >
                                    {startDate.toLocaleTimeString(
                                        i18n.language,
                                        {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }
                                    )}
                                </Text>

                                <Ionicons
                                    name="chevron-forward-outline"
                                    size={16}
                                    color={colors.labelColor}
                                />

                                <Text
                                    style={{
                                        ...styles.text2,
                                        color: colors.text,
                                    }}
                                >
                                    {endDate.toLocaleTimeString(i18n.language, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>

                                <Text
                                    style={{
                                        ...styles.text2,
                                        color: colors.labelColor,
                                    }}
                                >
                                    {`(${moment(endDate).diff(
                                        moment(startDate),
                                        'minutes'
                                    )} ${t('time.minutes')})`}
                                </Text>
                            </View>
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />

                    <DetailsRow>
                        <DetailsSymbol>
                            <Ionicons
                                name="location-outline"
                                size={24}
                                color={colors.labelColor}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            {event.rooms.map((room, i) => (
                                <Pressable
                                    key={i}
                                    onPress={() => {
                                        router.push('(tabs)/map')
                                        router.setParams({
                                            q: room,
                                            h: 'true',
                                        })
                                    }}
                                >
                                    <Text
                                        style={{
                                            ...styles.text1,
                                            color: colors.primary,
                                        }}
                                    >
                                        {room}
                                    </Text>
                                </Pressable>
                            ))}
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />

                    <DetailsRow>
                        <DetailsSymbol>
                            <Ionicons
                                name="people-outline"
                                size={24}
                                color={colors.labelColor}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <Text
                                style={{
                                    ...styles.text1,
                                    color: colors.text,
                                }}
                            >
                                {event.lecturer}
                            </Text>
                        </DetailsBody>
                    </DetailsRow>
                    <View style={styles.formListContainer}>
                        <FormList sections={detailsList} />

                        <ShareButton message="test" />
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

function DetailsRow({ children }: { children: JSX.Element[] }): JSX.Element {
    return <View style={styles.detailsRow}>{children}</View>
}

function DetailsSymbol({ children }: { children: JSX.Element }): JSX.Element {
    return <View style={styles.detailsSymbol}>{children}</View>
}

function DetailsBody({
    children,
}: {
    children: JSX.Element | JSX.Element[]
}): JSX.Element {
    return <View style={styles.detailsBody}>{children}</View>
}

function Separator(): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <View
            style={{
                ...styles.separator,
                backgroundColor: colors.border,
            }}
        />
    )
}

const styles = StyleSheet.create({
    page: {
        display: 'flex',
        padding: 12,
    },
    eventColorCircle: {
        width: 15,
        aspectRatio: 1,
        borderRadius: 9999,
    },
    eventName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    eventShortName: {
        fontSize: 14,
    },
    text1: {
        fontSize: 18,
    },
    text2: {
        fontSize: 14,
    },
    detailsContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    formListContainer: {
        marginTop: 24,
        gap: 12,
    },
    detailsRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
    },
    detailsSymbol: {
        display: 'flex',
        flexDirection: 'row',
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsBody: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexShrink: 1,
        gap: 4,
    },
    separator: {
        marginLeft: 50 + 12,
        height: 1,
        marginVertical: 12,
    },
})
