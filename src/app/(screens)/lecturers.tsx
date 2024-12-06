import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/ErrorView'
import LecturerRow from '@/components/Rows/LecturerRow'
import Divider from '@/components/Universal/Divider'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ToggleRow from '@/components/Universal/ToggleRow'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { type Lecturers } from '@/types/thi-api'
import { type NormalizedLecturer } from '@/types/utils'
import {
    extractFacultyFromPersonal,
    getPersonalData,
    guestError,
    networkError,
} from '@/utils/api-utils'
import { normalizeLecturers } from '@/utils/lecturers-utils'
import { pausedToast } from '@/utils/ui-utils'
import { FlashList } from '@shopify/flash-list'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigation, useRouter } from 'expo-router'
import Fuse from 'fuse.js'
import React, {
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    Linking,
    Platform,
    RefreshControl,
    SafeAreaView,
    SectionList,
    Text,
    View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import {
    UnistylesRuntime,
    createStyleSheet,
    useStyles,
} from 'react-native-unistyles'

export default function LecturersCard(): JSX.Element {
    const router = useRouter()
    const [filteredLecturers, setFilteredLecturers] = useState<
        NormalizedLecturer[]
    >([])
    const { userKind = USER_GUEST } = useContext(UserKindContext)
    const navigation = useNavigation()
    const [selectedPage, setSelectedPage] = useState(0)
    const { styles, theme } = useStyles(stylesheet)
    const { t } = useTranslation('common')
    const pagerViewRef = useRef<PagerView>(null)
    const [displayesProfessors, setDisplayedProfessors] = useState(false)
    const [localSearch, setLocalSearch] = useState('')
    const [isSearchBarFocused, setLocalSearchBarFocused] = useState(false)
    const [faculty, setFaculty] = useState<string | null>(null)
    const [facultyData, setFacultyData] = useState<NormalizedLecturer[]>([])

    function setPage(page: number): void {
        pagerViewRef.current?.setPage(page)
    }

    const { data } = useQuery({
        queryKey: ['personalData'],
        queryFn: getPersonalData,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
        enabled: userKind === USER_STUDENT,
    })

    const results = useQueries({
        queries: [
            {
                queryKey: ['allLecturers'],
                queryFn: async () => {
                    const rawData = await API.getLecturers('0', 'z')
                    const data = normalizeLecturers(rawData)
                    return data
                },
                staleTime: 1000 * 60 * 30, // 30 minutes
                gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
                retry(failureCount: number, error: any) {
                    if (error instanceof NoSessionError) {
                        router.push('/login')
                        return false
                    }
                    return failureCount < 2
                },
                enabled: userKind !== USER_GUEST,
            },
            {
                queryKey: ['personalLecturers'],
                queryFn: async () => {
                    const rawData = await API.getPersonalLecturers()
                    const data = normalizeLecturers(rawData)
                    return data
                },
                staleTime: 1000 * 60 * 30, // 30 minutes
                gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
                retry(failureCount: number, error: any) {
                    if (error instanceof NoSessionError) {
                        router.navigate('/login')
                        return false
                    }
                    return failureCount < 2
                },
                enabled: userKind !== USER_GUEST,
            },
        ],
    })

    const allLecturersResult = results[0]
    const personalLecturersResult = results[1]
    const {
        isRefetchingByUser: isRefetchingByUserPersonal,
        refetchByUser: refetchByUserPersonal,
    } = useRefreshByUser(personalLecturersResult.refetch)
    const {
        isRefetchingByUser: isRefetchingByUserAll,
        refetchByUser: refetchByUserAll,
    } = useRefreshByUser(allLecturersResult.refetch)

    useEffect(() => {
        if (data !== null && data !== undefined) {
            const faculty = extractFacultyFromPersonal(data)
            setFaculty(faculty ?? null)
        }
    }, [data])

    useEffect(() => {
        if (localSearch !== '') {
            const options = {
                keys: ['name', 'vorname', 'tel_dienst', 'raum'],
                threshold: 0.4,
                useExtendedSearch: true,
            }

            const fuse = new Fuse(allLecturersResult?.data ?? [], options)
            const result = fuse.search(localSearch)
            const filtered = result.map((item) => item.item)

            setFilteredLecturers(filtered)
        }
    }, [allLecturersResult?.data, localSearch])
    useEffect(() => {
        let filtered: NormalizedLecturer[] = []
        if (faculty !== null) {
            filtered =
                allLecturersResult?.data?.filter(
                    (lecturer: Lecturers) =>
                        lecturer.organisation !== null &&
                        lecturer.organisation.includes(faculty)
                ) ?? []
            setDisplayedProfessors(false)
            setFacultyData(filtered)
            return
        }

        if (faculty === null || filtered.length === 0) {
            filtered =
                allLecturersResult?.data?.filter(
                    (lecturer: Lecturers) =>
                        lecturer.funktion !== null &&
                        lecturer.funktion === 'Professor(in)'
                ) ?? []

            setDisplayedProfessors(true)
            setFacultyData(filtered)
        }
    }, [faculty, allLecturersResult.data])

    const generateSections = (
        lecturers = allLecturersResult.data
    ): Array<{
        title: string
        data: NormalizedLecturer[]
    }> => {
        const sections = [] as Array<{
            title: string
            data: NormalizedLecturer[]
        }>
        let currentLetter = ''

        lecturers?.forEach((lecturer) => {
            const firstLetter = lecturer.name.charAt(0).toUpperCase()
            if (firstLetter !== currentLetter) {
                currentLetter = firstLetter
                sections.push({ title: currentLetter, data: [lecturer] })
            } else {
                sections[sections.length - 1].data.push(lecturer)
            }
        })

        return sections
    }

    const sections = generateSections(filteredLecturers)

    useEffect(() => {
        if (localSearch.length === 0 && allLecturersResult.data != null) {
            setFilteredLecturers(allLecturersResult.data)
        }
    }, [allLecturersResult.data, localSearch])

    useEffect(() => {
        if (
            (allLecturersResult.isPaused && allLecturersResult.data != null) ||
            (personalLecturersResult.isPaused &&
                personalLecturersResult.data != null)
        ) {
            pausedToast()
        }
    }, [
        allLecturersResult.data,
        allLecturersResult.isPaused,
        personalLecturersResult.data,
        personalLecturersResult.isPaused,
        t,
    ])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                placeholder: t('navigation.lecturers.search', {
                    ns: 'navigation',
                }),

                ...Platform.select({
                    android: {
                        headerIconColor: theme.colors.text,
                        hintTextColor: theme.colors.text,
                        textColor: theme.colors.text,
                    },
                }),
                shouldShowHintSearchIcon: false,
                hideWhenScrolling: false,
                hideNavigationBar: false,
                onChangeText: (event: { nativeEvent: { text: string } }) => {
                    const text = event.nativeEvent.text
                    setLocalSearch(text)
                },
                onFocus: () => {
                    setLocalSearchBarFocused(true)
                },
                onClose: () => {
                    setLocalSearchBarFocused(false)
                },
                onCancelButtonPress: () => {
                    setLocalSearchBarFocused(false)
                },
            },
        })
    }, [UnistylesRuntime.themeName, navigation, t])

    const LecturerList = ({
        lecturers,
        isPaused,
        isError,
        isSuccess,
        error,
        isLoading,
        isPersonal = false,
    }: {
        lecturers: NormalizedLecturer[] | undefined
        isPaused: boolean
        isError: boolean
        isSuccess: boolean
        error: Error | null
        isLoading: boolean
        isPersonal?: boolean
    }): JSX.Element => {
        return isPaused && !isSuccess ? (
            <View style={styles.viewHorizontal}>
                <ErrorView
                    title={networkError}
                    refreshing={
                        isPersonal
                            ? isRefetchingByUserPersonal
                            : isRefetchingByUserAll
                    }
                    onRefresh={() => {
                        void (isPersonal
                            ? refetchByUserPersonal()
                            : refetchByUserAll())
                    }}
                />
            </View>
        ) : isLoading ? (
            <LoadingIndicator style={styles.loadingContainer} />
        ) : isError ? (
            <View
                style={{
                    ...styles.viewHorizontal,
                    ...styles.page,
                }}
            >
                <ErrorView
                    title={error?.message ?? t('error.title')}
                    refreshing={
                        isPersonal
                            ? isRefetchingByUserPersonal
                            : isRefetchingByUserAll
                    }
                    onRefresh={() => {
                        void (isPersonal
                            ? refetchByUserPersonal()
                            : refetchByUserAll())
                    }}
                />
            </View>
        ) : isSuccess && lecturers != null && lecturers?.length > 0 ? (
            <FlashList
                data={lecturers}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.loadedRows}
                estimatedItemSize={101}
                refreshControl={
                    <RefreshControl
                        refreshing={
                            isPersonal
                                ? isRefetchingByUserPersonal
                                : allLecturersResult.isRefetching
                        }
                        onRefresh={() => {
                            void (isPersonal
                                ? refetchByUserPersonal()
                                : refetchByUserAll())
                        }}
                    />
                }
                renderItem={({ item, index }) => (
                    <View
                        key={index}
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                            overflow: 'hidden',
                            borderTopStartRadius:
                                index === 0 ? theme.radius.md : 0,
                            borderTopEndRadius:
                                index === 0 ? theme.radius.md : 0,
                            borderBottomStartRadius:
                                index === lecturers.length - 1
                                    ? theme.radius.md
                                    : 0,
                            borderBottomEndRadius:
                                index === lecturers.length - 1
                                    ? theme.radius.md
                                    : 0,
                        }}
                    >
                        <LecturerRow item={item} />
                        {index !== lecturers.length - 1 && (
                            <Divider iosPaddingLeft={16} />
                        )}
                    </View>
                )}
            />
        ) : (
            <View style={styles.pagePadding}>
                {isPersonal ? (
                    <ErrorView
                        title={t('pages.lecturers.error.title')}
                        message={t('pages.lecturers.error.subtitle')}
                        icon={{
                            ios: 'calendar.badge.exclamationmark',
                            android: 'edit_calendar',
                        }}
                        buttonText={t('error.empty.button', {
                            ns: 'timetable',
                        })}
                        onButtonPress={() => {
                            void Linking.openURL('https://hiplan.thi.de/')
                        }}
                        refreshing={isRefetchingByUserPersonal}
                        onRefresh={() => {
                            void refetchByUserPersonal()
                        }}
                        isCritical={false}
                    />
                ) : (
                    <ErrorView
                        title={t('error.title')}
                        refreshing={isRefetchingByUserAll}
                        onRefresh={() => {
                            void refetchByUserAll()
                        }}
                    />
                )}
            </View>
        )
    }

    const FilterSectionList = (): JSX.Element => {
        return allLecturersResult.isLoading ? (
            <View style={styles.viewHorizontal}>
                <LoadingIndicator style={styles.loadingContainer} />
            </View>
        ) : allLecturersResult.isPaused ? (
            <ErrorView
                title={networkError}
                refreshing={isRefetchingByUserAll}
                onRefresh={() => {
                    void refetchByUserAll()
                }}
            />
        ) : allLecturersResult.isError ? (
            <ErrorView
                title={allLecturersResult.error.message}
                refreshing={isRefetchingByUserAll}
                onRefresh={() => {
                    void refetchByUserAll()
                }}
            />
        ) : (
            <>
                <View style={styles.resultsCountContainer}>
                    <Text style={styles.resultsCount}>
                        {filteredLecturers.length}{' '}
                        {t('pages.lecturers.results')}
                    </Text>
                </View>
                <SectionList
                    sections={sections}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item, index, section }) => (
                        <View
                            key={index}
                            // eslint-disable-next-line react-native/no-inline-styles
                            style={{
                                backgroundColor: theme.colors.card,
                                borderTopLeftRadius: index === 0 ? 8 : 0,
                                borderTopRightRadius: index === 0 ? 8 : 0,
                                borderBottomLeftRadius:
                                    index === section.data.length - 1 ? 8 : 0,
                                borderBottomRightRadius:
                                    index === section.data.length - 1 ? 8 : 0,
                            }}
                        >
                            <LecturerRow item={item} />
                            {index !== section.data.length - 1 && (
                                <Divider iosPaddingLeft={16} />
                            )}
                        </View>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={styles.sectionHeaderContainer}>
                            <Text style={styles.sectionHeader}>{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.contentContainer}
                />
            </>
        )
    }

    return (
        <SafeAreaView
            // eslint-disable-next-line react-native/no-inline-styles
            style={styles.page}
        >
            {userKind === USER_GUEST ? (
                <ErrorView title={guestError} />
            ) : !isSearchBarFocused ? (
                <View style={styles.searchContainer}>
                    <ToggleRow
                        items={[
                            t('pages.lecturers.personal'),
                            displayesProfessors
                                ? t('pages.lecturers.professors')
                                : t('pages.lecturers.faculty'),
                        ]}
                        selectedElement={selectedPage}
                        setSelectedElement={setPage}
                    />
                    <PagerView
                        style={styles.page}
                        initialPage={selectedPage}
                        onPageSelected={(e) => {
                            setSelectedPage(e.nativeEvent.position)
                        }}
                        ref={pagerViewRef}
                    >
                        <LecturerList
                            lecturers={personalLecturersResult.data}
                            isPaused={personalLecturersResult.isPaused}
                            isError={personalLecturersResult.isError}
                            isSuccess={personalLecturersResult.isSuccess}
                            error={personalLecturersResult.error}
                            isLoading={personalLecturersResult.isLoading}
                            isPersonal
                        />
                        <LecturerList
                            lecturers={facultyData}
                            isPaused={allLecturersResult.isPaused}
                            isError={allLecturersResult.isError}
                            isSuccess={allLecturersResult.isSuccess}
                            error={allLecturersResult.error}
                            isLoading={allLecturersResult.isLoading}
                        />
                    </PagerView>
                </View>
            ) : (
                <FilterSectionList />
            )}
        </SafeAreaView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentContainer: {
        marginHorizontal: theme.margins.page,
        paddingBottom: theme.margins.bottomSafeArea,
    },

    loadedRows: {
        paddingBottom: theme.margins.bottomSafeArea,
        paddingHorizontal: theme.margins.page,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    page: {
        flex: 1,
    },
    pagePadding: {
        paddingHorizontal: theme.margins.page,
    },
    resultsCount: {
        color: theme.colors.labelColor,
        fontSize: 13,
        paddingHorizontal: 12,
        textAlign: 'right',
    },
    resultsCountContainer: {
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 1,
    },
    searchContainer: { flex: 1, gap: 10, paddingTop: 10 },
    sectionHeader: {
        color: theme.colors.text,
        fontSize: 17,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    sectionHeaderContainer: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 4,
        paddingVertical: 8,
    },
    viewHorizontal: {
        paddingHorizontal: theme.margins.page,
    },
}))
