import TimetableList from '@/components/Elements/Timetable/TimetableList'
import TimetableWeek from '@/components/Elements/Timetable/TimetableWeek'
import { ErrorView } from '@/components/Elements/Universal/ErrorPage'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { NotificationContext, TimetableContext } from '@/components/provider'
import i18n, { type LanguageKey } from '@/localization/i18n'
import { type FriendlyTimetableEntry } from '@/types/utils'
import {
    generateKey,
    getFriendlyTimetable,
    scheduleLectureNotification,
} from '@/utils/timetable-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

export interface ITimetableViewProps {
    friendlyTimetable: FriendlyTimetableEntry[]
}

export type CalendarMode = '3days' | 'list'

export default function TimetableScreen(): JSX.Element {
    const theme = useTheme()
    const colors = theme.colors as Colors

    const { timetableMode } = useContext(TimetableContext)

    const { t } = useTranslation(['navigation', 'timetable'])

    const [timetable, setTimetable] = useState<FriendlyTimetableEntry[]>([])
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const {
        timetableNotifications,
        updateTimetableNotifications,
        removeNotification,
    } = useContext(NotificationContext)
    useEffect(() => {
        const loadTimetable = async (): Promise<void> => {
            const timetable = await getFriendlyTimetable(new Date(), true)
            setTimetable(timetable)
            setLoadingState(LoadingState.LOADED)
        }

        void loadTimetable()
    }, [])

    async function updateAllNotifications(): Promise<void> {
        console.log('updateAllNotifications', timetableNotifications)

        // check if the language has changed
        // if it has, remove all notifications and reschedule them

        const setupLectures = Object.keys(timetableNotifications)
        if (setupLectures.length === 0) return
        const configuredLanguage =
            timetableNotifications[setupLectures[0]].language

        const today = new Date()

        // remove the past events fromt the timetable const
        const filteredTimetable = timetable.filter((lecture) => {
            const lectureDate = new Date(lecture.startDate)
            return lectureDate > today
        })

        // Filter the timetable to only include lectures in setupLectures
        const setupTimetable = filteredTimetable.filter((lecture) =>
            setupLectures.includes(lecture.shortName)
        )
        //  console.log('setupTimetable:', setupTimetable)
        if (configuredLanguage !== i18n.language) {
            console.log('language changed')
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
            // console.log('new key:', key)
            map[key] = lecture
            return map
        }, {})
        //  console.log('newLecturesMap:', newLecturesMap)

        setupLectures.forEach((lectureName) => {
            const oldLectures = timetableNotifications[lectureName].elements

            oldLectures.forEach((oldLecture) => {
                const key = generateKey(
                    lectureName,
                    oldLecture.startDateTime,
                    oldLecture.room
                )
                // console.log('old key:', key)
                const matchingNewLecture = newLecturesMap[key]

                if (matchingNewLecture !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete newLecturesMap[key]
                } else {
                    console.log(
                        'No match found for:',
                        lectureName,
                        JSON.stringify(oldLecture)
                    )
                    // Remove the old lecture from the notification
                    console.log('Deleting:', oldLecture.id)
                    removeNotification(oldLecture.id, lectureName)
                }
            })
        })

        console.log(
            'found n new lectures:',
            Object.values(newLecturesMap).length
        )

        const newLectureGroups = Object.values(newLecturesMap).reduce<
            Record<string, typeof newLecturesMap>
        >((map, lecture) => {
            const key = lecture.shortName
            // @ts-expect-error no types
            map[key].push(lecture)
            return map
        }, {})

        const promises = Object.entries(newLectureGroups).map(
            async ([lectureName, lectures]) => {
                const minsBeforeLecture = getMinsBeforeLecture(lectureName)
                console.log('minsBeforeLecture:', minsBeforeLecture)
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

    useEffect(() => {
        const updateNotifications = async (): Promise<void> => {
            if (timetable.length === 0) return
            await updateAllNotifications()
        }

        void updateNotifications()
    }, [timetable, i18n.language])

    const initialRender = useRef(true)

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false
        } else {
            console.log('language changed')
        }
    }, [i18n.language])

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
        if (loadingState === LoadingState.LOADING) return <LoadingView />

        if (loadingState === LoadingState.ERROR) return <ErrorView />

        if (timetableMode === 'list') {
            return <TimetableList friendlyTimetable={timetable} />
        } else {
            return <TimetableWeek friendlyTimetable={timetable} />
        }
    }

    const [isPageOpen, setIsPageOpen] = useState(false)

    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    return (
        <WorkaroundStack
            name={t('navigation.timetable')}
            titleKey={t('navigation.timetable')}
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
    errorView: {},
    navRight: {
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        marginRight: 12,
    },
})
