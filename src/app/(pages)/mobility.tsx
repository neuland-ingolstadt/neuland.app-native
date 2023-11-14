import NeulandAPI from '@/api/neuland-api'
import MobilityRow from '@/components/Elements/Pages/MobilityRow'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import { MobilityContext } from '@/stores/provider'
import { type CLEvents } from '@/stores/types/neuland-api'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/stlye-utils'
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

export default function Mobility(): JSX.Element {
    const [events, setEvents] = useState<CLEvents[]>([])
    const colors = useTheme().colors as Colors
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
    const [error, setError] = useState<Error | null>(null)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    const { mobilityKind, mobilityStation } = React.useContext(MobilityContext)
    const { t } = useTranslation('common')

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
        const mobilityData = (await NeulandAPI.getBusPlan(
            mobilityStation
        )) as CLEvents[]

        const newEvents = mobilityData.map((x) => ({
            ...x,
            begin: x.begin !== null ? new Date(x.begin) : null,
            end: x.end !== null ? new Date(x.end) : null,
        }))
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
                loadingState !== LoadingState.LOADING ? (
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
                        {t('error.refresh')}{' '}
                    </Text>
                </View>
            )}
            {loadingState === LoadingState.LOADED && (
                <>
                    <View
                        style={[
                            styles.loadedContainer,
                            { backgroundColor: colors.card },
                        ]}
                    >
                        {events.map((event, index) => (
                            <React.Fragment key={index}>
                                <MobilityRow
                                    item={event}
                                    colors={colors}
                                    detailed={true}
                                    kind={mobilityKind}
                                />
                                {index !== events.length - 1 && (
                                    <Divider
                                        color={colors.labelTertiaryColor}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </>
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
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
        marginBottom: MODAL_BOTTOM_MARGIN,
    },
})
