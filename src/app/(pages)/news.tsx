import API from '@/api/authenticated-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/components/colors'
import { type ThiNews } from '@/types/thi-api'
import { formatFriendlyDate } from '@/utils/date-utils'
import {
    CARD_PADDING,
    MODAL_BOTTOM_MARGIN,
    PAGE_PADDING,
} from '@/utils/style-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation('common')
    const [news, setNews] = useState<ThiNews[] | null>(null)
    const [errorMsg, setErrorMsg] = useState('')

    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }

    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )

    /**
     * Loads all news from the API and sets the state accordingly.
     * @returns {Promise<void>} A promise that resolves when all news have been loaded.
     */
    async function loadNews(): Promise<void> {
        try {
            const news = await API.getThiNews()
            setNews(news)
            setLoadingState(LoadingState.LOADED)
        } catch (e: any) {
            setLoadingState(LoadingState.ERROR)
            if (
                e instanceof NoSessionError ||
                e instanceof UnavailableSessionError
            ) {
                router.push('(user)/login')
            } else {
                setErrorMsg(e.message)
                console.error(e)
            }
        }
    }

    useEffect(() => {
        void loadNews()
    }, [])

    const onRefresh: () => void = () => {
        void loadNews()
    }

    return (
        <View style={Platform.OS === 'ios' ? styles.safeArea : {}}>
            {loadingState === LoadingState.LOADING && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}
            {loadingState === LoadingState.ERROR && (
                <View>
                    <Text style={[styles.errorMessage, { color: colors.text }]}>
                        {errorMsg}
                    </Text>
                    <Text style={[styles.errorInfo, { color: colors.text }]}>
                        {t('error.refresh')}{' '}
                    </Text>
                </View>
            )}
            {loadingState === LoadingState.LOADED && (
                <FlatList
                    data={news}
                    keyExtractor={(item) => item.href}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        loadingState !== LoadingState.LOADED ? (
                            <RefreshControl
                                refreshing={
                                    loadingState === LoadingState.REFRESHING
                                }
                                onRefresh={onRefresh}
                            />
                        ) : undefined
                    }
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
                                    <Ionicons
                                        name="chevron-forward-outline"
                                        size={24}
                                        color={colors.labelColor}
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
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    safeArea: {
        flex: 1,
        marginTop: 100,
    },
    dateText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    contentContainer: {
        gap: 12,
        padding: PAGE_PADDING,
        paddingBottom: MODAL_BOTTOM_MARGIN,
    },
    imageContainer: {
        marginHorizontal: -CARD_PADDING,
        marginTop: -CARD_PADDING,
        height: 200,
        objectFit: 'cover',
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    teaserText: {
        fontSize: 13,
        fontWeight: 'normal',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    titleText: {
        fontSize: 15,
        flexShrink: 1,
        fontWeight: '700',
        textAlign: 'left',
        flex: 1,
    },
    sectionContainer: {
        width: '100%',
        alignSelf: 'center',
    },
    sectionBox: {
        alignSelf: 'center',
        borderRadius: 8,
        padding: CARD_PADDING,
        gap: 6,
        width: '100%',
        justifyContent: 'center',
    },
    // OTHER VIEWS
    errorMessage: {
        paddingTop: 100,
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorInfo: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
