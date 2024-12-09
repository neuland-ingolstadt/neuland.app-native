import { NoSessionError } from '@/api/thi-session-handler'
import AnimatedLogoText from '@/components/Flow/svgs/AnimatedLogoText'
import LogoTextSVG from '@/components/Flow/svgs/logoText'
import { Avatar, NameBox } from '@/components/Settings'
import GradesButton from '@/components/Settings/GradesButton'
import Divider from '@/components/Universal/Divider'
import FormList from '@/components/Universal/FormList'
import PlatformIcon from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import { type UserKindContextType } from '@/contexts/userKind'
import { USER_EMPLOYEE, USER_GUEST, USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { type FormListSections } from '@/types/components'
import { type MaterialIcon } from '@/types/material-icons'
import {
    animatedHapticFeedback,
    useRandomColor,
    withBouncing,
} from '@/utils/animation-utils'
import { getPersonalData, performLogout } from '@/utils/api-utils'
import { storage } from '@/utils/storage'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import { trackEvent } from '@aptabase/react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Dimensions,
    LayoutAnimation,
    Linking,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Share,
    Text,
    View,
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Animated, {
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Settings(): JSX.Element {
    const { styles, theme } = useStyles(stylesheet)
    const { userKind = USER_GUEST } =
        useContext<UserKindContextType>(UserKindContext)
    const { resetOrder } = useContext(DashboardContext)
    const insets = useSafeAreaInsets()
    const window = Dimensions.get('window')
    const width = window.width - insets.left - insets.right
    const height = window.height - insets.top - insets.bottom
    const router = useRouter()
    const { t, i18n } = useTranslation(['settings'])
    const bottomBoundX = 0
    const logoWidth = 159
    const logoHeight = 15
    const topBoundX = width - logoWidth
    const [tapCount, setTapCount] = useState(0)
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const scrollY = useRef(0)
    const logoRotation = useSharedValue(0)
    const velocity = 110
    const username =
        userKind === USER_EMPLOYEE && SecureStore.getItem('username')
    const { color, randomizeColor } = useRandomColor()
    const resetPreferences = usePreferencesStore((state) => state.reset)
    const resetFood = useFoodFilterStore((state) => state.reset)

    useEffect(() => {
        const { bottomBoundY, topBoundY } = getBounds()
        if (isBouncing) {
            trackEvent('EasterEgg', { easterEgg: 'settingsLogoBounce' })

            translateX.value = withBouncing(
                velocity,
                bottomBoundX,
                topBoundX,
                randomizeColor
            )
            translateY.value = withBouncing(
                velocity,
                bottomBoundY,
                topBoundY,
                randomizeColor
            )
        } else {
            cancelAnimation(translateX)
            cancelAnimation(translateY)
        }
    }, [tapCount])

    const logoBounceAnimation = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
            ],
        }
    })

    const wobbleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{ rotateZ: `${logoRotation.value}deg` }],
        }
    })

    const getBounds = (): { topBoundY: number; bottomBoundY: number } => {
        const topBoundY = height - logoHeight + scrollY.current - 5
        const bottomBoundY = scrollY.current
        return { topBoundY, bottomBoundY }
    }

    const languageAlert = (): void => {
        const newLocale = i18n.language === 'en' ? 'de' : 'en'

        Alert.alert(
            t('menu.formlist.language.title'),
            t('menu.formlist.language.message'),
            [
                {
                    text: t('profile.logout.alert.cancel'),
                    style: 'default',
                },
                {
                    text: t('menu.formlist.language.confirm'),
                    style: 'destructive',
                    onPress: () => {
                        storage.set('language', newLocale)
                        void i18n.changeLanguage(newLocale)
                    },
                },
            ]
        )
    }

    const logoutAlert = (): void => {
        Alert.alert(
            t('profile.logout.alert.title'),
            t('profile.logout.alert.message'),
            [
                {
                    text: t('profile.logout.alert.cancel'),
                    style: 'cancel',
                },
                {
                    text: t('profile.logout.alert.confirm'),
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

    const { data, error, isLoading, isSuccess, refetch, isError } = useQuery({
        queryKey: ['personalData'],
        queryFn: getPersonalData,
        staleTime: 1000 * 60 * 60 * 12,
        gcTime: 1000 * 60 * 60 * 24 * 60,
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('/login')
                return false
            } else if (userKind !== 'student') {
                return false
            }
            return failureCount < 2
        },
        enabled: userKind === USER_STUDENT,
    })

    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    const { toggleUserKind } = React.useContext(UserKindContext)
    const handlePress = (): void => {
        setTapCount(tapCount + 1)
        animatedHapticFeedback()
        if (tapCount < 1) {
            const rotationDegree = 5

            logoRotation.value = withSequence(
                withTiming(-rotationDegree, { duration: 50 }),
                withTiming(rotationDegree, { duration: 100 }),
                withTiming(0, { duration: 50 })
            )
        }
    }

    useEffect(() => {
        if (isLoading || isSuccess) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        }
    }, [isLoading, isSuccess])

    const isBouncing = tapCount === 2

    const sections: FormListSections[] = [
        {
            header: t('menu.formlist.preferences.title'),
            items: [
                {
                    title: 'Dashboard',
                    icon: {
                        ios: 'rectangle.stack',
                        android: 'dashboard_customize',
                    },

                    onPress: () => {
                        router.navigate('/dashboard')
                    },
                },
                {
                    title: t('menu.formlist.preferences.food'),
                    icon: {
                        android: 'restaurant',
                        ios: 'fork.knife',
                    },
                    onPress: () => {
                        router.navigate('/foodPreferences')
                    },
                },
                {
                    title: t('menu.formlist.preferences.language'),
                    icon: {
                        ios: 'globe',
                        android: 'language',
                    },

                    onPress: async () => {
                        if (
                            Platform.OS === 'ios' ||
                            (Platform.OS === 'android' &&
                                Platform.Version >= 33)
                        ) {
                            await Linking.openSettings()
                        } else {
                            languageAlert()
                        }
                    },
                },
            ],
        },
        {
            header: t('menu.formlist.appearance.title'),
            items: [
                {
                    title: t('menu.formlist.appearance.accent'),
                    icon: {
                        ios: 'paintpalette',
                        android: 'palette',
                    },
                    onPress: () => {
                        router.navigate('/accent')
                    },
                },
                {
                    title: t('menu.formlist.appearance.theme'),
                    icon: {
                        ios: 'moon.stars',
                        android: 'routine',
                    },
                    onPress: () => {
                        router.navigate('/theme')
                    },
                },
                ...(Platform.OS === 'ios' &&
                DeviceInfo.getDeviceType() !== 'Desktop'
                    ? [
                          {
                              title: 'App Icon',
                              icon: {
                                  ios: 'star.square.on.square',
                                  android: '' as MaterialIcon,
                              },
                              onPress: () => {
                                  router.navigate('/appIcon')
                              },
                          },
                      ]
                    : []),
            ],
        },
        {
            header: t('menu.formlist.legal.title'),
            items: [
                {
                    title: t('menu.formlist.legal.about'),
                    icon: {
                        ios: 'chevron.forward',
                        android: 'chevron_right',
                    },
                    onPress: () => {
                        router.navigate('/about')
                    },
                },

                {
                    title: t('menu.formlist.legal.share'),
                    icon: {
                        ios: 'square.and.arrow.up',
                        android: 'share',
                    },
                    onPress: () => {
                        trackEvent('Share', { type: 'app' })

                        void Share.share({
                            url: 'https://next.neuland.app/get',
                            message: t('menu.formlist.legal.shareMessage'),
                        })
                    },
                },
            ],
        },
    ]

    const logoInactiveOpacity = isBouncing ? 0 : 1
    const logoActiveOpacity = isBouncing ? 1 : 0
    const logoActiveHeight = isBouncing ? 18 : 0

    return (
        <ScrollView
            refreshControl={
                isError && userKind === 'student' ? (
                    <RefreshControl
                        refreshing={isRefetchingByUser}
                        onRefresh={() => {
                            void refetchByUser()
                        }}
                    />
                ) : undefined
            }
            onScroll={(event) => {
                scrollY.current = event.nativeEvent.contentOffset.y
                setTapCount(0)
            }}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.wrapper}>
                <Pressable
                    onPress={() => {
                        if (userKind === 'employee') {
                            logoutAlert()
                        } else {
                            if (userKind === 'student') {
                                router.navigate('/profile')
                            } else if (userKind === 'guest') {
                                router.navigate('/login')
                            }
                        }
                    }}
                >
                    <View style={styles.container}>
                        <View style={styles.nameBox}>
                            {isSuccess &&
                            userKind === 'student' &&
                            data?.mtknr !== undefined ? (
                                <View style={styles.nameOuterContainer}>
                                    <View style={styles.nameInnerContainer}>
                                        <NameBox
                                            title={
                                                data?.vname + ' ' + data?.name
                                            }
                                            subTitle1={
                                                (data?.stgru ?? '') +
                                                '. Semester'
                                            }
                                            subTitle2={data?.fachrich ?? ''}
                                        >
                                            <Avatar>
                                                <Text style={styles.avatarText}>
                                                    {getInitials(
                                                        data?.vname +
                                                            ' ' +
                                                            data?.name
                                                    )}
                                                </Text>
                                            </Avatar>
                                        </NameBox>

                                        <PlatformIcon
                                            ios={{
                                                name: 'chevron.forward',

                                                size: 16,
                                            }}
                                            android={{
                                                name: 'chevron_right',
                                                size: 26,
                                            }}
                                            style={styles.iconAlign}
                                        />
                                    </View>
                                    <Divider iosPaddingLeft={16} />
                                    <GradesButton />
                                </View>
                            ) : isSuccess &&
                              userKind === 'student' &&
                              data?.mtknr === undefined ? (
                                <View style={styles.nameOuterContainer}>
                                    <View style={styles.nameInnerContainer}>
                                        <NameBox
                                            title={t('menu.error.noData.title')}
                                            subTitle1={t(
                                                'menu.error.noData.subtitle1'
                                            )}
                                            subTitle2={t(
                                                'menu.error.noData.subtitle2'
                                            )}
                                        >
                                            <Avatar
                                                background={
                                                    theme.colors
                                                        .labelTertiaryColor
                                                }
                                            >
                                                <PlatformIcon
                                                    ios={{
                                                        name: 'exclamationmark.triangle',
                                                        variant: 'fill',
                                                        size: 26,
                                                    }}
                                                    android={{
                                                        name: 'warning',
                                                        size: 28,
                                                    }}
                                                    style={styles.iconGuest}
                                                />
                                            </Avatar>
                                        </NameBox>
                                        <PlatformIcon
                                            ios={{
                                                name: 'chevron.forward',

                                                size: 16,
                                            }}
                                            android={{
                                                name: 'chevron_right',
                                                size: 26,
                                            }}
                                            style={styles.iconAlign}
                                        />
                                    </View>
                                    <Divider iosPaddingLeft={16} />
                                    <GradesButton />
                                </View>
                            ) : userKind === 'employee' ? (
                                <View style={styles.nameInnerContainer}>
                                    <NameBox
                                        title={username as string}
                                        subTitle1={t('menu.employee.subtitle1')}
                                        subTitle2={t('menu.employee.subtitle2')}
                                    >
                                        <Avatar>
                                            <Text style={styles.avatarText}>
                                                {getInitials(
                                                    (username as string) ?? ''
                                                )}
                                            </Text>
                                        </Avatar>
                                    </NameBox>
                                </View>
                            ) : userKind === 'guest' ? (
                                <View style={styles.nameInnerContainer}>
                                    <NameBox
                                        title={t('menu.guest.title')}
                                        subTitle1={t('menu.guest.subtitle')}
                                        subTitle2={''}
                                    >
                                        <Avatar
                                            background={
                                                theme.colors.labelTertiaryColor
                                            }
                                        >
                                            <PlatformIcon
                                                ios={{
                                                    name: 'person',
                                                    variant: 'fill',
                                                    size: 26,
                                                }}
                                                android={{
                                                    name: 'account_circle',
                                                    size: 32,
                                                }}
                                                style={styles.iconGuest}
                                            />
                                        </Avatar>
                                    </NameBox>
                                    <PlatformIcon
                                        ios={{
                                            name: 'chevron.forward',

                                            size: 16,
                                        }}
                                        android={{
                                            name: 'chevron_right',
                                            size: 26,
                                        }}
                                        style={styles.iconAlign}
                                    />
                                </View>
                            ) : isLoading ? (
                                <>
                                    <View style={styles.nameInnerContainer}>
                                        <View style={styles.loading}>
                                            <LoadingIndicator />
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <NameBox
                                        title="Error"
                                        subTitle1={
                                            error?.message ?? 'Unknown error'
                                        }
                                        subTitle2={t('menu.error.subtitle2')}
                                    >
                                        <Avatar
                                            background={
                                                theme.colors.labelTertiaryColor
                                            }
                                        >
                                            <PlatformIcon
                                                ios={{
                                                    name: 'exclamationmark.triangle',
                                                    variant: 'fill',
                                                    size: 26,
                                                }}
                                                android={{
                                                    name: 'warning',
                                                    size: 28,
                                                }}
                                                style={styles.iconGuest}
                                            />
                                        </Avatar>
                                    </NameBox>
                                </>
                            )}
                        </View>
                    </View>
                </Pressable>
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>
            </View>

            <Text style={styles.copyrigth}>
                {t('menu.copyright', { year: new Date().getFullYear() })}
            </Text>
            <Animated.View
                style={[
                    styles.bounceContainer,
                    logoBounceAnimation,

                    {
                        opacity: logoActiveOpacity,
                        height: logoActiveHeight,
                    },
                ]}
            >
                <Pressable
                    onPress={() => {
                        setTapCount(0)
                    }}
                    disabled={!isBouncing}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <LogoTextSVG
                        size={15}
                        color={isBouncing ? color : theme.colors.text}
                    />
                </Pressable>
            </Animated.View>

            <Animated.View
                style={[
                    wobbleAnimation,
                    styles.whobbleContainer,
                    {
                        opacity: logoInactiveOpacity,
                    },
                ]}
            >
                <Pressable
                    onPress={() => {
                        handlePress()
                    }}
                    disabled={isBouncing}
                    accessibilityLabel={t('button.settingsLogo', {
                        ns: 'accessibility',
                    })}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <AnimatedLogoText
                        dimensions={{
                            logoWidth,
                            logoHeight,
                        }}
                        speed={3.5}
                    />
                </Pressable>
            </Animated.View>
        </ScrollView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    avatarText: {
        color: getContrastColor(theme.colors.primary),
        fontSize: 20,
        fontWeight: 'bold',
    },
    bounceContainer: {
        position: 'absolute',
        zIndex: 10,
    },
    container: {
        alignSelf: 'center',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.mg,
        width: '100%',
    },
    contentContainer: {
        paddingBottom: 60,
    },
    copyrigth: {
        color: theme.colors.labelSecondaryColor,
        fontSize: 12,
        marginBottom: -10,
        marginTop: 20,
        textAlign: 'center',
    },
    formlistContainer: { marginVertical: 16 },
    iconAlign: {
        alignSelf: 'center',
        color: theme.colors.labelSecondaryColor,
    },
    iconGuest: {
        color: 'white',
        marginTop: Platform.OS === 'android' ? 2 : 0,
    },
    loading: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        marginRight: 10,
    },
    nameBox: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameInnerContainer: {
        flexDirection: 'row',
        paddingHorizontal: 14,
        paddingVertical: 20,
    },
    nameOuterContainer: { flexDirection: 'column', flex: 1 },

    whobbleContainer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    wrapper: { paddingHorizontal: 16, paddingTop: 20 },
}))
