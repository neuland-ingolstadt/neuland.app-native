import { createGuestSession } from '@/api/thi-session-handler'
import { Avatar } from '@/components/Elements/Settings'
// @ts-expect-error - types for react-native-context-menu-view are not available
import { ContextMenuView } from '@/components/Elements/Universal/ContextMenuView'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import WorkaroundStack from '@/components/Elements/Universal/WorkaroundStack'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/provider'
import { type UserKindContextType } from '@/hooks/userKind'
import { PAGE_BOTTOM_SAFE_AREA, PAGE_PADDING } from '@/utils/style-utils'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { MasonryFlashList } from '@shopify/flash-list'
import { useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, { useContext, useEffect, useState } from 'react'
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

export default function Screen(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { userFullName, userKind } =
        useContext<UserKindContextType>(UserKindContext)
    const { t } = useTranslation(['navigation'])
    const { toggleUserKind } = useContext(UserKindContext)

    const logout = async (): Promise<void> => {
        try {
            toggleUserKind(undefined)
            await createGuestSession()
            router.push('(tabs)')
        } catch (e) {
            console.log(e)
        }
    }

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
                        logout().catch((e) => {
                            console.log(e)
                        })
                    },
                },
            ]
        )
    }

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
                component={HomeScreen}
                largeTitle={true}
                transparent={false}
                headerRightElement={() => (
                    <ContextMenuView
                        style={{
                            borderRadius: 15,
                        }}
                        menuConfig={{
                            menuTitle: '',
                            menuItems: [
                                ...(userKind === 'student'
                                    ? [
                                          {
                                              actionKey: 'personalData',
                                              actionTitle:
                                                  t('navigation.profile'),
                                              actionSubtitle: userFullName,
                                              icon: {
                                                  iconType: 'SYSTEM',
                                                  iconValue:
                                                      'person.crop.circle',
                                              },
                                          },
                                      ]
                                    : []),
                                {
                                    actionKey: 'theme',
                                    actionTitle: t('navigation.theme'),
                                    icon: {
                                        iconType: 'SYSTEM',
                                        iconValue: 'paintpalette',
                                    },
                                },
                                {
                                    actionKey: 'about',
                                    actionTitle: t('navigation.about'),
                                    icon: {
                                        iconType: 'SYSTEM',
                                        iconValue: 'info.circle',
                                    },
                                },
                                ...(userFullName !== '' && userKind !== 'guest'
                                    ? [
                                          {
                                              actionKey: 'logout',
                                              actionTitle: 'Logout',
                                              icon: {
                                                  iconType: 'SYSTEM',
                                                  iconValue:
                                                      'person.fill.xmark',
                                              },
                                              menuAttributes: ['destructive'],
                                          },
                                      ]
                                    : []),
                                ...(userKind === 'guest'
                                    ? [
                                          {
                                              actionKey: 'login',
                                              actionTitle: t(
                                                  'menu.guest.title',
                                                  { ns: 'settings' }
                                              ),
                                              icon: {
                                                  iconType: 'SYSTEM',
                                                  iconValue:
                                                      'person.fill.questionmark',
                                              },
                                          },
                                      ]
                                    : []),
                            ],
                        }}
                        onPressMenuPreview={() => {
                            router.push('(user)/settings')
                        }}
                        onPressMenuItem={({
                            nativeEvent,
                        }: {
                            nativeEvent: { actionKey: string }
                        }) => {
                            switch (nativeEvent.actionKey) {
                                case 'personalData':
                                    router.push('profile')
                                    break
                                case 'theme':
                                    router.push('theme')
                                    break
                                case 'about':
                                    router.push('about')
                                    break
                                case 'logout':
                                    logoutAlert()
                                    break
                                case 'login':
                                    router.push('login')
                                    break
                            }
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                router.push('(user)/settings')
                            }}
                            {...Platform.select({
                                ios: {
                                    delayLongPress: 300,
                                    onLongPress: () => {},
                                },
                            })}
                            hitSlop={10}
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
                        </Pressable>
                    </ContextMenuView>
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
    const [colums, setColums] = useState(
        Math.floor(Dimensions.get('window').width < 800 ? 1 : 2)
    )

    useEffect(() => {
        const handleOrientationChange = (): void => {
            setOrientation(Dimensions.get('window').width)
            setColums(Math.floor(Dimensions.get('window').width < 500 ? 1 : 2))
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

                if (colums !== 1) {
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
            numColumns={colums}
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
