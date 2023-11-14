import API from '@/api/authenticated-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import { type Colors } from '@/stores/colors'
import { formatFriendlyDate } from '@/utils/date-utils'
import { type ThiNews } from '@customTypes/thi-api'
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
            <View>
                {loadingState === LoadingState.LOADING && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
                {loadingState === LoadingState.ERROR && (
                    <View>
                        <Text
                            style={[
                                styles.errorMessage,
                                { color: colors.text },
                            ]}
                        >
                            {errorMsg}
                        </Text>
                        <Text
                            style={[styles.errorInfo, { color: colors.text }]}
                        >
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
                            <View
                                style={styles.sectionContainer}
                                key={item.title}
                            >
                                <Text
                                    style={[
                                        styles.labelText,
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
                                    <View>
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
                                                style={{}}
                                            />
                                        </View>
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
        </View>
    )
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, marginTop: 100 },
    contentContainer: { paddingBottom: 32 },
    labelText: {
        fontSize: 13,
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    imageContainer: {
        width: '100%',
        height: 200,
        objectFit: 'cover',
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
    },
    teaserText: {
        fontSize: 13,
        fontWeight: 'normal',
        marginHorizontal: 10,
        textAlign: 'justify',
        paddingVertical: 10,
    },
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    titleText: {
        paddingVertical: 14,
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'left',
    },
    sectionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        width: '100%',
        alignSelf: 'center',
    },
    sectionBox: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '100%',
        marginTop: 2,
        justifyContent: 'center',
    },
})
