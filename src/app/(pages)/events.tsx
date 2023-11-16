import NeulandAPI from '@/api/neuland-api'
import CLEventRow from '@/components/Elements/Pages/EventRow'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { type CLEvents } from '@/types/neuland-api'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'

export default function Events(): JSX.Element {
    const [events, setEvents] = useState<CLEvents[]>([])
    const colors = useTheme().colors as Colors
    const [error, setError] = useState<Error | null>(null)
    const { t } = useTranslation('common')

    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    useEffect(() => {
        void loadEvents()
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }, [])

    async function loadEvents(): Promise<void> {
        const campusLifeEvents =
            (await NeulandAPI.getCampusLifeEvents()) as CLEvents[]

        const newEvents = campusLifeEvents
            .map((x) => ({
                ...x,
                begin: x.begin !== null ? new Date(x.begin) : null,
                end: x.end !== null ? new Date(x.end) : null,
            }))
            .filter((x) => x.end === null || x.end > new Date())

        setEvents(newEvents)
    }

    const onRefresh: () => void = () => {
        void loadEvents()
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }

    return (
        <ScrollView
            style={styles.page}
            refreshControl={
                loadingState !== LoadingState.LOADING &&
                loadingState !== LoadingState.LOADED ? (
                    <RefreshControl
                        refreshing={loadingState === LoadingState.REFRESHING}
                        onRefresh={onRefresh}
                    />
                ) : undefined
            }
        >
            {loadingState === LoadingState.LOADING && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}
            {loadingState === LoadingState.ERROR && (
                <View>
                    <Text style={[styles.errorMessage, { color: colors.text }]}>
                        {error?.message}
                    </Text>
                    <Text style={[styles.errorInfo, { color: colors.text }]}>
                        {t('error.refreshPull')}{' '}
                    </Text>
                </View>
            )}
            {loadingState === LoadingState.LOADED && (
                <View
                    style={[
                        styles.loadedContainer,
                        { backgroundColor: colors.card },
                    ]}
                >
                    {events.map((event, index) => (
                        <React.Fragment key={index}>
                            <CLEventRow event={event} colors={colors} />
                            {index !== events.length - 1 && (
                                <Divider color={colors.labelTertiaryColor} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    errorMessage: {
        paddingTop: 100,
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadedContainer: {
        alignSelf: 'center',
        width: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        marginBottom: MODAL_BOTTOM_MARGIN,
    },
})
