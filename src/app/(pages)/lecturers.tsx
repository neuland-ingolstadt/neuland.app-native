import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import LecturerRow from '@/components/Elements/Rows/LecturerRow'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorGuestView from '@/components/Elements/Universal/ErrorView'
import { type Colors } from '@/components/colors'
import { type NormalizedLecturer } from '@/types/utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useGlobalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function LecturersCard(): JSX.Element {
    const router = useRouter()

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
    const { t } = useTranslation('common')

    async function load(): Promise<void> {
        try {
            const rawData = await API.getPersonalLecturers()
            const data = normalizeLecturers(rawData)
            setPersonalLecturers(data)
            setLoadingState(LoadingState.LOADED)
        } catch (e) {
            if (e instanceof NoSessionError) {
                router.push('(user)/login')
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
    }

    useEffect(() => {
        async function load(): Promise<void> {
            if (q == null) {
                setFilteredLecturers(personalLecturers)

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
                        router.push('(user)/login')
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
            // style={styles.page}
            contentContainerStyle={styles.page}
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
                <ErrorGuestView
                    title={error?.message ?? t('error.title')}
                    onRefresh={onRefresh}
                    refreshing={false}
                />
            )}

            {loadingState === LoadingState.LOADED && (
                <View>
                    <Text
                        style={[
                            styles.sectionHeader,
                            { color: colors.labelSecondaryColor },
                        ]}
                    >
                        {q != null
                            ? t('pages.lecturers.results')
                            : t('pages.lecturers.personal')}
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
                                        iosPaddingLeft={16}
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
    page: {
        padding: PAGE_PADDING,
    },
    loadedRows: {
        borderRadius: 8,
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
