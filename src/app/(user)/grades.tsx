import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import GradesRow from '@/components/Elements/Pages/GradesRow'
import Divider from '@/components/Elements/Universal/Divider'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/stores/colors'
import { loadGrades } from '@/utils/grades-utils'
import { type Grade } from '@customTypes/thi-api'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
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

export default function GradesSCreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const [grades, setGrades] = useState<Grade[] | null>(null)
    const [missingGrades, setMissingGrades] = useState<Grade[] | null>(null)
    // const [gradeAverage, setGradeAverage] = useState(null)
    const [errorMsg, setErrorMsg] = useState('')

    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }

    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )

    async function load(): Promise<void> {
        try {
            const { finished, missing } = await loadGrades()
            setGrades(finished)
            setMissingGrades(missing)
            setLoadingState(LoadingState.LOADED)
            // const average = await loadGradeAverage()
            // setGradeAverage(average)
        } catch (e: any) {
            setLoadingState(LoadingState.ERROR)
            console.log(e)
            if (
                e instanceof NoSessionError ||
                e instanceof UnavailableSessionError
            ) {
                router.push('(user)/login')
            } else if (e.message === 'Query not possible') {
                // according to the original developers,
                // { status: -102, data: "Query not possible" }
                // means that the transcripts are currently being updated
                setErrorMsg(t('pages.grades.temporarilyUnavailable'))
            } else {
                setErrorMsg(e.message)
            }
        }
    }

    useEffect(() => {
        void load()
    }, [])

    const onRefresh: () => void = () => {
        void load()
    }

    return (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 32 }}
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
                        {errorMsg}
                    </Text>
                    <Text style={[styles.errorInfo, { color: colors.text }]}>
                        {t('error.refresh')}{' '}
                    </Text>
                </View>
            )}
            {loadingState === LoadingState.LOADED && (
                <>
                    <SectionView title={t('pages.grades.finished')}>
                        <React.Fragment>
                            {grades?.map((grade, index) => (
                                <React.Fragment key={index}>
                                    <GradesRow item={grade} colors={colors} />
                                    {index !== grades.length - 1 && (
                                        <Divider
                                            color={colors.labelTertiaryColor}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    </SectionView>
                    <SectionView title={t('pages.grades.open')}>
                        <React.Fragment>
                            {missingGrades?.map((grade, index) => (
                                <React.Fragment key={index}>
                                    <GradesRow item={grade} colors={colors} />
                                    {index !== missingGrades.length - 1 && (
                                        <Divider
                                            color={colors.labelTertiaryColor}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    </SectionView>
                    <View style={styles.notesBox}>
                        <Text
                            style={[
                                styles.notesText,
                                {
                                    color: colors.labelColor,
                                },
                            ]}
                        >
                            {t('pages.grades.footer')}
                        </Text>
                    </View>
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    loadedContainer: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '95%',
        marginTop: 14,
        marginBottom: 24,
        justifyContent: 'center',
    },
    notesBox: {
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        paddingTop: 16,
        paddingBottom: 32,
    },
    notesText: {
        fontSize: 12,
        fontWeight: 'normal',
        paddingTop: 8,
        textAlign: 'left',
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
})
