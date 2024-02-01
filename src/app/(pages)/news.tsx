import API from '@/api/authenticated-api'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { useRefreshByUser } from '@/hooks'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
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

export default function NewsScreen(): JSX.Element {
    const colors = useTheme().colors as Colors

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
                    <ActivityIndicator size="small" color={colors.primary} />
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
                            <Text
                                style={[
                                    styles.dateText,
                                    {
                                        color: colors.labelSecondaryColor,
                                    },
                                ]}
                            >
                                {formatFriendlyDate(item.date)}
                            </Text>
                            <Pressable
                                style={[
                                    styles.sectionBox,
                                    {
                                        backgroundColor: colors.card,
                                    },
                                ]}
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
                                        style={[
                                            styles.titleText,
                                            { color: colors.text },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>
                                    <PlatformIcon
                                        color={colors.labelColor}
                                        ios={{
                                            name: 'chevron.forward',
                                            size: 15,
                                        }}
                                        android={{
                                            name: 'chevron_right',
                                            size: 16,
                                        }}
                                    />
                                </View>
                                <Divider width={'100%'} />
                                <Text
                                    style={[
                                        styles.teaserText,
                                        { color: colors.text },
                                    ]}
                                >
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

const styles = StyleSheet.create({
    errorContainer: {
        paddingTop: Platform.OS === 'ios' ? 0 : 100,
        height: Platform.OS === 'ios' ? '90%' : '100%',
    },

    dateText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 6,
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
    },
    loadingContainer: {
        paddingTop: Platform.OS === 'ios' ? 140 : 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
