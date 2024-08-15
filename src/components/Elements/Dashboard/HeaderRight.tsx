import { Avatar } from '@/components/Elements/Settings'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import { type UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import { getPersonalData, getUsername, performLogout } from '@/utils/api-utils'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import * as Device from 'expo-device'
import { useRouter } from 'expo-router'
import { getItem } from 'expo-secure-store'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    StyleSheet,
    Text,
} from 'react-native'
import ContextMenu from 'react-native-context-menu-view'

export const IndexHeaderRight = (): JSX.Element => {
    const { t } = useTranslation(['navigation', 'settings'])
    const router = useRouter()
    const colors = useTheme().colors as Colors

    const { userKind = USER_GUEST } =
        useContext<UserKindContextType>(UserKindContext)
    const { toggleUserKind } = useContext(UserKindContext)
    const { resetOrder } = useContext(DashboardContext)
    const username = userKind === USER_EMPLOYEE && getItem('username')

    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const [initials, setInitials] = useState('')
    const androidPadding = Platform.OS === 'android' ? 16 : 0

    const {
        data: persData,
        isError,
        isSuccess,
    } = useQuery({
        queryKey: ['personalData'],
        queryFn: async () => {
            setShowLoadingIndicator(true)
            const data = await getPersonalData()
            setShowLoadingIndicator(false)
            return data
        },
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
        enabled: userKind === USER_STUDENT,
    })

    useEffect(() => {
        const fetchUsernameAndSetInitials = async (): Promise<void> => {
            if (userKind === USER_STUDENT && persData !== undefined) {
                const initials = getInitials(
                    persData.vname + ' ' + persData.name
                )
                setInitials(initials)
            } else if (userKind === USER_EMPLOYEE) {
                const username = await getUsername()
                if (username !== undefined) {
                    setInitials(getInitials(username))
                }
            } else {
                setInitials('')
            }
        }
        fetchUsernameAndSetInitials().catch((e) => {
            console.log(e)
        })
    }, [persData, userKind])

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

    const PlatformMenu = ({
        children,
    }: {
        children: JSX.Element
    }): JSX.Element => (
        <ContextMenu
            disabled={Device.deviceType === Device.DeviceType.DESKTOP}
            actions={[
                ...(userKind === 'student'
                    ? [
                          {
                              title: t('navigation.profile'),
                              subtitle: persData?.vname + ' ' + persData?.name,
                              systemIcon:
                                  Platform.OS === 'ios'
                                      ? 'person.crop.circle'
                                      : undefined,
                          },
                      ]
                    : []),
                {
                    title: t('navigation.accent'),
                    systemIcon:
                        Platform.OS === 'ios' ? 'paintpalette' : undefined,
                },
                {
                    title: t('navigation.about'),
                    systemIcon:
                        Platform.OS === 'ios' ? 'info.circle' : undefined,
                },
                ...(userKind !== 'guest'
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
                } else if (e.nativeEvent.name === t('navigation.accent')) {
                    router.push('accent')
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
                router.navigate('settings')
            }}
        >
            {children}
        </ContextMenu>
    )

    return (
        <Pressable
            onPress={() => {
                router.navigate('settings')
            }}
            delayLongPress={300}
            onLongPress={() => {}}
            accessibilityLabel={t('navigation.settings')}
            style={{
                paddingRight: androidPadding,
            }}
        >
            <PlatformMenu>
                {userKind === USER_EMPLOYEE ? (
                    <Avatar size={28} background={colors.primary}>
                        <Text
                            style={{
                                color: getContrastColor(colors.primary),
                                ...styles.iconText,
                            }}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                        >
                            {getInitials((username as string) ?? '')}
                        </Text>
                    </Avatar>
                ) : userKind === USER_GUEST || isError ? (
                    <PlatformIcon
                        color={colors.text}
                        ios={{
                            name: 'person.crop.circle',
                            size: 24,
                        }}
                        android={{
                            name: 'account_circle',
                            size: 26,
                        }}
                    />
                ) : userKind === USER_STUDENT &&
                  isSuccess &&
                  persData?.mtknr === undefined ? (
                    <PlatformIcon
                        color={colors.text}
                        ios={{
                            name: 'person.crop.circle.badge.exclamationmark',
                            size: 24,
                        }}
                        android={{
                            name: 'account_circle_off',
                            size: 26,
                        }}
                    />
                ) : initials !== '' || !showLoadingIndicator ? (
                    <Avatar size={28} background={colors.primary}>
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
                ) : (
                    <ActivityIndicator
                        color={colors.text}
                        size="small"
                        style={styles.center}
                    />
                )}
            </PlatformMenu>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    iconText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})
