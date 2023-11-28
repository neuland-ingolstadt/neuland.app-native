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
import { useRouter } from 'expo-router'
import Head from 'expo-router/head'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    FlatList,
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

    return (
        <FlatList
            contentInsetAdjustmentBehavior="automatic"
            style={styles.page}
            showsVerticalScrollIndicator={false}
            data={shownDashboardEntries}
            renderItem={({ item }) => item.card()}
            keyExtractor={(item) => item.key}
            numColumns={1}
            contentContainerStyle={styles.container}
        />
    )
}

const styles = StyleSheet.create({
    page: {
        padding: PAGE_PADDING,
    },
    container: {
        paddingBottom: PAGE_BOTTOM_SAFE_AREA,
        gap: 16,
    },
    iconText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
})
