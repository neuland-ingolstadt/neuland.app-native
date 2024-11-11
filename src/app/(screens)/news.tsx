import API from '@/api/authenticated-api'
import ErrorView from '@/components/Elements/Error/ErrorView'
import Divider from '@/components/Elements/Universal/Divider'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import {
    ActivityIndicator,
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
                    <ActivityIndicator
                        size="small"
                        color={styles.activityIndicator.color}
                    />
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
    errorContainer: {
        paddingTop: Platform.OS === 'ios' ? 0 : 100,
        height: Platform.OS === 'ios' ? '90%' : '100%',
    },

    dateText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 6,
        color: theme.colors.labelSecondaryColor,
    },
    contentContainer: {
        paddingTop: Platform.OS === 'ios' ? 105 : 5,
        gap: 18,
        padding: PAGE_PADDING,
        paddingBottom: MODAL_BOTTOM_MARGIN,
    },
    imageContainer: {
        height: 200,
        objectFit: 'cover',
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    teaserText: {
        fontSize: 14,
        marginHorizontal: 12,
        marginVertical: 6,
        color: theme.colors.text,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        gap: 10,
        minHeight: 40,
    },
    titleText: {
        fontSize: 16,
        flexShrink: 1,
        fontWeight: '700',
        textAlign: 'left',
        flex: 1,
        marginVertical: 8,
        color: theme.colors.text,
    },
    sectionContainer: {
        width: '100%',
        alignSelf: 'center',
    },
    sectionBox: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        justifyContent: 'center',
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: StyleSheet.hairlineWidth,
    },
    loadingContainer: {
        paddingTop: Platform.OS === 'ios' ? 140 : 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicator: {
        color: theme.colors.primary,
    },
    icon: {
        color: theme.colors.labelColor,
    },
}))
