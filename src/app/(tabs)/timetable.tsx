import TimetableList from '@/components/Elements/Timetable/TimetableList'
import TimetableWeek from '@/components/Elements/Timetable/TimetableWeek'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import {
    NotificationContext,
    TimetableContext,
    UserKindContext,
} from '@/components/provider'
import { useRefreshByUser } from '@/hooks'
import { USER_GUEST } from '@/hooks/contexts/userKind'
import i18n, { type LanguageKey } from '@/localization/i18n'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { guestError, networkError } from '@/utils/api-utils'
import {
    generateKey,
    getFriendlyTimetable,
    scheduleLectureNotification,
} from '@/utils/timetable-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    InteractionManager,
    Linking,
    StyleSheet,
    View,
} from 'react-native'

export interface ITimetableViewProps {
    friendlyTimetable: FriendlyTimetableEntry[]
}

export type CalendarMode = '3days' | 'list'

export default function TimetableScreen(): JSX.Element {
    const theme = useTheme()
    const colors = theme.colors as Colors

    const { timetableMode } = useContext(TimetableContext)

    const { t } = useTranslation(['timetable'])

    const {
        timetableNotifications,
        updateTimetableNotifications,
        removeNotification,
    } = useContext(NotificationContext)
    const { userKind } = useContext(UserKindContext)
    const loadTimetable = async (): Promise<FriendlyTimetableEntry[]> => {
        const timetable = await getFriendlyTimetable(new Date(), true)
        if (timetable.length === 0) {
            throw new Error('Timetable is empty')
        }
        return timetable
    }

    const {
        data: timetable,
        error,
        isLoading,
        isPaused,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ['timetable', userKind],
        queryFn: loadTimetable,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        retry(failureCount, error) {
            const ignoreErrors = [
                '"Time table does not exist" (-202)',
                'Timetable is empty',
            ]
            if (ignoreErrors.includes(error?.message)) {
                return false
            }
            return failureCount < 3
        },
        enabled: userKind !== USER_GUEST,
    })

    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)
    useEffect(() => {
        const updateNotifications = async (): Promise<void> => {
            if (timetable === undefined || timetable.length === 0) return
            console.log('Updating notifications')
            await updateAllNotifications()
            console.log('Updated notifications')
        }

        const timeoutId = setTimeout(() => {
            void InteractionManager.runAfterInteractions(() => {
                void updateNotifications()
            })
        }, 1000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [timetable, i18n.language])

    async function updateAllNotifications(): Promise<void> {
        if (timetable === undefined) return
        const setupLectures = Object.keys(timetableNotifications)
        if (setupLectures.length === 0) return
        const configuredLanguage =
            timetableNotifications[setupLectures[0]].language

        const today = new Date()

        const filteredTimetable = timetable.filter((lecture) => {
            const lectureDate = new Date(lecture.startDate)
            return lectureDate > today
        })

        const setupTimetable = filteredTimetable.filter((lecture) =>
            setupLectures.includes(lecture.shortName)
        )

        if (configuredLanguage !== i18n.language) {
            await updateNotificationLanguage(setupLectures, setupTimetable)
            return
        }

        // Create a hash map of new lectures
        const newLecturesMap = setupTimetable.reduce<
            Record<string, (typeof filteredTimetable)[0]>
        >((map, lecture) => {
            const key = generateKey(
                lecture.shortName,
                lecture.startDate,
                lecture.rooms[0]
            )
            map[key] = lecture
            return map
        }, {})

        setupLectures.forEach((lectureName) => {
            const oldLectures = timetableNotifications[lectureName].elements

            oldLectures.forEach((oldLecture) => {
                const key = generateKey(
                    lectureName,
                    oldLecture.startDateTime,
                    oldLecture.room
                )
                const matchingNewLecture = newLecturesMap[key]

                if (matchingNewLecture !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete newLecturesMap[key]
                } else {
                    // Remove the old lecture from the notification
                    removeNotification(oldLecture.id, lectureName)
                }
            })
        })

        const newLectureGroups = Object.values(newLecturesMap).reduce<
            Record<string, typeof filteredTimetable>
        >((map, lecture) => {
            const key = lecture.shortName
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!map[key]) {
                map[key] = []
            }
            map[key].push(lecture)
            return map
        }, {})

        const promises = Object.entries(newLectureGroups).map(
            async ([lectureName, lectures]) => {
                const minsBeforeLecture = getMinsBeforeLecture(lectureName)
                const notificationPromises = Object.values(lectures).map(
                    async (lecture) => {
                        return await scheduleLectureNotification(
                            lecture.name,
                            lecture.rooms.join(', '),
                            getMinsBeforeLecture(lectureName),
                            lecture.startDate,
                            t
                        )
                    }
                )

                const notifications = await Promise.all(notificationPromises)
                const flatNotifications = notifications.flat()

                updateTimetableNotifications(
                    lectureName,
                    flatNotifications,
                    minsBeforeLecture,
                    i18n.language as LanguageKey
                )
            }
        )

        await Promise.all(promises)
    }

    async function updateNotificationLanguage(
        setupLectures: string[],
        setupTimetable: FriendlyTimetableEntry[]
    ): Promise<void> {
        const promises = setupLectures.map(async (lectureName) => {
            const mins = getMinsBeforeLecture(lectureName)
            const notificationPromises = Object.values(setupTimetable)
                .filter((lecture) => lecture.shortName === lectureName)
                .map(async (lecture) => {
                    const startDate = new Date(lecture.startDate)
                    const alertDate = new Date(
                        startDate.getTime() - mins * 60000
                    )
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

            updateTimetableNotifications(
                lectureName,
                flatNotifications,
                mins,
                i18n.language as LanguageKey
            )
        })

        await Promise.all(promises)
    }

    function getMinsBeforeLecture(name: string): number {
        return timetableNotifications[name].mins
    }

    const LoadingView = (): JSX.Element => {
        return (
            <View
                style={{
                    backgroundColor: colors.background,
                    ...styles.loadingView,
                }}
            >
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        )
    }

    const TempList = (): JSX.Element => {
        if (isLoading) return <LoadingView />
        else if (isSuccess && timetable !== undefined) {
            if (timetableMode === 'list') {
                return <TimetableList friendlyTimetable={timetable} />
            } else {
                return <TimetableWeek friendlyTimetable={timetable} />
            }
        } else {
            if (isPaused && !isSuccess) {
                return (
                    <ErrorView
                        title={networkError}
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                )
            } else if (
                error?.message === '"Time table does not exist" (-202)' ||
                error?.message === 'Timetable is empty'
            ) {
                return (
                    <ErrorView
                        title={
                            error.message !== 'Timetable is empty'
                                ? t('error.empty.title')
                                : t('error.empty.title2')
                        }
                        message={t('error.empty.message')}
                        buttonText={t('error.empty.button')}
                        icon={{
                            ios: 'calendar.badge.exclamationmark',
                            android: 'edit_calendar',
                        }}
                        onButtonPress={() => {
                            void Linking.openURL('https://hiplan.thi.de/')
                        }}
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                )
            } else if (userKind === USER_GUEST) {
                return <ErrorView title={guestError} />
            } else {
                return (
                    <ErrorView
                        title={
                            error?.message ?? t('error.title', { ns: 'common' })
                        }
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                )
            }
        }
    }

    const [isPageOpen, setIsPageOpen] = useState(false)

    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    return (
        <WorkaroundStack
            name={t('navigation.timetable', { ns: 'navigation' })}
            titleKey={t('navigation.timetable', { ns: 'navigation' })}
            component={isPageOpen ? TempList : () => <></>}
        />
    )
}

const styles = StyleSheet.create({
    loadingView: {
        position: 'absolute',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
})
