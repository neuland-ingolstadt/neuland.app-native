import ErrorView from '@/components/Elements/Error/ErrorView'
import CLEventRow from '@/components/Elements/Rows/EventRow'
import Divider from '@/components/Elements/Universal/Divider'
import { useRefreshByUser } from '@/hooks'
import { type CLEvents } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { type UseQueryResult } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    ScrollView,
    View,
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function ClEventsPage({
    clEventsResult,
}: {
    clEventsResult: UseQueryResult<CLEvents[], Error>
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
                contentContainerStyle={[styles.itemsContainer]}
                style={{ paddingHorizontal: PAGE_PADDING }}
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
                    <ActivityIndicator
                        size="small"
                        color={styles.activityIndicator.color}
                    />
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
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
        marginHorizontal: PAGE_PADDING,
    },

    contentBorder: {
        borderRadius: 8,
        backgroundColor: theme.colors.card,
    },
    activityIndicator: {
        color: theme.colors.primary,
    },
}))
