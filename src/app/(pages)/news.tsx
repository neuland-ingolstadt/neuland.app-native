import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import Divider from '@/components/Elements/Universal/Divider'
import ErrorGuestView from '@/components/Elements/Universal/ErrorView'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { type ThiNews } from '@/types/thi-api'
import { formatFriendlyDate } from '@/utils/date-utils'
import { MODAL_BOTTOM_MARGIN, PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function NewsScreen(): JSX.Element {
    const colors = useTheme().colors as Colors
    const [news, setNews] = useState<ThiNews[] | null>(null)
    const [errorMsg, setErrorMsg] = useState('')

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
            if (e instanceof NoSessionError) {
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
        <View>
            {loadingState === LoadingState.LOADING && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}
            {loadingState === LoadingState.ERROR && (
                <View style={styles.errorContainer}>
                    <ErrorGuestView
                        title={errorMsg}
                        onRefresh={onRefresh}
                        refreshing={false}
                    />
                </View>
            )}
            {loadingState === LoadingState.LOADED && (
                <FlatList
                    data={news}
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
                                            name: 'chevron-right',
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
            )}
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
