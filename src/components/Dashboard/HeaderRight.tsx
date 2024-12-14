import ContextMenu from '@/components/Flow/ContextMenu'
import { Avatar } from '@/components/Settings'
import PlatformIcon from '@/components/Universal/Icon'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import { type UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { getPersonalData, getUsername, performLogout } from '@/utils/api-utils'
import { loadSecure } from '@/utils/storage'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform, Pressable, Text } from 'react-native'
import { getDeviceType } from 'react-native-device-info'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import LoadingIndicator from '../Universal/LoadingIndicator'

export const IndexHeaderRight = (): JSX.Element => {
    const { t } = useTranslation(['navigation', 'settings'])
    const router = useRouter()
    const { styles, theme } = useStyles(stylesheet)
    const resetPreferences = usePreferencesStore((state) => state.reset)
    const resetFood = useFoodFilterStore((state) => state.reset)

    const { userKind = USER_GUEST } =
        useContext<UserKindContextType>(UserKindContext)
    const { toggleUserKind } = useContext(UserKindContext)
    const { resetOrder } = useContext(DashboardContext)
    const username = userKind === USER_EMPLOYEE && loadSecure('username')

    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false)
    const [initials, setInitials] = useState('')

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
                        resetPreferences()
                        resetFood()
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

    const IconComponent = (): JSX.Element => {
        return (
            <PlatformMenu>
                {userKind === USER_EMPLOYEE ? (
                    <Avatar size={28}>
                        <Text
                            style={{
                                color: getContrastColor(theme.colors.primary),
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
                        ios={{
                            name: 'person.crop.circle',
                            size: 24,
                        }}
                        android={{
                            name: 'account_circle',
                            size: 26,
                        }}
                        web={{
                            name: 'CircleUser',
                            size: 24,
                        }}
                        style={styles.icon}
                    />
                ) : userKind === USER_STUDENT &&
                  isSuccess &&
                  persData?.mtknr === undefined ? (
                    <PlatformIcon
                        ios={{
                            name: 'person.crop.circle.badge.exclamationmark',
                            size: 24,
                        }}
                        android={{
                            name: 'account_circle_off',
                            size: 26,
                        }}
                        web={{
                            name: 'UserX',
                            size: 24,
                        }}
                        style={styles.icon}
                    />
                ) : initials !== '' || !showLoadingIndicator ? (
                    <Avatar size={28}>
                        <Text
                            style={{
                                color: getContrastColor(theme.colors.primary),
                                ...styles.iconText,
                            }}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                        >
                            {initials}
                        </Text>
                    </Avatar>
                ) : (
                    <LoadingIndicator style={styles.center} />
                )}
            </PlatformMenu>
        )
    }

    const MemoIcon = React.useMemo(
        () => <IconComponent />,
        [userKind, initials, showLoadingIndicator, theme.colors]
    )
    const PlatformMenu = ({
        children,
    }: {
        children: JSX.Element
    }): JSX.Element => {
        return (
            <ContextMenu
                disabled={getDeviceType() === 'Desktop'}
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
                        router.navigate('/profile')
                    } else if (e.nativeEvent.name === t('navigation.accent')) {
                        router.navigate('/accent')
                    } else if (e.nativeEvent.name === t('navigation.about')) {
                        router.navigate('/about')
                    } else if (e.nativeEvent.name === 'Logout') {
                        logoutAlert()
                    } else if (
                        e.nativeEvent.name ===
                        t('menu.guest.title', { ns: 'settings' })
                    ) {
                        router.navigate('/login')
                    }
                }}
                onPreviewPress={() => {
                    router.navigate('/settings')
                }}
            >
                {children}
            </ContextMenu>
        )
    }

    return (
        <Pressable
            onPressOut={() => {
                router.navigate('/settings')
            }}
            delayLongPress={300}
            onLongPress={() => {}}
            accessibilityLabel={t('navigation.settings')}
            style={styles.element}
        >
            {MemoIcon}
        </Pressable>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    element: {
        marginEnd: Platform.OS !== 'ios' ? 14 : 0,
    },
    icon: {
        color: theme.colors.text,
    },
    iconText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
}))
