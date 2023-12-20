import { Avatar } from '@/components/Elements/Settings'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/provider'
import { type UserKindContextType } from '@/hooks/contexts/userKind'
import { performLogout } from '@/utils/api-utils'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { MasonryFlashList } from '@shopify/flash-list'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import ContextMenu from 'react-native-context-menu-view'

export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { userFullName, userKind } =
        useContext<UserKindContextType>(UserKindContext)
    const { t } = useTranslation(['navigation'])
    const { toggleUserKind } = useContext(UserKindContext)

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
                        performLogout(toggleUserKind).catch((e) => {
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
    return (
        <>
            <Head>
                <title>Dashboard</title>
                <meta name="Dashboard" content="Customizable Dashboard" />
                <meta property="expo:handoff" content="true" />
                <meta property="expo:spotlight" content="true" />
            </Head>

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
                                              title: t('navigation.profile'),
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
                                e.nativeEvent.name ===
                                    t('navigation.profile') &&
                                    router.push('profile')
                                e.nativeEvent.name === t('navigation.theme') &&
                                    router.push('theme')
                                e.nativeEvent.name === t('navigation.about') &&
                                    router.push('about')
                                e.nativeEvent.name === 'Logout' && logoutAlert()
                                e.nativeEvent.name ===
                                    t('menu.guest.title', {
                                        ns: 'settings',
                                    }) && router.push('login')
                            }}
                            onPreviewPress={() => {
                                router.push('(user)/settings')
                            }}
                        >
                            {userFullName !== '' && userKind !== 'guest' ? (
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
                                            {getInitials(userFullName)}
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
                                            name: 'account-circle',
                                            size: 26,
                                        }}
                                    />
                                </View>
                            )}
                        </ContextMenu>
                    </Pressable>
                )}
            />
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

    return (
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
