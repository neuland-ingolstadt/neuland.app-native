import MultiSectionRadio from '@/components/Elements/Food/FoodLanguageSection'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { getStatusBarStyle } from '@/utils/ui-utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import { useLocalSearchParams } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'

const PADDING = 12

export default function TimetableNotifications(): JSX.Element {
    const colors = useTheme().colors as Colors
    const [rawTimetable, setRawTimetable] = useState<FriendlyTimetableEntry[]>(
        []
    )

    const { t } = useTranslation('timetable')
    const { title } = useLocalSearchParams() as { title: string }
    const today = new Date()
    async function load(): Promise<void> {
        try {
            const timetable = await getFriendlyTimetable(today, true)
            const filteredTimetable = timetable.filter(
                (event) => event.shortName === title
            )

            setRawTimetable(filteredTimetable)
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    async function schedulePushNotification(
        lectureTitle: string,
        room: string,
        date: Date
    ): Promise<string> {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: lectureTitle,
                body: `starts in ${minsBefore} minutes at ${room}`,
            },
            trigger: date,
        })
        return id
    }

    function getFilteredTimetable(): FriendlyTimetableEntry[] {
        // filter out events that are not covered by the duration (e.g. if duration is 7 days, filter out events that are more than 7 days away)
        // use .date (2023-11-28)
        let filteredTimetable = rawTimetable.filter((event) => {
            const eventDate = event.startDate
            const today = new Date()
            return eventDate >= today
        })

        if (parseInt(duration) > 0) {
            const todayPlusDuration = new Date()
            todayPlusDuration.setDate(
                todayPlusDuration.getDate() + parseInt(duration)
            )
            filteredTimetable = filteredTimetable.filter((event) => {
                const eventDate = new Date(event.date)
                return eventDate <= todayPlusDuration
            })
        } else {
            filteredTimetable.sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            filteredTimetable = filteredTimetable.slice(0, 1)
        }

        return filteredTimetable
    }

    interface NotificationType {
        title: string
        minsBefore: string
        duration: Date
        ids: string[]
    }

    async function scheduleNotifications(): Promise<void> {
        const parsedMinsBefore = parseInt(minsBefore)
        const parsedDuration = parseInt(duration)

        const notificationPromises = filteredTimetable.map(async (event) => {
            const notificationDate = new Date(event.startDate)
            notificationDate.setMinutes(
                notificationDate.getMinutes() - parsedMinsBefore
            )
            return await schedulePushNotification(
                event.shortName,
                event.rooms[0],
                notificationDate
            )
        })

        const notificationIDs = await Promise.all(notificationPromises)

        const res = await AsyncStorage.getItem('notificationkskkm2')
        const updatedNotification: NotificationType = {
            title,
            minsBefore,
            duration: new Date(
                new Date().setDate(new Date().getDate() + parsedDuration)
            ),
            ids: notificationIDs,
        }

        if (res !== null) {
            let notifications: NotificationType[]
            try {
                notifications = JSON.parse(res)
            } catch (e) {
                console.error('Failed to parse notifications:', e)
                return
            }

            const updatedNotifications = notifications.map((notification) => {
                if (notification.title === title) {
                    notification.ids?.forEach((id) => {
                        Notifications.cancelScheduledNotificationAsync(
                            id
                        ).catch((e) => {
                            console.log(e)
                        })
                    })
                    return updatedNotification
                } else {
                    return notification
                }
            })

            if (
                !updatedNotifications.some(
                    (notification) => notification.title === title
                )
            ) {
                updatedNotifications.push(updatedNotification)
            }
            console.log(updatedNotifications)
            try {
                await AsyncStorage.setItem(
                    'notificationkskkm2',
                    JSON.stringify(updatedNotifications)
                )
            } catch (e) {
                console.error('Failed to set item:', e)
            }
        } else {
            try {
                await AsyncStorage.setItem(
                    'notificationkskkm2',
                    JSON.stringify([updatedNotification])
                )
            } catch (e) {
                console.error('Failed to set item:', e)
            }
        }
    }
    const minsBeforeElements = [
        { key: '5', title: '5 minutes' },
        { key: '15', title: '15 minutes' },
        { key: '30', title: '30 minutes' },
        { key: '60', title: '1 hour' },
    ]

    const durationElements = [
        { key: '0', title: 'Once' },
        { key: '7', title: 'For one week' },
        { key: '31', title: 'For one month' },
        { key: '365', title: 'For the semester' },
    ]

    const [minsBefore, setMinsBefore] = useState('5')
    const [duration, setDuration] = useState('0')

    const [filteredTimetable, setFilteredTimetable] = useState<
        FriendlyTimetableEntry[]
    >(getFilteredTimetable())
    useEffect(() => {
        setFilteredTimetable(getFilteredTimetable())
    }, [duration, minsBefore, rawTimetable])

    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                }}
            >
                <View
                    style={{
                        padding: PADDING,
                        backgroundColor: colors.background,
                    }}
                >
                    <Text
                        style={{
                            color: colors.labelColor,
                            fontSize: 16,
                            fontWeight: 'bold',
                            marginBottom: 8,
                        }}
                    >
                        {title}
                    </Text>
                    <Text style={{ color: colors.labelColor }}>
                        {
                            'Set up notifications for your timetable events. You can edit the settings later.'
                        }
                    </Text>
                </View>
                <SectionView title={t('notifications.sections.before.title')}>
                    <MultiSectionRadio
                        elements={minsBeforeElements}
                        selectedItem={minsBefore}
                        action={setMinsBefore}
                    />
                </SectionView>
                <SectionView
                    title={t('notifications.sections.duration.title')}
                    footer={`This will send you a total of ${filteredTimetable.length} notifications for the next ${duration} days.`}
                >
                    <MultiSectionRadio
                        elements={durationElements}
                        selectedItem={duration}
                        action={setDuration}
                    />
                </SectionView>

                <Pressable
                    onPress={() => {
                        void scheduleNotifications()
                    }}
                    style={({ pressed }) => [
                        { opacity: pressed ? 0.8 : 1 },
                        {
                            padding: 14,
                            backgroundColor: colors.card,
                            alignContent: 'center',
                            width: 100,
                            borderRadius: 8,
                            marginTop: 20,
                            alignSelf: 'center',
                        },
                    ]}
                >
                    <Text
                        style={{
                            color: colors.primary,
                            fontSize: 17,
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}
                    >
                        {'Confirm'}
                    </Text>
                </Pressable>
            </View>
        </>
    )
}
