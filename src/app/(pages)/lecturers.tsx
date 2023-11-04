import API from '@/api/authenticated-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import LecturerRow from '@/components/Elements/Pages/LecturerRow'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import {
    type NormalizedLecturer,
    normalizeLecturers,
} from '@/utils/lecturers-utils'
import { useTheme } from '@react-navigation/native'
import { useGlobalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function LecturersCard(): JSX.Element {
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }

    const [personalLecturers, setPersonalLecturers] = useState<
        NormalizedLecturer[]
    >([])
    const [filteredLecturers, setFilteredLecturers] = useState<
        NormalizedLecturer[]
    >([])
    const [didFetch, setDidFetch] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )
    const { q } = useGlobalSearchParams<{ q: string }>()
    const [allLecturers, setAllLecturers] = useState<NormalizedLecturer[]>([])
    const colors = useTheme().colors as Colors
    async function load(): Promise<void> {
        try {
            const rawData = await API.getPersonalLecturers()
            const data = normalizeLecturers(rawData)
            setPersonalLecturers(data)
            setLoadingState(LoadingState.LOADED)
        } catch (e) {
            if (
                e instanceof NoSessionError ||
                e instanceof UnavailableSessionError
            ) {
                // router.replace('(user)/login')
            } else {
                setLoadingState(LoadingState.ERROR)
                setError(e as Error)
            }
        }
    }
    useEffect(() => {
        void load()
    }, [])

    const onRefresh: () => void = () => {
        void load()
        setLoadingState(LoadingState.LOADED)
    }

    useEffect(() => {
        async function load(): Promise<void> {
            setLoadingState(LoadingState.LOADING)
            if (q == null) {
                setFilteredLecturers(personalLecturers)
                setLoadingState(LoadingState.LOADED)
                return
            }

            if (allLecturers.length === 0) {
                if (didFetch) {
                    return
                }

                setDidFetch(true)
                setFilteredLecturers([])
                try {
                    const rawData = await API.getLecturers('0', 'z')
                    const data = normalizeLecturers(rawData)
                    setAllLecturers(data)
                    setLoadingState(LoadingState.LOADED)
                    return
                } catch (e) {
                    if (e instanceof NoSessionError) {
                        // router.replace('(user)/login')
                    } else {
                        setError(e as Error)
                    }
                    setLoadingState(LoadingState.ERROR)
                    return
                }
            }

            const normalizedSearch = q.toLowerCase().trim()
            const checkField = (value: string | null): boolean =>
                value?.toString().toLowerCase().includes(normalizedSearch) ??
                false
            const filtered = allLecturers
                .filter(
                    (x) =>
                        checkField(x.name) ||
                        checkField(x.vorname) ||
                        checkField(x.email) ||
                        checkField(x.tel_dienst) ||
                        checkField(x.raum)
                )
                .slice(0, 20)

            setFilteredLecturers(filtered)
            setLoadingState(LoadingState.LOADED)
        }
        void load()
    }, [didFetch, q, personalLecturers, allLecturers])

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
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
                        An error occurred while loading the data.{'\n'}Pull down
                        to refresh.
                    </Text>
                </View>
            )}

            {loadingState === LoadingState.LOADED && (
                <View style={styles.loadedContainer}>
                    <Text
                        style={[
                            styles.sectionHeader,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        {q != null ? 'Suchergebnisse' : 'Persönliche Dozenten'}
                    </Text>
                    <View
                        style={[
                            styles.loadedRows,
                            { backgroundColor: colors.card },
                        ]}
                    >
                        {filteredLecturers?.map((event, index) => (
                            <React.Fragment key={index}>
                                <LecturerRow item={event} colors={colors} />
                                {index !== personalLecturers.length - 1 && (
                                    <Divider
                                        color={colors.labelTertiaryColor}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    loadedContainer: {
        alignSelf: 'center',
        width: '95%',
        marginTop: 14,
        marginBottom: 24,
    },
    loadedRows: {
        borderRadius: 8,
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
    sectionHeader: {
        fontSize: 13,

        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
})
