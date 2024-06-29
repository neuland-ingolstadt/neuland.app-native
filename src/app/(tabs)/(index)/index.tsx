import NeulandAPI from '@/api/neuland-api'
import PopUpCard from '@/components/Cards/PopUpCard'
import { HomeBottomSheet } from '@/components/Elements/Flow/HomeBottomSheet'
import { Avatar } from '@/components/Elements/Settings'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import {
    DashboardContext,
    ThemeContext,
    UserKindContext,
} from '@/components/contexts'
import {
    USER_EMPLOYEE,
    USER_STUDENT,
    type UserKindContextType,
} from '@/hooks/contexts/userKind'
import { getPersonalData, getUsername, performLogout } from '@/utils/api-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import { useTheme } from '@react-navigation/native'
import { MasonryFlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { useNavigation, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, {
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Dimensions,
    LayoutAnimation,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function HomeRootScreen(): JSX.Element {
    const colors = useTheme().colors as Colors

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [notification, setNotification] = useState<any>(undefined)
    const notificationListener = useRef<any>()
    const responseListener = useRef<any>()

    useEffect(() => {
        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {
                setNotification(notification)
            })

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log(response)
                }
            )

        return () => {
            Notifications.removeNotificationSubscription(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                notificationListener.current
            )
            Notifications.removeNotificationSubscription(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                responseListener.current
            )
        }
    }, [])

    const [isPageOpen, setIsPageOpen] = useState(false)

    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    const safeArea = useSafeAreaInsets()
    const topInset = safeArea.top
    const hasDynamicIsland = Platform.OS === 'ios' && topInset > 50
    const navigation = useNavigation()
    const isFocused = useNavigation().isFocused()
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)
    const BottomSheet = (): JSX.Element => {
        return (
            <BottomSheetModal
                index={0}
                ref={bottomSheetModalRef}
                snapPoints={['45%', '70%']}
                backgroundStyle={{
                    backgroundColor: colors.background,
                }}
                handleIndicatorStyle={{
                    backgroundColor: colors.labelColor,
                }}
            >
                <BottomSheetScrollView>
                    <HomeBottomSheet
                        bottomSheetModalRef={bottomSheetModalRef}
                    />
                </BottomSheetScrollView>
            </BottomSheetModal>
        )
    }

    useEffect(() => {
        // @ts-expect-error - no types for tabPress
        const unsubscribe = navigation.addListener('tabLongPress', () => {
            if (isFocused) {
                bottomSheetModalRef.current?.present()
            }
        })

        return unsubscribe
    }, [navigation, isFocused])

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <title>Dashboard</title>
                <meta name="Dashboard" content="Customizable Dashboard" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <BottomSheetModalProvider>
                <BottomSheet />
                <View
                    style={{
                        ...styles.page,
                        // workaround for status bar overlapping the header on iPhones with dynamic island
                        ...(hasDynamicIsland
                            ? {
                                  paddingTop: topInset,
                                  backgroundColor: colors.card,
                              }
                            : {}),
                    }}
                >
                    {Platform.OS === 'ios' ? (
                        <WorkaroundStack
                            name={'Dashboard'}
                            titleKey={'Neuland Next'}
                            component={isPageOpen ? HomeScreen : () => <></>}
                            largeTitle={true}
                            transparent={false}
                        />
                    ) : (
                        <HomeScreen />
                    )}
                </View>
            </BottomSheetModalProvider>
        </>
    )
}

