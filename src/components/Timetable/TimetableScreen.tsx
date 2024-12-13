import ErrorView from '@/components/Error/ErrorView'
import TimetableList from '@/components/Timetable/TimetableList'
import TimetableWeek from '@/components/Timetable/TimetableWeek'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { guestError, networkError } from '@/utils/api-utils'
import { loadExamList } from '@/utils/calendar-utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { useQuery } from '@tanstack/react-query'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export const loadTimetable = async (): Promise<FriendlyTimetableEntry[]> => {
    const timetable = await getFriendlyTimetable(new Date(), true)
    if (timetable.length === 0) {
        throw new Error('Timetable is empty')
    }
    return timetable
}

function TimetableScreen(): JSX.Element {
    const { styles } = useStyles(stylesheet)

    const timetableMode = usePreferencesStore((state) => state.timetableMode)

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

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.page} edges={['top']}>
                {isLoading ? (
                    <LoadingView />
                ) : isSuccess &&
                  timetable !== undefined &&
                  timetable.length > 0 ? (
                    timetableMode === 'list' ? (
                        <TimetableList
                            timetable={timetable}
                            exams={exams ?? []}
                        />
                    ) : (
                        <TimetableWeek
                            timetable={timetable}
                            exams={exams ?? []}
                        />
                    )
                ) : isPaused && !isSuccess ? (
                    <ErrorView
                        title={networkError}
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                ) : error?.message === '"Time table does not exist" (-202)' ||
                  error?.message === 'Timetable is empty' ? (
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
                ) : userKind === USER_GUEST ? (
                    <ErrorView title={guestError} />
                ) : (
                    <ErrorView
                        title={
                            error?.message ?? t('error.title', { ns: 'common' })
                        }
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default TimetableScreen

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
    page: {
        flex: 1,
    },
}))
