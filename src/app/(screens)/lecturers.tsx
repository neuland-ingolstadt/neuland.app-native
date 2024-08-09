import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Elements/Error/ErrorView'
import LecturerRow from '@/components/Elements/Rows/LecturerRow'
import Divider from '@/components/Elements/Universal/Divider'
import ToggleRow from '@/components/Elements/Universal/ToggleRow'
import { type Colors } from '@/components/colors'
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
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { showToast } from '@/utils/ui-utils'
import { useHeaderHeight } from '@react-navigation/elements'
import { useTheme } from '@react-navigation/native'
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
    ActivityIndicator,
    FlatList,
    Linking,
    Platform,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import PagerView from 'react-native-pager-view'

export default function LecturersCard(): JSX.Element {
    const router = useRouter()
    const [filteredLecturers, setFilteredLecturers] = useState<
        NormalizedLecturer[]
    >([])
    const { userKind = USER_GUEST } = useContext(UserKindContext)
    const navigation = useNavigation()
    const [selectedPage, setSelectedPage] = useState(0)
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const pagerViewRef = useRef<PagerView>(null)
    const [displayesProfessors, setDisplayedProfessors] = useState(false)
    const [localSearch, setLocalSearch] = useState('')
    const [isSearchBarFocused, setLocalSearchBarFocused] = useState(false)
    const [faculty, setFaculty] = useState<string | null>(null)
    const [facultyData, setFacultyData] = useState<NormalizedLecturer[]>([])
    const headerHeight = useHeaderHeight()

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
                        router.push('login')
                        return false
                    }
                    return failureCount < 3
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
                        router.navigate('login')
                        return false
                    }
                    return failureCount < 3
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
            void showToast(t('toast.paused'))
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
                        headerIconColor: colors.text,
                        hintTextColor: colors.text,
                        textColor: colors.text,
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
    }, [colors.text, navigation, t])

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
            <View
                style={{
                    paddingHorizontal: PAGE_PADDING,
                }}
            >
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
            <ActivityIndicator
                style={styles.loadingContainer}
                size="small"
                color={colors.primary}
            />
        ) : isError ? (
            <View
                style={{
                    paddingHorizontal: PAGE_PADDING,
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
            <FlatList
                data={lecturers}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={{
                    marginHorizontal: PAGE_PADDING,
                    backgroundColor: colors.card,
                    ...styles.loadedRows,
                }}
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
                style={{ paddingBottom: PAGE_BOTTOM_SAFE_AREA }}
                renderItem={({ item, index }) => (
                    <React.Fragment key={index}>
                        <LecturerRow item={item} colors={colors} />
                        {index !== lecturers.length - 1 && (
                            <Divider
                                color={colors.labelTertiaryColor}
                                iosPaddingLeft={16}
                            />
                        )}
                    </React.Fragment>
                )}
            />
        ) : (
            <View
                style={{
                    paddingHorizontal: PAGE_PADDING,
                    ...styles.page,
                }}
            >
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
            <View
                style={{
                    paddingHorizontal: PAGE_PADDING,
                }}
            >
                <ActivityIndicator
                    style={styles.loadingContainer}
                    size="small"
                    color={colors.primary}
                />
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
                    <Text
                        style={{
                            ...styles.resultsCount,
                            color: colors.labelColor,
                        }}
                    >
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
                                backgroundColor: colors.card,
                                borderTopLeftRadius: index === 0 ? 8 : 0,
                                borderTopRightRadius: index === 0 ? 8 : 0,
                                borderBottomLeftRadius:
                                    index === section.data.length - 1 ? 8 : 0,
                                borderBottomRightRadius:
                                    index === section.data.length - 1 ? 8 : 0,
                            }}
                        >
                            <LecturerRow item={item} colors={colors} />
                            {index !== section.data.length - 1 && (
                                <Divider
                                    color={colors.labelTertiaryColor}
                                    iosPaddingLeft={16}
                                />
                            )}
                        </View>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View
                            style={{
                                backgroundColor: colors.background,
                                ...styles.sectionHeaderContainer,
                            }}
                        >
                            <Text
                                style={{
                                    ...styles.sectionHeader,
                                    color: colors.text,
                                }}
                            >
                                {title}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={{
                        marginHorizontal: PAGE_PADDING,
                        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
                    }}
                />
            </>
        )
    }

    return (
        <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
                ...styles.page,
                marginTop: Platform.OS === 'ios' ? headerHeight + 60 : 10,
            }}
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
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
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
        fontSize: 17,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    sectionHeaderContainer: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    searchContainer: { flex: 1, gap: 10 },
    resultsCountContainer: {
        position: 'absolute',
        right: 0,
        left: 0,
        zIndex: 1,
    },
    resultsCount: {
        paddingHorizontal: 12,
        textAlign: 'right',
        fontSize: 13,
    },
})
