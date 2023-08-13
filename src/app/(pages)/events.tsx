import NeulandAPI from '@/api/neuland-api'
import Divider from '@/components/Divider'
import { type Colors } from '@/stores/colors'
import clubs from '@/stores/data/clubs.json'
import { type CLEvents } from '@/stores/types/neuland-api'
import {
    formatFriendlyDateTimeRange,
    formatFriendlyRelativeTime,
} from '@/utils/date-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { RefreshControl } from 'react-native-gesture-handler'

export default function Events(): JSX.Element {
    const [events, setEvents] = useState<CLEvents[]>([])
    const colors = useTheme().colors as Colors
    enum LoadingState {
        LOADING,
        LOADED,
        ERROR,
        REFRESHING,
    }
    const [error, setError] = useState<Error | null>(null)
    const [loadingState, setLoadingState] = useState(LoadingState.LOADING)
    useEffect(() => {
        void loadEvents()
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }, [])

    async function loadEvents(): Promise<void> {
        const campusLifeEvents =
            (await NeulandAPI.getCampusLifeEvents()) as CLEvents[]

        const newEvents = campusLifeEvents.map((x) => ({
            ...x,
            begin: x.begin !== null ? new Date(x.begin) : null,
            end: x.end !== null ? new Date(x.end) : null,
        }))
        setEvents(newEvents)
    }

    const EventCard = ({
        event,
        colors,
    }: {
        event: CLEvents
        colors: Colors
    }): JSX.Element => {
        const club = clubs.find((club) => club.club === event.organizer)
        return (
            <>
                {Platform.OS === 'ios' && (
                    <StatusBar
                        style={colors.text === '#000000' ? 'dark' : 'light'}
                    />
                )}
                <View style={styles.eventContainer}>
                    <View style={styles.detailsContainer}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.text,
                                marginBottom: 1,
                            }}
                            numberOfLines={2}
                            textBreakStrategy="highQuality"
                        >
                            {event.title}
                        </Text>

                        <Text
                            style={{
                                fontSize: 15,
                                color: colors.labelColor,
                                fontWeight: '500',
                                marginBottom: 4,
                            }}
                            numberOfLines={2}
                        >
                            {event.organizer}
                        </Text>
                        <Text
                            style={{
                                fontSize: 13,
                                color: colors.labelColor,
                            }}
                            numberOfLines={2}
                        >
                            {formatFriendlyDateTimeRange(
                                event.begin,
                                event.end
                            )}
                        </Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                            }}
                        >
                            {club !== undefined && (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    {club.website !== undefined && (
                                        <Ionicons
                                            name="globe"
                                            size={19}
                                            color={colors.labelSecondaryColor}
                                            style={{ marginRight: 7 }}
                                            onPress={() => {
                                                void Linking.openURL(
                                                    club.website
                                                )
                                            }}
                                        />
                                    )}
                                    {club.instagram !== undefined && (
                                        <Ionicons
                                            name="logo-instagram"
                                            size={19}
                                            color={colors.labelSecondaryColor}
                                            onPress={() => {
                                                void Linking.openURL(
                                                    club.instagram
                                                )
                                            }}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '400',
                                color: colors.labelColor,
                            }}
                        >
                            {event.begin != null && (
                                <>
                                    {event.end != null &&
                                    event.begin < new Date()
                                        ? `bis ${formatFriendlyRelativeTime(
                                              event.end
                                          )}`
                                        : formatFriendlyRelativeTime(
                                              event.begin
                                          )}
                                </>
                            )}
                        </Text>
                    </View>
                </View>
            </>
        )
    }

    const onRefresh: () => void = () => {
        void loadEvents()
            .then(() => {
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }

    return (
        <ScrollView
            refreshControl={
                loadingState !== LoadingState.LOADING &&
                loadingState !== LoadingState.LOADED ? (
                    <RefreshControl
                        refreshing={loadingState === LoadingState.REFRESHING}
                        onRefresh={onRefresh}
                    />
                ) : undefined
            }
        >
            {loadingState === LoadingState.LOADING && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}
            {loadingState === LoadingState.ERROR && (
                <View>
                    <Text style={[styles.errorMessage, { color: colors.text }]}>
                        {error?.message}
                    </Text>
                    <Text style={[styles.errorInfo, { color: colors.text }]}>
                        An error occurred while loading the data.{'\n'}Pull down
                        to refresh.
                    </Text>
                </View>
            )}
            {loadingState === LoadingState.LOADED && (
                <View
                    style={[
                        styles.loadedContainer,
                        { backgroundColor: colors.card },
                    ]}
                >
                    {events.map((event, index) => (
                        <React.Fragment key={index}>
                            <EventCard event={event} colors={colors} />
                            {index !== events.length - 1 && (
                                <Divider
                                    color={colors.labelTertiaryColor}
                                    width={'90%'}
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
    eventContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    detailsContainer: {
        flexDirection: 'column',

        alignItems: 'flex-start',
        padding: 5,
        width: '72%',
    },
    rightContainer: {
        alignItems: 'flex-end',
        padding: 5,

        justifyContent: 'space-between',
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadedContainer: {
        alignSelf: 'center',
        borderRadius: 8,
        width: '95%',
        marginTop: 14,
        marginBottom: 24,
        justifyContent: 'center',
    },
})
