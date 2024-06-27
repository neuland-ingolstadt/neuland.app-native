import DetailsBody from '@/components/Elements/Timetable/DetailsBody'
import DetailsRow from '@/components/Elements/Timetable/DetailsRow'
import DetailsSymbol from '@/components/Elements/Timetable/DetailsSymbol'
import Separator from '@/components/Elements/Timetable/Separator'
import ShareCard from '@/components/Elements/Timetable/ShareCard'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { chevronIcon } from '@/components/Elements/Universal/Icon'
import ShareButton from '@/components/Elements/Universal/ShareButton'
import { type Colors } from '@/components/colors'
import { NotificationContext, RouteParamsContext } from '@/components/contexts'
import { useNotification } from '@/hooks'
import i18n, { type LanguageKey } from '@/localization/i18n'
import { type FormListSections, type SectionGroup } from '@/types/components'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import {
    getFriendlyTimetable,
    notificationAlert,
    scheduleLectureNotification,
} from '@/utils/timetable-utils'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import { trackEvent } from '@aptabase/react-native'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import * as Sharing from 'expo-sharing'
import moment from 'moment'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import ViewShot, { captureRef } from 'react-native-view-shot'

export default function TimetableDetails(): JSX.Element {
    const router = useRouter()
    const { updateRouteParams } = useContext(RouteParamsContext)
    const {
        timetableNotifications,
        updateTimetableNotifications,
        deleteTimetableNotifications,
    } = useContext(NotificationContext)

    const { hasPermission, askForPermission } = useNotification()

    const colors = useTheme().colors as Colors
    const { lecture } = useContext(RouteParamsContext)

    const { t } = useTranslation('timetable')

    if (lecture === null) {
        return <ErrorView title="Cannot display lecture" />
    }
    const today = new Date()

    const startDate = new Date(lecture.startDate)
    const endDate = new Date(lecture.endDate)

    const examSplit = lecture.exam.split('-').slice(-1)[0].trim()
    const exam = `${examSplit[0].toUpperCase()}${examSplit.slice(1)}`

    const shareRef = React.useRef<ViewShot>(null)
    const [rawTimetable, setRawTimetable] = useState<FriendlyTimetableEntry[]>(
        []
    )

    const [notificationsUpdating, setNotificationsUpdating] = useState(false)

    async function load(): Promise<void> {
        try {
            const timetable = await getFriendlyTimetable(today, true)
            const filteredTimetable = timetable.filter(
                (lecture) =>
                    lecture.shortName === lecture?.shortName &&
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
        if (lecture?.shortName === undefined) {
            throw new Error('Event is undefined')
        }
        setNotificationsUpdating(true)
        deleteTimetableNotifications(lecture.shortName)
        const notificationPromises = rawTimetable.map(async (lecture) => {
            const startDate = new Date(lecture.startDate)
            return await scheduleLectureNotification(
                lecture.name,
                lecture.rooms.join(', '),
                mins,
                startDate,
                t
            )
        })
        const notifications = await Promise.all(notificationPromises)
        const flatNotifications = notifications.flat()

        updateTimetableNotifications(
            lecture.shortName,
            flatNotifications,
            mins,
            i18n.language as LanguageKey
        )
        setNotificationsUpdating(false)
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
                dialogTitle: t('misc.share', { ns: 'common' }),
            })
        } catch (e) {
            console.log(e)
        }
    }

    const notification = timetableNotifications[lecture.shortName]
    const minsBefore = notification != null ? notification.mins : undefined

    interface HtmlItem {
        title: 'overview.goal' | 'overview.content' | 'overview.literature'
        html: string | null
    }

    const createItem = (
        titleKey: HtmlItem['title'],
        html: HtmlItem['html']
    ): SectionGroup | null => {
        if (html !== null) {
            return {
                title: t(titleKey),
                icon: chevronIcon,
                onPress: () => {
                    router.push('(timetable)/webView')
                    router.setParams({
                        title: t(titleKey),
                        html,
                    })
                },
            }
        }
        return null
    }

    const items = [
        createItem('overview.goal', lecture.goal),
        createItem('overview.content', lecture.contents),
        createItem('overview.literature', lecture.literature),
    ].filter(Boolean) as SectionGroup[]

    const detailsList: FormListSections[] = [
        {
            header: t('overview.title'),
            items,
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
                    value: lecture.studyGroup,
                },
                {
                    title: t('details.courseOfStudies'),
                    value: lecture.course,
                },
                {
                    title: t('details.weeklySemesterHours'),
                    value: lecture.sws,
                },
            ],
        },
    ]

    const actionSheetRef = useRef<ActionSheet>(null)

    /**
     * Shows the action sheet for setting up notifications
     * @returns {Promise<void>} A promise that resolves when the action sheet has been shown.
     */
    const showActionSheet = async (): Promise<void> => {
        let has = await hasPermission()
        if (!has) {
            has = await askForPermission()
        }

        if (!has) {
            notificationAlert(t)
            return
        }

        if (actionSheetRef.current != null) {
            actionSheetRef.current.show()
        }
    }

    const options = [
        { value: 5, label: t('notificatons.five') },
        { value: 15, label: t('notificatons.fifteen') },
        { value: 30, label: t('notificatons.thirty') },
        { value: 60, label: t('notificatons.sixty') },
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
            <ActionSheet
                ref={actionSheetRef}
                title={t('notificatons.title')}
                message={
                    notification == null
                        ? t('notificatons.description')
                        : t('notificatons.active', { mins: minsBefore })
                }
                options={filteredOptions.map((option) => option.label)}
                cancelButtonIndex={filteredOptions.length - 1}
                destructiveButtonIndex={notification != null ? 3 : -1}
                onPress={(index) => {
                    const selectedValue = filteredOptions[index].value
                    if (selectedValue > 0) {
                        void setupNotifications(selectedValue)
                    } else if (selectedValue === 0) {
                        deleteTimetableNotifications(lecture.shortName)
                    }
                    trackEvent('Notification', {
                        type: 'lecture',
                        minsBefore: selectedValue.toString(),
                    })
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
                                {lecture.name}
                            </Text>

                            <Text
                                style={{
                                    ...styles.eventShortName,
                                    color: colors.labelColor,
                                }}
                            >
                                {lecture.shortName}
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
                                    name: 'calendar_month',
                                    size: 24,
                                }}
                            />
                        </DetailsSymbol>

                        <DetailsBody>
                            <View style={styles.dateRow}>
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
                                                name: 'chevron_right',
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
                                        showActionSheet().catch((error) => {
                                            console.error(error)
                                        })
                                    }}
                                    style={styles.bellPressable}
                                    hitSlop={10}
                                >
                                    {!notificationsUpdating ? (
                                        <PlatformIcon
                                            color={colors.primary}
                                            ios={{
                                                name:
                                                    notification != null
                                                        ? 'bell.fill'
                                                        : 'bell',
                                                size:
                                                    minsBefore != null
                                                        ? 19
                                                        : 21,
                                            }}
                                            android={{
                                                name:
                                                    notification != null
                                                        ? 'notifications_active'
                                                        : 'notifications',
                                                size:
                                                    minsBefore != null
                                                        ? 20
                                                        : 25,
                                                variant: 'outlined',
                                            }}
                                        />
                                    ) : (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.primary}
                                        />
                                    )}
                                    {minsBefore != null && (
                                        <Text
                                            style={{
                                                ...styles.bellTime,
                                                color: colors.primary,
                                            }}
                                        >
                                            {notification.mins + ' min'}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>
                        </DetailsBody>
                    </DetailsRow>

                    <Separator />
                    {lecture.rooms.length > 0 ? (
                        <>
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
                                        {lecture.rooms.map((room, i) => (
                                            <Pressable
                                                key={i}
                                                onPress={() => {
                                                    router.navigate(
                                                        '(tabs)/map'
                                                    )
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
                        </>
                    ) : null}

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
                                {lecture.lecturer}
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
                        <ShareCard event={lecture} />
                    </ViewShot>
                </View>
            </ScrollView>
        </>
    )
}

export const styles = StyleSheet.create({
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
    bellPressable: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        minWidth: 40,
        height: '100%',
    },
    bellTime: {
        fontSize: 12,
    },
    dateRow: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingRight: 12,
    },
})
