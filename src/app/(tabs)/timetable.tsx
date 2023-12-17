import TimetableList from '@/components/Elements/Timetable/TimetableList'
import TimetableWeek from '@/components/Elements/Timetable/TimetableWeek'
import { ErrorView } from '@/components/Elements/Universal/ErrorPage'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { TimetableContext } from '@/components/provider'
import { type FriendlyTimetableEntry } from '@/types/utils'
import { getFriendlyTimetable } from '@/utils/timetable-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import React, { useContext, useEffect, useState } from 'react'
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

    useEffect(() => {
        const loadTimetable = async (): Promise<void> => {
            const timetable = await getFriendlyTimetable(new Date(), true)
            setTimetable(timetable)
            setLoadingState(LoadingState.LOADED)
        }

        void loadTimetable()
    }, [])

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

    return (
        <WorkaroundStack
            name={t('navigation.timetable')}
            titleKey={t('navigation.timetable')}
            component={TempList}
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
