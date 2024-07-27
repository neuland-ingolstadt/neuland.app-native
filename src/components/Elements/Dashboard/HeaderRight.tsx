import { Avatar } from '@/components/Elements/Settings'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import { type UserKindContextType } from '@/contexts/userKind'
import { getPersonalData, getUsername, performLogout } from '@/utils/api-utils'
import { USER_EMPLOYEE, USER_STUDENT } from '@/utils/app-utils'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import ContextMenu from 'react-native-context-menu-view'

export const IndexHeaderRight = (): JSX.Element => {
    const { t } = useTranslation(['navigation', 'settings'])
    const [initials, setInitials] = useState('')
    const [username, setUsername] = useState<string>('')
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const isDark = useTheme().dark
    const { userFullName, userKind } =
        useContext<UserKindContextType>(UserKindContext)
    const { toggleUserKind } = useContext(UserKindContext)
    const { resetOrder } = useContext(DashboardContext)

    const { data: persData } = useQuery({
        queryKey: ['personalData'],
        queryFn: getPersonalData,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
        enabled: userKind === USER_STUDENT,
    })

    useEffect(() => {
        if (persData !== undefined) {
            setInitials(getInitials(persData.vname + ' ' + persData.name))
        } else if (userKind === USER_EMPLOYEE && username !== null) {
            setInitials(getInitials(username))
        } else {
            setInitials('')
        }
    }, [persData, userKind, username])

    useEffect(() => {
        void getUsername().then((username) => {
            setUsername(username)
        })
    }, [])

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
                            resetOrder,
                            queryClient
                        ).catch((e) => {
                            console.log(e)
                        })
                    },
                },
            ]
        )
    }
    return (
        <Pressable
            onPress={() => {
                router.push('(user)/settings')
            }}
            delayLongPress={300}
            onLongPress={() => {}}
            hitSlop={10}
            accessibilityLabel={t('navigation.settings')}
        >
            <ContextMenu
                actions={[
                    ...(userKind === 'student'
                        ? [
                              {
                                  title: t('navigation.profile'),
                                  subtitle:
                                      persData?.vname + ' ' + persData?.name,
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
                            Platform.OS === 'ios' ? 'paintpalette' : undefined,
                    },
                    {
                        title: t('navigation.about'),
                        systemIcon:
                            Platform.OS === 'ios' ? 'info.circle' : undefined,
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
                    if (e.nativeEvent.name === t('navigation.profile')) {
                        router.push('profile')
                    } else if (e.nativeEvent.name === t('navigation.theme')) {
                        router.push('theme')
                    } else if (e.nativeEvent.name === t('navigation.about')) {
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
                    userKind === 'student' && persData?.mtknr === undefined ? (
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
                                        color: getContrastColor(colors.primary),
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
    )
}

const styles = StyleSheet.create({
    iconText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
})
