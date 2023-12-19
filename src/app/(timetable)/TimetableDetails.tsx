import DetailsBody from '@/components/Elements/Timetable/DetailsBody'
import DetailsRow from '@/components/Elements/Timetable/DetailsRow'
import DetailsSymbol from '@/components/Elements/Timetable/DetailsSymbol'
import Separator from '@/components/Elements/Timetable/Separator'
import ShareCard from '@/components/Elements/Timetable/ShareCard'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { chevronIcon } from '@/components/Elements/Universal/Icon'
import ShareButton from '@/components/Elements/Universal/ShareButton'
import { type Colors } from '@/components/colors'
import { NotificationContext, RouteParamsContext } from '@/components/provider'
import useNotification from '@/hooks/notifications'
import { type FormListSections } from '@/types/components'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import {
    getFriendlyTimetable,
    scheduleLectureNotification,
} from '@/utils/timetable-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { StatusBar } from 'expo-status-bar'
import moment from 'moment'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import ViewShot, { captureRef } from 'react-native-view-shot'

import { styles } from './details'

export default function TimetableDetails(): JSX.Element {
    const router = useRouter()
    const { updateRouteParams } = useContext(RouteParamsContext)
    const {
        timetableNotifications,
        updateTimetableNotifications,
        deleteTimetableNotifications,
    } = useContext(NotificationContext)

    const { askForPermission, hasPermission } = useNotification()

    const colors = useTheme().colors as Colors
    const { eventParam } = useLocalSearchParams<{ eventParam: string }>()
    const event: FriendlyTimetableEntry | undefined =
        eventParam != null ? JSON.parse(eventParam) : undefined
    const { t } = useTranslation('timetable')

    if (event == null) {
        throw new Error('Event is undefined')
    }
    const today = new Date()

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    const examSplit = event.exam.split('-').slice(-1)[0].trim()
    const exam = `${examSplit[0].toUpperCase()}${examSplit.slice(1)}`

    const shareRef = React.useRef<ViewShot>(null)
    const [rawTimetable, setRawTimetable] = useState<FriendlyTimetableEntry[]>(
        []
    )

    async function load(): Promise<void> {
        try {
            const timetable = await getFriendlyTimetable(today, true)
            const filteredTimetable = timetable.filter(
                (lecture) =>
                    lecture.shortName === event?.shortName &&
                    lecture.startDate >= today
            )

            setRawTimetable(filteredTimetable)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        void load()
    }, [])
    async function setupNotifications(mins: number): Promise<void> {
        if (event?.shortName === undefined) {
            throw new Error('Event is undefined')
        }
        const notificationPromises = rawTimetable.map(async (lecture) => {
            const startDate = new Date(lecture.startDate)
            const alertDate = new Date(startDate.getTime() - mins * 60000)
            return await scheduleLectureNotification(
                lecture.name,
                lecture.rooms.join(', '),
                mins,
                alertDate,
                t
            )
        })
        const notifications = await Promise.all(notificationPromises)
        const flatNotifications = notifications.flat()

        updateTimetableNotifications(event.shortName, flatNotifications, mins)
    }
    async function shareEvent(): Promise<void> {
        try {
            const uri = await captureRef(shareRef, {
                format: 'png',
                quality: 1,
            })
            trackEvent('Share', {
                type: 'lecture',
            })
            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: t('misc.share'),
            })
        } catch (e) {
            console.log(e)
        }
    }

    const notification = timetableNotifications[event.shortName]
    const minsBefore = notification != null ? notification.mins : undefined

    const detailsList: FormListSections[] = [
        {
            header: t('overview.title'),
            items: [
                {
                    title: 'Test Notification',
                    icon: chevronIcon,
                    onPress: () => {
                        void Notifications.scheduleNotificationAsync({
                            content: {
                                title: 'Test',
                                body: 'Test',
                            },
                            trigger: {
                                seconds: 5,
                            },
                        })
                    },
                },
                {
                    title: t('overview.goal'),
                    icon: chevronIcon,
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
                    icon: chevronIcon,
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
                    icon: chevronIcon,
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

    const actionSheetRef = useRef<ActionSheet>(null)

    const showActionSheet = async (): Promise<void> => {
        let has = await hasPermission()
        if (!has) {
            has = await askForPermission()
        }

        if (!has) {
            Alert.alert(
                t('notification.permission.title', { ns: 'common' }),
                t('notification.permission.description', { ns: 'common' }),
                [
                    {
                        text: t('misc.cancel', { ns: 'common' }),
                    },
                    {
                        text: t('notification.permission.button', {
                            ns: 'common',
                        }),
                        onPress: () => {
                            void Linking.openSettings()
                        },
                    },
                ]
            )
            return // Early return if permission is not granted
        }

        // If permission is granted, show the action sheet
        if (actionSheetRef.current != null) {
            actionSheetRef.current.show()
        }
    }

    const options = [
        { value: 5, label: t('notificatons.five') },
        { value: 15, label: t('notificatons.fifteen') },
        { value: 30, label: t('notificatons.thirty') },
    ]

    const filteredOptions = options.filter(
        (option) => option.value !== minsBefore
    )

    filteredOptions.push(
        ...(notification != null
            ? [{ value: 0, label: t('misc.disable', { ns: 'common' }) }]
            : []),
        { value: -1, label: t('misc.cancel', { ns: 'common' }) }
    )

    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <ActionSheet
                ref={actionSheetRef}
                title={t('notificatons.title')}
                message={
                    notification === null
                        ? t('notificatons.message')
                        : t('notificatons.active', { mins: minsBefore })
                }
                options={filteredOptions.map((option) => option.label)}
                cancelButtonIndex={filteredOptions.length - 1}
                destructiveButtonIndex={notification != null ? 2 : -1}
                onPress={(index) => {
                    const selectedValue = filteredOptions[index].value
                    if (selectedValue > 0) {
                        console.log('selected', selectedValue)
                        void setupNotifications(selectedValue)
                    } else if (selectedValue === 0) {
                        console.log('selected', selectedValue)
                        deleteTimetableNotifications(event.shortName)
                    }
                }}
            />
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
                            <PlatformIcon
                                color={colors.labelColor}
                                ios={{
                                    name: 'clock',
                                    size: 21,
                                }}
                                android={{
                                    name: 'calendar-month',
                                    size: 24,
                                }}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                    paddingRight: 12,
                                }}
                            >
                                <View>
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
                                            {formatFriendlyTime(startDate)}
                                        </Text>

                                        <PlatformIcon
                                            color={colors.labelColor}
                                            ios={{
                                                name: 'chevron.forward',
                                                size: 12,
                                            }}
                                            android={{
                                                name: 'chevron-right',
                                                size: 16,
                                            }}
                                        />

                                        <Text
                                            style={{
                                                ...styles.text2,
                                                color: colors.text,
                                            }}
                                        >
                                            {formatFriendlyTime(endDate)}
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
                                </View>
                                <Pressable
                                    onPress={() => {
                                        void showActionSheet()
                                    }}
                                    hitSlop={10}
                                >
                                    <PlatformIcon
                                        color={colors.primary}
                                        ios={{
                                            name:
                                                notification != null
                                                    ? 'bell.fill'
                                                    : 'bell',
                                            size: 21,
                                        }}
                                        android={{
                                            name: 'bell',
                                            size: 24,
                                        }}
                                    />
                                </Pressable>
                            </View>
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />

                    <DetailsRow>
                        <DetailsSymbol>
                            <PlatformIcon
                                color={colors.labelColor}
                                ios={{
                                    name: 'mappin.and.ellipse',
                                    size: 21,
                                }}
                                android={{
                                    name: 'place',
                                    size: 24,
                                }}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <View style={styles.roomContainer}>
                                {event.rooms.map((room, i) => (
                                    <Pressable
                                        key={i}
                                        onPress={() => {
                                            router.push('(tabs)/map')
                                            updateRouteParams(room)
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
                            </View>
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />

                    <DetailsRow>
                        <DetailsSymbol>
                            <PlatformIcon
                                color={colors.labelColor}
                                ios={{
                                    name: 'person',
                                    size: 21,
                                }}
                                android={{
                                    name: 'person',
                                    size: 24,
                                }}
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

                        <ShareButton
                            onPress={async () => {
                                await shareEvent()
                            }}
                        />
                    </View>

                    <ViewShot ref={shareRef} style={styles.viewShot}>
                        <ShareCard event={event} />
                    </ViewShot>
                </View>
            </ScrollView>
        </>
    )
}
