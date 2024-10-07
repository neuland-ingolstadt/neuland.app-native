import NeulandAPI from '@/api/neuland-api'
import ErrorView from '@/components/Elements/Error/ErrorView'
import { type Colors } from '@/components/colors'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { pausedToast } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function SportsScreen(): JSX.Element {
    const colors = useTheme().colors as Colors

    const { t } = useTranslation('common')

    const { data, isLoading, isError, isPaused, error, refetch, isSuccess } =
        useQuery({
            queryKey: ['universitySports'],
            queryFn: async () => {
                return await NeulandAPI.getUniversitySports()
            },
            staleTime: 1000 * 60 * 10, // 10 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
            retry(failureCount, error) {
                return failureCount < 2
            },
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
                    {data.universitySports.map((event, index) => (
                        <React.Fragment key={index}>
                            <Text> {JSON.stringify(event)} </Text>
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
        marginBottom: MODAL_BOTTOM_MARGIN,
    },
})
