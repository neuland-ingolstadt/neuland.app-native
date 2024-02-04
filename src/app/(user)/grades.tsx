import NeulandAPI from '@/api/neuland-api'
import { NoSessionError } from '@/api/thi-session-handler'
import GradesRow from '@/components/Elements/Rows/GradesRow'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { type Colors } from '@/components/colors'
import { useRefreshByUser } from '@/hooks'
import { type GradeAverage } from '@/types/utils'
import { networkError } from '@/utils/api-utils'
import { loadGradeAverage, loadGrades } from '@/utils/grades-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
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

import packageInfo from '../../../package.json'

export default function GradesSCreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('settings')
    const [gradeAverage, setGradeAverage] = useState<GradeAverage>()

    const [averageLoadingState, setAverageLoadingState] =
        useState<LoadingState>(LoadingState.LOADING)

    /**
     * Loads the average grade from the API and sets the state accordingly.
     * @returns {Promise<void>} A promise that resolves when the average grade has been loaded.
     */
    async function loadAverageGrade(): Promise<void> {
        try {
            const average = await loadGradeAverage(spoWeights)
            if (average.result !== undefined && average.result !== null) {
                setGradeAverage(average)
                setAverageLoadingState(LoadingState.LOADED)
            } else {
                throw new Error('Average grade is undefined or null')
            }
        } catch (e: any) {
            setAverageLoadingState(LoadingState.ERROR)
        }
    }

    // TODO: Just cache the spoWeights for the relevant study program
    const { data: spoWeights } = useQuery({
        queryKey: ['spoWeights', packageInfo.version],
        queryFn: async () => await NeulandAPI.getSpoWeights(),
        staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        gcTime: 1000 * 60 * 60 * 24 * 14, // 2 weeks
    })

    const {
        data: grades,
        error,
        isLoading,
        isPaused,
        isSuccess,
        refetch,
        isError,
    } = useQuery({
        queryKey: ['grades'],
        queryFn: loadGrades,
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('user/login')
                return false
            }
            return failureCount < 3
        },
    })
    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)
    useEffect(() => {
        void loadAverageGrade()
    }, [spoWeights, grades?.finished])

    return (
        <ScrollView
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                isSuccess ? (
                    <RefreshControl
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                ) : undefined
            }
        >
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}
            {isError && (
                <ErrorView
                    title={error.message}
                    onRefresh={refetchByUser}
                    refreshing={isRefetchingByUser}
                />
            )}
            {isPaused && !isSuccess && (
                <ErrorView
                    title={networkError}
                    onRefresh={refetchByUser}
                    refreshing={isRefetchingByUser}
                />
            )}
            {isSuccess && grades !== null && (
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
                            {grades?.finished?.map((grade, index) => (
                                <React.Fragment key={index}>
                                    <GradesRow item={grade} colors={colors} />
                                    {index !== grades.finished.length - 1 && (
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
                            {grades?.missing?.map((grade, index) => (
                                <React.Fragment key={index}>
                                    <GradesRow item={grade} colors={colors} />
                                    {index !== grades.missing.length - 1 && (
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
