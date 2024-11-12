import ErrorView from '@/components/Error/ErrorView'
import TimetableList from '@/components/Timetable/TimetableList'
import TimetableWeek from '@/components/Timetable/TimetableWeek'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import { PreferencesContext, UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { type Exam, type FriendlyTimetableEntry } from '@/types/utils'
import { guestError, networkError } from '@/utils/api-utils'
import { loadExamList } from '@/utils/calendar-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { useQuery } from '@tanstack/react-query'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export interface ITimetableViewProps {
    friendlyTimetable: FriendlyTimetableEntry[]
    exams: Exam[]
}
export type CalendarMode = '3days' | 'list'
export const loadTimetable = async (): Promise<FriendlyTimetableEntry[]> => {
    const timetable = await getFriendlyTimetable(new Date(), true)
    if (timetable.length === 0) {
        throw new Error('Timetable is empty')
    }
    return timetable
}

export default function TimetableScreen(): JSX.Element {
    const { styles } = useStyles(stylesheet)

    const { timetableMode } = useContext(PreferencesContext)

    const { t } = useTranslation(['timetable'])

    const { userKind } = useContext(UserKindContext)

    const {
        data: timetable,
        error,
        isLoading,
        isPaused,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ['timetableV2', userKind],
        queryFn: loadTimetable,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60 * 24 * 7,
        retry(_, error) {
            const ignoreErrors = [
                '"Time table does not exist" (-202)',
                'Timetable is empty',
            ]
            if (ignoreErrors.includes(error?.message)) {
                return false
            }
            return false
        },
        enabled: userKind !== USER_GUEST,
    })

    const { data: exams } = useQuery({
        queryKey: ['exams'],
        queryFn: loadExamList,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 60 * 24,
        enabled: userKind !== USER_GUEST,
    })

    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    const LoadingView = (): JSX.Element => {
        return (
            <View style={styles.loadingView}>
                <LoadingIndicator />
            </View>
        )
    }

    const TempList = (): JSX.Element => {
        if (isLoading) return <LoadingView />
        else if (isSuccess && timetable !== undefined) {
            if (timetableMode === 'list') {
                return (
                    <TimetableList
                        friendlyTimetable={timetable}
                        exams={exams ?? []}
                    />
                )
            } else {
                return (
                    <TimetableWeek
                        friendlyTimetable={timetable}
                        exams={exams ?? []}
                    />
                )
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
                        isCritical={false}
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

    return isPageOpen ? <TempList /> : <></>
}

const stylesheet = createStyleSheet((theme) => ({
    loadingView: {
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
    },
}))
