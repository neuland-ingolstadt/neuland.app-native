import ErrorView from '@/components/Elements/Error/ErrorView'
import CLEventRow from '@/components/Elements/Rows/EventRow'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { loadCampusLifeEvents } from '@/utils/events-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { pausedToast } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'

export default function Events(): JSX.Element {
    const colors = useTheme().colors as Colors

    const { t } = useTranslation('common')

    const { data, error, isLoading, isError, isPaused, isSuccess, refetch } =
        useQuery({
            queryKey: ['campusLifeEvents'],
            queryFn: loadCampusLifeEvents,
            staleTime: 1000 * 60 * 60, // 60 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        })
    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    useEffect(() => {
        if (isPaused && data != null) {
            pausedToast()
        }
    }, [isPaused])

    return (
        <ScrollView
            style={styles.page}
            refreshControl={
                !isLoading ? (
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
                    title={error?.message ?? t('error.title')}
                    onRefresh={refetchByUser}
                    refreshing={false}
                />
            )}
            {isPaused && !isSuccess && (
                <ErrorView
                    title={networkError}
                    onRefresh={refetchByUser}
                    refreshing={false}
                />
            )}
            {isSuccess && (
                <View
                    style={[
                        styles.loadedContainer,
                        { backgroundColor: colors.card },
                    ]}
                >
                    {data.map((event, index) => (
                        <React.Fragment key={index}>
                            <CLEventRow event={event} colors={colors} />
                            {index !== data.length - 1 && (
                                <Divider
                                    color={colors.labelTertiaryColor}
                                    iosPaddingLeft={16}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </View>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadedContainer: {
        alignSelf: 'center',
        width: '100%',
        borderRadius: 8,
        justifyContent: 'center',
        marginBottom: 64,
    },
})