function HomeScreen(): JSX.Element {
    const { shownDashboardEntries } = React.useContext(DashboardContext)
    const [orientation, setOrientation] = useState(
        Dimensions.get('window').width
    )
    const [columns, setColumns] = useState(
        Math.floor(Dimensions.get('window').width < 800 ? 1 : 2)
    )

    const { t } = useTranslation(['navigation', 'settings'])
    const { data } = useQuery({
        queryKey: ['announcements'],
        queryFn: async () => await NeulandAPI.getAnnouncements(),
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    const navigation = useNavigation()
    const [initials, setInitials] = useState('')
    const [username, setUsername] = useState<string>('')
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const isDark = useTheme().dark
    const { userFullName, userKind } =
        useContext<UserKindContextType>(UserKindContext)

    const { toggleUserKind } = useContext(UserKindContext)
    const { toggleAccentColor } = useContext(ThemeContext)
    const { resetOrder } = useContext(DashboardContext)

    useEffect(() => {
        void getUsername().then((username) => {
            setUsername(username)
        })
    }, [])

    const { data: persData } = useQuery({
        queryKey: ['personalData'],
        queryFn: getPersonalData,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
        enabled: userKind === USER_STUDENT,
    })

    const logoutAlert = (): void => {
        Alert.alert(
            t('profile.logout.alert.title', {
                ns: 'settings',
            }),
            t('profile.logout.alert.message', {
                ns: 'settings',
            }),
            [
                {
                    text: t('profile.logout.alert.cancel', {
                        ns: 'settings',
                    }),
                    style: 'cancel',
                },
                {
                    text: t('profile.logout.alert.confirm', { ns: 'settings' }),
                    style: 'destructive',
                    onPress: () => {
                        performLogout(
                            toggleUserKind,
                            toggleAccentColor,
                            resetOrder
                        ).catch((e) => {
                            console.log(e)
                        })
                    },
                },
            ]
        )
    }

    useEffect(() => {
        if (persData !== undefined) {
            setInitials(getInitials(persData.vname + ' ' + persData.name))
        } else if (userKind === USER_EMPLOYEE && username !== null) {
            setInitials(getInitials(username))
        } else {
            setInitials('')
        }
    }, [persData, userKind, username])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={() => {
                        router.push('(user)/settings')
                    }}
                    delayLongPress={300}
                    onLongPress={() => {}}
                    hitSlop={10}
                >
                    <ContextMenu
                        actions={[
                            ...(userKind === 'student'
                                ? [
                                      {
                                          title: t('navigation.profile'),
                                          subtitle:
                                              persData?.vname +
                                              ' ' +
                                              persData?.name,
                                          systemIcon:
                                              Platform.OS === 'ios'
                                                  ? 'person.crop.circle'
                                                  : undefined,
                                      },
                                  ]
                                : []),
                            {
                                title: t('navigation.theme'),
                                systemIcon:
                                    Platform.OS === 'ios'
                                        ? 'paintpalette'
                                        : undefined,
                            },
                            {
                                title: t('navigation.about'),
                                systemIcon:
                                    Platform.OS === 'ios'
                                        ? 'info.circle'
                                        : undefined,
                            },
                            ...(userFullName !== '' && userKind !== 'guest'
                                ? [
                                      {
                                          title: 'Logout',
                                          systemIcon:
                                              Platform.OS === 'ios'
                                                  ? 'person.fill.xmark'
                                                  : undefined,
                                          destructive: true,
                                      },
                                  ]
                                : []),
                            ...(userKind === 'guest'
                                ? [
                                      {
                                          title: t('menu.guest.title', {
                                              ns: 'settings',
                                          }),
                                          systemIcon:
                                              Platform.OS === 'ios'
                                                  ? 'person.fill.questionmark'
                                                  : undefined,
                                      },
                                  ]
                                : []),
                        ]}
                        onPress={(e) => {
                            if (
                                e.nativeEvent.name === t('navigation.profile')
                            ) {
                                router.push('profile')
                            } else if (
                                e.nativeEvent.name === t('navigation.theme')
                            ) {
                                router.push('theme')
                            } else if (
                                e.nativeEvent.name === t('navigation.about')
                            ) {
                                router.push('about')
                            } else if (e.nativeEvent.name === 'Logout') {
                                logoutAlert()
                            } else if (
                                e.nativeEvent.name ===
                                t('menu.guest.title', { ns: 'settings' })
                            ) {
                                router.push('login')
                            }
                        }}
                        onPreviewPress={() => {
                            router.push('(user)/settings')
                        }}
                    >
                        {initials !== '' ? (
                            userKind === 'student' &&
                            persData?.mtknr === undefined ? (
                                <View>
                                    <PlatformIcon
                                        color={colors.text}
                                        ios={{
                                            name: 'person.crop.circle.badge.exclamationmark',
                                            size: 22,
                                        }}
                                        android={{
                                            name: 'account_circle_off',
                                            size: 26,
                                        }}
                                    />
                                </View>
                            ) : (
                                <View>
                                    <Avatar
                                        size={29}
                                        background={colors.primary}
                                        shadow={false}
                                    >
                                        <Text
                                            style={{
                                                color: getContrastColor(
                                                    colors.primary
                                                ),
                                                ...styles.iconText,
                                            }}
                                            numberOfLines={1}
                                            adjustsFontSizeToFit={true}
                                        >
                                            {initials}
                                        </Text>
                                    </Avatar>
                                </View>
                            )
                        ) : (
                            <View>
                                <PlatformIcon
                                    color={isDark ? 'white' : 'black'}
                                    ios={{
                                        name: 'person.crop.circle',
                                        size: 22,
                                    }}
                                    android={{
                                        name: 'account_circle',
                                        size: 26,
                                    }}
                                />
                            </View>
                        )}
                    </ContextMenu>
                </Pressable>
            ),
        })
    }, [
        navigation,
        userKind,
        data,
        initials,
        userFullName,
        router,
        t,
        isDark,
        colors.primary,
    ])

    useEffect(() => {
        const handleOrientationChange = (): void => {
            setOrientation(Dimensions.get('window').width)
            setColumns(Math.floor(Dimensions.get('window').width < 500 ? 1 : 2))
        }

        const subscription = Dimensions.addEventListener(
            'change',
            handleOrientationChange
        )

        return () => {
            subscription.remove()
        }
    }, [])

    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }, [shownDashboardEntries])

    return shownDashboardEntries === null ||
        shownDashboardEntries.length === 0 ? (
        <View style={styles.errorContainer}>
            <ErrorView
                title={t('dashboard.noShown', { ns: 'settings' })}
                message={t('dashboard.noShownDescription', { ns: 'settings' })}
                icon={{
                    ios: 'rainbow',
                    multiColor: true,
                    android: 'dashboard_customize',
                }}
                buttonText={t('dashboard.noShownButton', { ns: 'settings' })}
                onButtonPress={() => {
                    router.push('(user)/dashboard')
                }}
            />
        </View>
    ) : (
        <>
            <MasonryFlashList
                key={orientation}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                data={shownDashboardEntries}
                renderItem={({ item, index }) => {
                    let paddingStyle = {}

                    if (columns !== 1) {
                        paddingStyle =
                            index % 2 === 0
                                ? { paddingRight: PAGE_PADDING / 2 }
                                : { paddingLeft: PAGE_PADDING / 2 }
                    }

                    return (
                        <View style={[styles.item, paddingStyle]}>
                            {item.card()}
                        </View>
                    )
                }}
                keyExtractor={(item) => item.key}
                numColumns={columns}
                estimatedItemSize={100}
                ListHeaderComponent={() =>
                    data !== undefined ? (
                        <PopUpCard data={data?.announcements} />
                    ) : (
                        <></>
                    )
                }
            />
        </>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
    },
    errorContainer: { paddingTop: 110 },
    item: {
        marginVertical: 6,
    },
    container: {
        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
        paddingTop: 6,
        paddingHorizontal: PAGE_PADDING,
    },
    iconText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
})
