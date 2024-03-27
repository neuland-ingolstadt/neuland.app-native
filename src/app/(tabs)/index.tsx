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
import { useTheme } from '@react-navigation/native'
import { MasonryFlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { router, useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, { useContext, useEffect, useRef, useState } from 'react'
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

export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { userFullName, userKind } =
        useContext<UserKindContextType>(UserKindContext)
    const { t } = useTranslation(['navigation'])
    const { toggleUserKind } = useContext(UserKindContext)
    const { toggleAccentColor } = useContext(ThemeContext)
    const { resetOrder } = useContext(DashboardContext)
    const [username, setUsername] = useState<string>('')

    useEffect(() => {
        void getUsername().then((username) => {
            setUsername(username)
        })
    }, [])

    const { data } = useQuery({
        queryKey: ['personalData'],
        queryFn: getPersonalData,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
        enabled: userKind === USER_STUDENT,
    })
    console.log(data)
    console.log(userKind)

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
                notificationListener.current
            )
            Notifications.removeNotificationSubscription(
                responseListener.current
            )
        }
    }, [])

    const [isPageOpen, setIsPageOpen] = useState(false)

    useEffect(() => {
        setIsPageOpen(true)
    }, [])

    const [initials, setInitials] = useState('')
    useEffect(() => {
        if (data !== undefined) {
            setInitials(getInitials(data.vname + ' ' + data.name))
        } else if (userKind === USER_EMPLOYEE && username !== null) {
            setInitials(getInitials(username))
        } else {
            setInitials('')
        }
    }, [data, userKind, username])

    const safeArea = useSafeAreaInsets()
    const topInset = safeArea.top
    const hasDynamicIsland = Platform.OS === 'ios' && topInset > 50

    return (
        <>
            <Head>
                {/* eslint-disable-next-line react-native/no-raw-text */}
                <title>Dashboard</title>
                <meta name="Dashboard" content="Customizable Dashboard" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>
            <View
                style={{
                    ...styles.page,
                    // workaround for status bar overlapping the header on iPhones with dynamic island
                    ...(hasDynamicIsland
                        ? { paddingTop: topInset, backgroundColor: colors.card }
                        : {}),
                }}
            >
                <WorkaroundStack
                    name={'Dashboard'}
                    titleKey={'Neuland Next'}
                    component={isPageOpen ? HomeScreen : () => <></>}
                    largeTitle={true}
                    transparent={false}
                    headerRightElement={() => (
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
                                                  title: t(
                                                      'navigation.profile'
                                                  ),
                                                  subtitle: userFullName,
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
                                    ...(userFullName !== '' &&
                                    userKind !== 'guest'
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
                                    e.nativeEvent.name ===
                                        t('navigation.profile') &&
                                        router.push('profile')
                                    e.nativeEvent.name ===
                                        t('navigation.theme') &&
                                        router.push('theme')
                                    e.nativeEvent.name ===
                                        t('navigation.about') &&
                                        router.push('about')
                                    e.nativeEvent.name === 'Logout' &&
                                        logoutAlert()
                                    e.nativeEvent.name ===
                                        t('menu.guest.title', {
                                            ns: 'settings',
                                        }) && router.push('login')
                                }}
                                onPreviewPress={() => {
                                    router.push('(user)/settings')
                                }}
                            >
                                {initials !== '' ? (
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
                                ) : (
                                    <View>
                                        <PlatformIcon
                                            color={colors.text}
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
                    )}
                />
            </View>
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
    const { t } = useTranslation(['settings'])

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
                title={t('dashboard.noShown')}
                message={t('dashboard.noShownDescription')}
                icon={{
                    ios: 'rainbow',
                    multiColor: true,
                    android: 'dashboard_customize',
                }}
                buttonText={t('dashboard.noShownButton')}
                onButtonPress={() => {
                    router.push('(user)/dashboard')
                }}
            />
        </View>
    ) : (
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
        />
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
        fontSize: 14,
        fontWeight: 'bold',
    },
})
