import ErrorView from '@/components/Elements/Error/ErrorView'
import CLEventRow from '@/components/Elements/Rows/EventRow'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { useRefreshByUser } from '@/hooks'
import { type CLEvents } from '@/types/neuland-api'
import { networkError } from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { type UseQueryResult } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Animated,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'

export default function ClEventsPage({
    clEventsResult,
}: {
    clEventsResult: UseQueryResult<CLEvents[], Error>
}): JSX.Element {
    const colors = useTheme().colors as Colors
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
                    <ActivityIndicator size="small" color={colors.primary} />
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
                    <View
                        style={{
                            backgroundColor: colors.card,
                            ...styles.contentBorder,
                        }}
                    >
                        {clEventsResult.data != null &&
                        clEventsResult.data.length > 0 ? (
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    ...styles.contentBorder,
                                }}
                            >
                                {clEventsResult.data?.map((event, index) => (
                                    <React.Fragment key={index}>
                                        <CLEventRow
                                            event={event}
                                            colors={colors}
                                        />
                                        {index !==
                                            clEventsResult.data.length - 1 && (
                                            <Divider
                                                color={
                                                    colors.labelTertiaryColor
                                                }
                                                iosPaddingLeft={16}
                                            />
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

const styles = StyleSheet.create({
    itemsContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        width: '100%',
        marginHorizontal: PAGE_PADDING,
    },

    contentBorder: {
        borderRadius: 8,
    },
})
