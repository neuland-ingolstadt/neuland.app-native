import { type CampusLifeEventFieldsFragment } from '@/__generated__/gql/graphql'
import ErrorView from '@/components/Error/ErrorView'
import CLEventRow from '@/components/Rows/EventRow'
import Divider from '@/components/Universal/Divider'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { type UseQueryResult } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, RefreshControl, ScrollView, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import LoadingIndicator from '../Universal/LoadingIndicator'

export default function ClEventsPage({
    clEventsResult,
}: {
    clEventsResult: UseQueryResult<CampusLifeEventFieldsFragment[], Error>
}): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t } = useTranslation('common')

    const {
        isRefetchingByUser: isRefetchingByUserClEvents,
        refetchByUser: refetchByUserClEvents,
    } = useRefreshByUser(clEventsResult.refetch)

    const scrollY = new Animated.Value(0)
    return (
        <View>
            <ScrollView
                contentContainerStyle={styles.itemsContainer}
                style={styles.page}
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
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetchingByUserClEvents}
                        onRefresh={() => {
                            void refetchByUserClEvents()
                        }}
                    />
                }
            >
                {clEventsResult.isLoading ? (
                    <LoadingIndicator />
                ) : clEventsResult.isError ? (
                    <ErrorView
                        title={
                            clEventsResult.error?.message ?? t('error.title')
                        }
                        onButtonPress={() => {
                            void refetchByUserClEvents()
                        }}
                        inModal
                    />
                ) : clEventsResult.isPaused && !clEventsResult.isSuccess ? (
                    <ErrorView title={networkError} inModal />
                ) : (
                    <View style={styles.contentBorder}>
                        {clEventsResult.data != null &&
                        clEventsResult.data.length > 0 ? (
                            <View style={styles.contentBorder}>
                                {clEventsResult.data?.map((event, index) => (
                                    <React.Fragment key={index}>
                                        <CLEventRow event={event} />
                                        {index !==
                                            clEventsResult.data.length - 1 && (
                                            <Divider iosPaddingLeft={16} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </View>
                        ) : (
                            <ErrorView
                                title={t('pages.calendar.exams.noExams.title')}
                                message={t(
                                    'pages.calendar.exams.noExams.subtitle'
                                )}
                                icon={{
                                    ios: 'calendar.badge.clock',
                                    android: 'calendar_clock',
                                    web: 'CalendarClock',
                                }}
                                inModal
                                isCritical={false}
                            />
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentBorder: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
    },
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        marginHorizontal: theme.margins.page,
        paddingBottom: theme.margins.bottomSafeArea,
        width: '100%',
    },
    page: {
        paddingHorizontal: theme.margins.page,
    },
}))
