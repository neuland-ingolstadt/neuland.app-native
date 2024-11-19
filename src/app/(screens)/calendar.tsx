import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/ErrorView'
import { CalendarRow, ExamRow } from '@/components/Rows/CalendarRow'
import Divider from '@/components/Universal/Divider'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import ToggleRow from '@/components/Universal/ToggleRow'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { guestError, networkError } from '@/utils/api-utils'
import { calendar, loadExamList } from '@/utils/calendar-utils'
import { trackEvent } from '@aptabase/react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Animated,
    Linking,
    RefreshControl,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function CalendarPage(): JSX.Element {
    const { userKind = USER_GUEST } = React.useContext(UserKindContext)
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')
    const displayTypes = [
        t('pages.calendar.events.title'),
        t('pages.calendar.exams.title'),
    ]
    const [selectedData, setSelectedData] = useState<number>(0)
    const primussUrl = 'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
    const handleLinkPress = (): void => {
        void Linking.openURL(
            selectedData === 0 ? t('pages.calendar.calendar.link') : primussUrl
        )
    }

    const {
        data: exams,
        error,
        isLoading,
        isError,
        isPaused,
        isSuccess,
        refetch,
    } = useQuery({
        queryKey: ['exams'],
        queryFn: loadExamList,
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.push(' login')
                return false
            }
            return failureCount < 2
        },
        enabled: userKind !== USER_GUEST,
    })
    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)
    const screenHeight = useWindowDimensions().height
    const pagerViewRef = useRef<PagerView>(null)
    function setPage(page: number): void {
        pagerViewRef.current?.setPage(page)
    }
    const scrollY = new Animated.Value(0)
    const pages = ['events', 'exams']

    const CalendarFooter = (): JSX.Element => {
        return (
            <View style={styles.footerContainer}>
                <Text style={styles.footerText1}>
                    {t('pages.calendar.footer.part1')}
                    <Text style={styles.footerText2} onPress={handleLinkPress}>
                        {t('pages.calendar.footer.part2')}
                    </Text>
                    {t('pages.calendar.footer.part3')}
                </Text>
            </View>
        )
    }

    return (
        <View
            style={{
                ...styles.viewVertical,
                ...styles.pagerContainer,
            }}
        >
            <Animated.View
                style={{
                    borderBottomWidth: scrollY.interpolate({
                        inputRange: [0, 0, 1],
                        outputRange: [0, 0, 0.5],
                        extrapolate: 'clamp',
                    }),
                    ...styles.toggleContainer,
                }}
            >
                <ToggleRow
                    items={displayTypes}
                    selectedElement={selectedData}
                    setSelectedElement={setPage}
                />
            </Animated.View>

            <PagerView
                ref={pagerViewRef}
                style={{
                    ...styles.pagerContainer,
                    height: screenHeight,
                }}
                initialPage={0}
                onPageSelected={(e) => {
                    const page = e.nativeEvent.position
                    setSelectedData(page)
                    trackEvent('Route', {
                        path: 'calendar/' + pages[page],
                    })
                }}
                scrollEnabled
                overdrag
            >
                {/* Page 1: Events */}
                <View>
                    <ScrollView
                        contentContainerStyle={styles.itemsContainer}
                        style={styles.viewHorizontal}
                        onScroll={
                            Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { y: scrollY },
                                        },
                                    },
                                ],
                                { useNativeDriver: false }
                            ) as any
                        }
                        scrollEventThrottle={16}
                    >
                        <View style={styles.contentBorder}>
                            {calendar?.length > 0 &&
                                calendar.map((item, index) => (
                                    <React.Fragment key={`event_${index}`}>
                                        <CalendarRow event={item} />
                                        {index !== calendar.length - 1 && (
                                            <Divider iosPaddingLeft={16} />
                                        )}
                                    </React.Fragment>
                                ))}
                        </View>
                        <CalendarFooter />
                    </ScrollView>
                </View>

                {/* Page 2: Exams */}
                <View>
                    <ScrollView
                        contentContainerStyle={styles.itemsContainer}
                        style={styles.viewHorizontal}
                        onScroll={
                            Animated.event(
                                [
                                    {
                                        nativeEvent: {
                                            contentOffset: { y: scrollY },
                                        },
                                    },
                                ],
                                { useNativeDriver: false }
                            ) as any
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetchingByUser}
                                onRefresh={() => {
                                    void refetchByUser()
                                }}
                            />
                        }
                        scrollEventThrottle={16}
                        scrollEnabled={!isError}
                    >
                        {isLoading ? (
                            <LoadingIndicator />
                        ) : isError ? (
                            <ErrorView
                                title={error?.message ?? t('error.title')}
                                onButtonPress={() => {
                                    void refetchByUser()
                                }}
                                inModal
                            />
                        ) : isPaused && !isSuccess ? (
                            <ErrorView title={networkError} inModal />
                        ) : userKind === USER_GUEST ? (
                            <ErrorView title={guestError} inModal />
                        ) : (
                            <View>
                                <View style={styles.contentBorder}>
                                    {exams != null && exams.length > 0 ? (
                                        <>
                                            {exams.map((item, index) => (
                                                <React.Fragment
                                                    key={`exam_${index}`}
                                                >
                                                    <ExamRow event={item} />
                                                    {index !==
                                                        exams.length - 1 && (
                                                        <Divider
                                                            iosPaddingLeft={16}
                                                        />
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </>
                                    ) : (
                                        <ErrorView
                                            title={t(
                                                'pages.calendar.exams.noExams.title'
                                            )}
                                            message={t(
                                                'pages.calendar.exams.noExams.subtitle'
                                            )}
                                            icon={{
                                                ios: 'calendar.badge.clock',
                                                android: 'calendar_clock',
                                            }}
                                            buttonText="Primuss"
                                            onButtonPress={() => {
                                                void Linking.openURL(primussUrl)
                                            }}
                                            inModal
                                            isCritical={false}
                                        />
                                    )}
                                </View>
                                <CalendarFooter />
                            </View>
                        )}
                    </ScrollView>
                </View>
            </PagerView>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentBorder: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
    },
    footerContainer: {
        marginVertical: 10,
    },
    footerText1: {
        color: theme.colors.labelColor,
        fontSize: 12,
        fontWeight: 'normal',
        paddingBottom: 25,
        textAlign: 'justify',
    },
    footerText2: {
        color: theme.colors.text,
        textDecorationLine: 'underline',
    },
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        marginHorizontal: theme.margins.page,
        width: '100%',
    },
    pagerContainer: {
        flex: 1,
    },
    toggleContainer: {
        borderColor: theme.colors.border,
        paddingBottom: 12,
    },
    viewHorizontal: {
        paddingHorizontal: theme.margins.page,
    },
    viewVertical: {
        paddingVertical: theme.margins.page,
    },
}))
