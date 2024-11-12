import API from '@/api/authenticated-api'
import ErrorView from '@/components/Elements/Error/ErrorView'
import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import LoadingIndicator from '@/components/Elements/Universal/LoadingIndicator'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import {
    FlatList,
    Image,
    Linking,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function NewsScreen(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { data, error, isLoading, isError, isPaused, isSuccess, refetch } =
        useQuery({
            queryKey: ['thiNews'],
            queryFn: async () => await API.getThiNews(),
            staleTime: 1000 * 60 * 10, // 10 minutes
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        })
    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    return (
        <View>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <LoadingIndicator />
                </View>
            ) : isError ? (
                <View style={styles.errorContainer}>
                    <ErrorView
                        title={error.message}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                        refreshing={false}
                    />
                </View>
            ) : isPaused && !isSuccess ? (
                <View style={styles.errorContainer}>
                    <ErrorView
                        title={networkError}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                        refreshing={false}
                    />
                </View>
            ) : isSuccess && data !== null ? (
                <FlatList
                    data={data}
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
                    keyExtractor={(item) => item.href}
                    contentContainerStyle={styles.contentContainer}
                    renderItem={({ item }) => (
                        <View style={styles.sectionContainer} key={item.title}>
                            <Text style={styles.dateText}>
                                {formatFriendlyDate(item.date)}
                            </Text>
                            <Pressable
                                style={styles.sectionBox}
                                onPress={() => {
                                    void Linking.openURL(item.href)
                                }}
                            >
                                <Image
                                    style={styles.imageContainer}
                                    source={{
                                        uri: item.img,
                                    }}
                                />

                                <View style={styles.titleContainer}>
                                    <Text
                                        style={styles.titleText}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>
                                    <PlatformIcon
                                        ios={{
                                            name: 'chevron.forward',
                                            size: 15,
                                        }}
                                        android={{
                                            name: 'chevron_right',
                                            size: 16,
                                        }}
                                        style={styles.icon}
                                    />
                                </View>
                                <Divider width={'100%'} />
                                <Text style={styles.teaserText}>
                                    {item.teaser}
                                </Text>
                            </Pressable>
                        </View>
                    )}
                />
            ) : null}
        </View>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentContainer: {
        gap: 18,
        paddingBottom: MODAL_BOTTOM_MARGIN,
        paddingTop: Platform.OS === 'ios' ? 105 : 5,
        padding: PAGE_PADDING,
    },
    dateText: {
        color: theme.colors.labelSecondaryColor,
        fontSize: 13,
        fontWeight: 'normal',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    errorContainer: {
        height: Platform.OS === 'ios' ? '90%' : '100%',
        paddingTop: Platform.OS === 'ios' ? 0 : 100,
    },
    icon: {
        color: theme.colors.labelColor,
    },
    imageContainer: {
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        height: 200,
        objectFit: 'cover',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 140 : 40,
    },
    sectionBox: {
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: 8,
        borderWidth: StyleSheet.hairlineWidth,
        justifyContent: 'center',
        width: '100%',
    },
    sectionContainer: {
        alignSelf: 'center',
        width: '100%',
    },
    teaserText: {
        color: theme.colors.text,
        fontSize: 14,
        marginHorizontal: 12,
        marginVertical: 6,
    },
    titleContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        marginHorizontal: 12,
        minHeight: 40,
    },
    titleText: {
        color: theme.colors.text,
        flexShrink: 1,
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        marginVertical: 8,
        textAlign: 'left',
    },
}))
