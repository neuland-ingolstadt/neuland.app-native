import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
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
import { Pressable, ScrollView, Text, View } from 'react-native'

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
            header: t('details.title'),
            items: [
                {
                    title: t('notes.goal'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(timetable)/notes')
                        router.setParams({
                            title: t('notes.goal'),
                            html: event.goal ?? '',
                        })
                    },
                },
                {
                    title: t('notes.content'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(timetable)/notes')
                        router.setParams({
                            title: t('notes.content'),
                            html: event.contents ?? '',
                        })
                    },
                },
                {
                    title: t('notes.literature'),
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(timetable)/notes')
                        router.setParams({
                            title: t('notes.literature'),
                            html: event.literature ?? '',
                        })
                    },
                },
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
                <View
                    style={{
                        display: 'flex',
                        padding: 12,
                    }}
                >
                    <DetailsRow>
                        <DetailsSymbol>
                            <View
                                style={{
                                    width: 15,
                                    aspectRatio: 1,
                                    borderRadius: 9999,
                                    backgroundColor: colors.primary,
                                }}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <Text
                                style={{
                                    color: colors.text,
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                }}
                            >
                                {event.name}
                            </Text>

                            <Text
                                style={{
                                    color: colors.labelColor,
                                    fontSize: 14,
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
                                    color: colors.text,
                                    fontSize: 18,
                                }}
                            >
                                {startDate.toLocaleDateString(i18n.language, {
                                    weekday: 'long',
                                })}
                            </Text>

                            <View
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 4,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontSize: 14,
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
                                        color: colors.text,
                                        fontSize: 14,
                                    }}
                                >
                                    {endDate.toLocaleTimeString(i18n.language, {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>

                                <Text
                                    style={{
                                        color: colors.labelColor,
                                        fontSize: 14,
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
                                            color: colors.primary,
                                            fontSize: 18,
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
                                    color: colors.text,
                                    fontSize: 18,
                                }}
                            >
                                {event.lecturer}
                            </Text>
                        </DetailsBody>
                    </DetailsRow>
                    <View
                        style={{
                            marginTop: 24,
                        }}
                    >
                        <FormList sections={detailsList} />
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

function DetailsRow({ children }: { children: JSX.Element[] }): JSX.Element {
    return (
        <View
            style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 12,
            }}
        >
            {children}
        </View>
    )
}

function DetailsSymbol({ children }: { children: JSX.Element }): JSX.Element {
    return (
        <View
            style={{
                display: 'flex',
                flexDirection: 'row',
                width: 50,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {children}
        </View>
    )
}

function DetailsBody({
    children,
}: {
    children: JSX.Element | JSX.Element[]
}): JSX.Element {
    return (
        <View
            style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: 4,
            }}
        >
            {children}
        </View>
    )
}
function Separator(): JSX.Element {
    const colors = useTheme().colors as Colors

    return (
        <View
            style={{
                marginLeft: 50 + 12,
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 12,
            }}
        />
    )
}
