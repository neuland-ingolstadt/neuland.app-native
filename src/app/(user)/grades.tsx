import { NoSessionError } from '@/api/thi-session-handler'
import GradesRow from '@/components/Elements/Rows/GradesRow'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorGuestView from '@/components/Elements/Universal/ErrorPage'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { type Grade } from '@/types/thi-api'
import { type GradeAverage } from '@/types/utils'
import { loadGradeAverage, loadGrades } from '@/utils/grades-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
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
    const { t } = useTranslation('settings')
    const [grades, setGrades] = useState<Grade[] | null>(null)
    const [missingGrades, setMissingGrades] = useState<Grade[] | null>(null)
    const [gradeAverage, setGradeAverage] = useState<GradeAverage>()
    const [errorMsg, setErrorMsg] = useState('')

    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )

    const [averageLoadingState, setAverageLoadingState] =
        useState<LoadingState>(LoadingState.LOADING)

    /**
     * Loads all grades from the API and sets the state accordingly.
     * @returns {Promise<void>} A promise that resolves when all grades have been loaded.
     */
    async function loadAllGrades(): Promise<void> {
        try {
            const { finished, missing } = await loadGrades()
            setGrades(finished)
            setMissingGrades(missing)
            setLoadingState(LoadingState.LOADED)
        } catch (e: any) {
            setLoadingState(LoadingState.ERROR)
            if (e instanceof NoSessionError) {
                router.push('(user)/login')
            } else if (e.message === 'Query not possible') {
                // according to the original developers,
                // { status: -102, data: "Query not possible" }
                // means that the transcripts are currently being updated
                setErrorMsg(t('grades.temporarilyUnavailable'))
            } else {
                setErrorMsg(e.message)
                console.error(e)
            }
        }
    }

    /**
     * Loads the average grade from the API and sets the state accordingly.
     * @returns {Promise<void>} A promise that resolves when the average grade has been loaded.
     */
    async function loadAverageGrade(): Promise<void> {
        try {
            const average = await loadGradeAverage()
            if (average.result !== undefined && average.result !== null) {
                setGradeAverage(average)
                setAverageLoadingState(LoadingState.LOADED)
            } else {
                throw new Error('Average grade is undefined or null')
            }
        } catch (e: any) {
            setAverageLoadingState(LoadingState.ERROR)
            console.error(e)
        }
    }

    useEffect(() => {
        void Promise.all([loadAllGrades(), loadAverageGrade()])
    }, [])

    const onRefresh: () => void = () => {
        void Promise.all([loadAllGrades(), loadAverageGrade()])
    }

    return (
        <ScrollView
            contentContainerStyle={styles.contentContainer}
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
                    title={errorMsg}
                    onRefresh={onRefresh}
                    refreshing={false}
                />
            )}
            {loadingState === LoadingState.LOADED && (
                <>
                    <SectionView title={t('grades.average')}>
                        <View style={styles.loadedContainer}>
                            {averageLoadingState === LoadingState.LOADING && (
                                <ActivityIndicator
                                    size="small"
                                    color={colors.primary}
                                />
                            )}
                            {averageLoadingState === LoadingState.ERROR && (
                                <Text
                                    style={[
                                        styles.averageErrorText,
                                        { color: colors.text },
                                    ]}
                                >
                                    {t('grades.averageError')}
                                </Text>
                            )}
                            {averageLoadingState === LoadingState.LOADED &&
                                gradeAverage !== undefined &&
                                gradeAverage !== null && (
                                    <View style={styles.averageContainer}>
                                        <Text
                                            style={[
                                                styles.averageText,
                                                { color: colors.text },
                                            ]}
                                        >
                                            {gradeAverage.resultMin !==
                                                gradeAverage.resultMax && '~ '}
                                            {gradeAverage.result}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.averageNote,
                                                { color: colors.labelColor },
                                            ]}
                                        >
                                            {gradeAverage.resultMin ===
                                            gradeAverage.resultMax
                                                ? t('grades.exactAverage', {
                                                      number: gradeAverage
                                                          .entries.length,
                                                  })
                                                : t('grades.missingAverage', {
                                                      min: gradeAverage.resultMin,
                                                      max: gradeAverage.resultMax,
                                                  })}
                                        </Text>
                                    </View>
                                )}
                        </View>
                    </SectionView>
                    <SectionView title={t('grades.finished')}>
                        <React.Fragment>
                            {grades?.map((grade, index) => (
                                <React.Fragment key={index}>
                                    <GradesRow item={grade} colors={colors} />
                                    {index !== grades.length - 1 && (
                                        <Divider
                                            color={colors.labelTertiaryColor}
                                            iosPaddingLeft={16}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    </SectionView>
                    <SectionView title={t('grades.open')}>
                        <React.Fragment>
                            {missingGrades?.map((grade, index) => (
                                <React.Fragment key={index}>
                                    <GradesRow item={grade} colors={colors} />
                                    {index !== missingGrades.length - 1 && (
                                        <Divider
                                            color={colors.labelTertiaryColor}
                                            iosPaddingLeft={16}
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
                            {t('grades.footer')}
                        </Text>
                    </View>
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 32,
    },
    loadedContainer: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        minHeight: 70,
        marginVertical: 16,
        marginHorizontal: PAGE_PADDING,
        justifyContent: 'center',
    },
    notesBox: {
        paddingHorizontal: PAGE_PADDING,
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
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    averageContainer: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginHorizontal: PAGE_PADDING,
    },
    averageText: {
        fontSize: 25,
        marginBottom: 5,
        fontWeight: '700',
        textAlign: 'center',
    },
    averageNote: {
        fontSize: 14,
        textAlign: 'left',
    },
    averageErrorText: {
        fontSize: 15,
        textAlign: 'center',
    },
})
