import { MealDay } from '@/components/Elements/Food'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { FoodFilterContext } from '@/components/provider'
import { type Food } from '@/types/neuland-api'
import { loadFoodEntries } from '@/utils/food-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState, getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import Head from 'expo-router/head'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import InfinitePager from 'react-native-infinite-pager'

function FoodScreen(): JSX.Element {
    const [days, setDays] = useState<any>([])
    const colors = useTheme().colors as Colors
    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )
    const [selectedDay, setSelectedDay] = useState<number>(0)
    const {
        selectedRestaurants,
        showStatic,
        allergenSelection,
        initAllergenSelection,
    } = useContext(FoodFilterContext)
    const [error, setError] = useState<Error | null>(null)
    const { t, i18n } = useTranslation('common')
    const loadData = (): void => {
        loadFoodEntries(selectedRestaurants, showStatic)
            .then((loadedDays: Food[]) => {
                const filteredDays: Food[] = loadedDays.filter(
                    (day: Food) =>
                        new Date(day.timestamp).getTime() >=
                        new Date().setHours(0, 0, 0, 0)
                )
                const formattedDays: Food[] = filteredDays.map((day: Food) => ({
                    timestamp: day.timestamp,
                    meals: day.meals,
                }))
                if (formattedDays.length === 0) {
                    setError(new Error('No meals available'))
                    setLoadingState(LoadingState.ERROR)
                    return
                }
                setDays(formattedDays)
                setLoadingState(LoadingState.LOADED)
            })
            .catch((e: Error) => {
                setError(e)
                setLoadingState(LoadingState.ERROR)
            })
    }

    const onRefresh: () => void = () => {
        loadData()
    }

    useEffect(() => {
        loadData()
    }, [selectedRestaurants, showStatic])

    const pagerRef = useRef(null)

    /**
     * Renders a button for a specific day's food data.
     * @param {Food} day - The food data for the day.
     * @param {number} index - The index of the day in the list of days.
     * @returns {JSX.Element} - The rendered button component.
     */
    const DayButton = ({
        day,
        index,
    }: {
        day: Food
        index: number
    }): JSX.Element => {
        const date = new Date(day.timestamp)
        const { colors } = useTheme()

        const daysCnt = days.length < 5 ? days.length : 5
        const isFirstDay = index === 0
        const isLastDay = index === daysCnt - 1

        const buttonStyle = [
            { flex: 1, marginHorizontal: 4 },
            isFirstDay ? { marginLeft: 0 } : null,
            isLastDay ? { marginRight: 0 } : null,
        ]
        return (
            <View style={buttonStyle} key={index}>
                <Pressable
                    onPress={() => {
                        // only vibrate on iOS
                        if (Platform.OS === 'ios' && index !== selectedDay) {
                            void Haptics.selectionAsync()
                        }
                        setSelectedDay(index)
                        // @ts-expect-error - setPage is not defined in the type definition
                        pagerRef.current?.setPage(index, {
                            animated: Math.abs(selectedDay - index) === 1,
                        })
                    }}
                >
                    <View
                        style={[
                            styles.dayButtonContainer,
                            {
                                backgroundColor: colors.card,
                                shadowColor: colors.text,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color:
                                    selectedDay === index
                                        ? colors.primary
                                        : colors.text,
                                fontWeight:
                                    selectedDay === index ? '600' : '500',
                                fontSize: 16,
                            }}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        >
                            {date
                                .toLocaleDateString(i18n.language, {
                                    weekday: 'short',
                                })
                                .slice(0, 2)}
                        </Text>
                        <Text
                            style={{
                                color:
                                    selectedDay === index
                                        ? colors.primary
                                        : colors.text,
                                fontSize: 15,
                                fontWeight:
                                    selectedDay === index ? '500' : 'normal',
                            }}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}
                        >
                            {date.toLocaleDateString('de-DE', {
                                day: 'numeric',
                                month: 'numeric',
                            })}
                        </Text>
                    </View>
                </Pressable>
            </View>
        )
    }

    const AllergensBanner = (): JSX.Element => {
        const contrastTextColor = getContrastColor(colors.primary)
        return (
            <View style={styles.paddingContainer}>
                <View
                    style={{
                        backgroundColor: colors.primary,
                        ...styles.bannerContainer,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            initAllergenSelection()
                        }}
                        hitSlop={6}
                        style={styles.dismissButton}
                    >
                        <PlatformIcon
                            ios={{
                                name: 'xmark',
                                size: 16,
                            }}
                            android={{
                                name: 'close',
                                size: 20,
                            }}
                            color={contrastTextColor}
                        />
                    </TouchableOpacity>
                    <View>
                        <TouchableOpacity
                            onPress={() => {
                                router.push('(food)/allergens')
                            }}
                        >
                            <Text
                                style={{
                                    color: contrastTextColor,
                                    ...styles.bannerTitle,
                                }}
                            >
                                {t('navigation.allergens', {
                                    ns: 'navigation',
                                })}
                            </Text>

                            <Text
                                style={{
                                    color: contrastTextColor,
                                    ...styles.bannerText,
                                }}
                            >
                                {t('empty.config', { ns: 'food' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
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
            style={styles.page}
            contentInsetAdjustmentBehavior="always"
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
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
                        {t('error.refreshPull')}{' '}
                    </Text>
                </View>
            )}

            {loadingState === LoadingState.LOADED && (
                <>
                    {allergenSelection.length === 1 &&
                        allergenSelection[0] === 'not-configured' && (
                            <AllergensBanner />
                        )}

                    <View style={styles.loadedContainer}>
                        {days.slice(0, 5).map((day: Food, index: number) => (
                            <DayButton day={day} index={index} key={index} />
                        ))}
                    </View>
                    <InfinitePager
                        ref={pagerRef}
                        PageComponent={({ index }) => (
                            <View style={styles.paddingContainer}>
                                <MealDay
                                    index={index}
                                    day={days[index + 1]}
                                    colors={colors}
                                />
                            </View>
                        )}
                        minIndex={0}
                        maxIndex={Math.min(days.length - 2, 4)}
                        onPageChange={(index) => {
                            setSelectedDay(index)
                        }}
                    ></InfinitePager>
                </>
            )}
        </ScrollView>
    )
}

export default function Screen(): JSX.Element {
    const colors = useTheme().colors as Colors
    return (
        <>
            <Head>
                <title>Food</title>
                <meta name="Food" content="Meal plan for the canteens" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <WorkaroundStack
                name={'Food'}
                titleKey={'navigation.food'}
                component={FoodScreen}
                largeTitle={false}
                headerRightElement={() => (
                    <Pressable
                        onPress={() => {
                            router.push('(food)/preferences')
                        }}
                        hitSlop={10}
                    >
                        <View>
                            <PlatformIcon
                                color={colors.text}
                                ios={{
                                    name: 'line.3.horizontal.decrease',
                                    size: 22,
                                }}
                                android={{
                                    name: 'filter',
                                    size: 24,
                                }}
                            />
                        </View>
                    </Pressable>
                )}
            />
        </>
    )
}

const styles = StyleSheet.create({
    page: {
        paddingVertical: PAGE_PADDING,
    },
    headerButton: {
        backgroundColor: 'transparent',
        paddingRight: 10,
    },
    container: {
        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
    },
    dayRestaurantContainer: {
        width: '92%',
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    dayRestaurantTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        paddingBottom: 5,
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
    loadedContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    loadingContainer: {
        paddingTop: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayButtonContainer: {
        width: '100%',
        height: 60,
        alignSelf: 'center',
        alignContent: 'center',
        borderRadius: 8,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        paddingVertical: 8,
    },
    bannerContainer: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    dismissButton: {
        position: 'absolute',
        zIndex: 1,
        top: 5,
        right: 5,
        padding: 5,
        borderRadius: 8,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    bannerText: {
        marginTop: 3,
        fontSize: 14,
    },
    paddingContainer: {
        paddingHorizontal: 12,
    },
})
