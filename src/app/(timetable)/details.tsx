import DetailsBody from '@/components/Elements/Timetable/DetailsBody'
import DetailsRow from '@/components/Elements/Timetable/DetailsRow'
import DetailsSymbol from '@/components/Elements/Timetable/DetailsSymbol'
import Separator from '@/components/Elements/Timetable/Separator'
import ShareCard from '@/components/Elements/Timetable/ShareCard'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { chevronIcon } from '@/components/Elements/Universal/Icon'
import ShareButton from '@/components/Elements/Universal/ShareButton'
import { type Colors } from '@/components/colors'
import { RouteParamsContext } from '@/components/provider'
import { type FormListSections } from '@/types/components'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import { StatusBar } from 'expo-status-bar'
import moment from 'moment'
import React, { useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import ViewShot, { captureRef } from 'react-native-view-shot'

export default function TimetableDetails(): JSX.Element {
    const router = useRouter()
    const { updateRouteParams } = useContext(RouteParamsContext)

    const colors = useTheme().colors as Colors
    const { eventParam } = useLocalSearchParams<{ eventParam: string }>()
    const event: FriendlyTimetableEntry | undefined =
        eventParam != null ? JSON.parse(eventParam) : undefined
    const { t } = useTranslation('timetable')

    if (event == null) {
        throw new Error('Event is undefined')
    }

    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)

    const examSplit = event.exam.split('-').slice(-1)[0].trim()
    const exam = `${examSplit[0].toUpperCase()}${examSplit.slice(1)}`

    const shareRef = React.useRef<ViewShot>(null)

    async function schedulePushNotification(): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Web Technologies in G069',
                body: 'Lecture starts in 15 minutes!',
                data: { data: 'goes here' },
            },
            trigger: { seconds: 5 },
        })
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

    const detailsList: FormListSections[] = [
        {
            header: t('overview.title'),
            items: [
                {
                    title: 'Test Notification',
                    icon: {
                        ios: 'bell',
                        android: 'bell',
                    },
                    onPress: () => {
                        void schedulePushNotification()
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

    const actionSheetRef = useRef()

    const showActionSheet = (): void => {
        actionSheetRef.current.show()
    }
    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <ActionSheet
                ref={actionSheetRef}
                title={t('notificatons.title')}
                message={t('notificatons.description')}
                options={[
                    t('notificatons.five'),
                    t('notificatons.fifteen'),
                    t('notificatons.thirty'),
                    t('misc.cancel', { ns: 'common' }),
                ]}
                cancelButtonIndex={3}
                onPress={(index) => {
                    if (index === 0) {
                        void schedulePushNotification()
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
                                    onPress={showActionSheet}
                                    hitSlop={10}
                                >
                                    <PlatformIcon
                                        color={colors.primary}
                                        ios={{
                                            name: 'bell',
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

const styles = StyleSheet.create({
    page: {
        display: 'flex',
        padding: PAGE_PADDING,
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
    roomContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 4,
    },
    viewShot: {
        zIndex: -1,
        position: 'absolute',
        transform: [{ translateX: -1000 }],
    },
})
