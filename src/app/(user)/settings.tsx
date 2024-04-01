import { NoSessionError } from '@/api/thi-session-handler'
import { Avatar, NameBox } from '@/components/Elements/Settings'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { linkIcon } from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import {
    DashboardContext,
    ThemeContext,
    UserKindContext,
} from '@/components/contexts'
import { useRefreshByUser } from '@/hooks'
import {
    USER_GUEST,
    USER_STUDENT,
    type UserKindContextType,
} from '@/hooks/contexts/userKind'
import { type FormListSections } from '@/types/components'
import { getPersonalData, performLogout } from '@/utils/api-utils'
import { getContrastColor, getInitials } from '@/utils/ui-utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function Settings(): JSX.Element {
    const { userKind, userFullName } =
        useContext<UserKindContextType>(UserKindContext)
    const { toggleAccentColor } = useContext(ThemeContext)
    const { resetOrder } = useContext(DashboardContext)

    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { t, i18n } = useTranslation(['settings'])

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
                        void AsyncStorage.setItem('language', newLocale)
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

    const { data, error, isLoading, isSuccess, refetch, isError } = useQuery({
        queryKey: ['personalData'],
        queryFn: getPersonalData,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
        retry(failureCount, error) {
            if (error instanceof NoSessionError) {
                router.replace('user/login')
                return false
            } else if (userKind !== 'student') {
                return false
            }
            return failureCount < 3
        },
        enabled: userKind === USER_STUDENT,
    })

    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    const { toggleUserKind } = React.useContext(UserKindContext)

    const sections: FormListSections[] = [
        {
            header: t('menu.formlist.preferences.title'),
            items: [
                {
                    title: t('menu.formlist.preferences.theme'),
                    icon: {
                        ios: 'paintpalette',
                        android: 'palette',
                    },
                    onPress: () => {
                        router.push('(user)/theme')
                    },
                },
                {
                    title: 'Dashboard',
                    icon: {
                        ios: 'rectangle.stack',
                        android: 'dashboard_customize',
                    },

                    onPress: () => {
                        router.push('(user)/dashboard')
                    },
                },
                {
                    title: t('menu.formlist.preferences.food'),
                    icon: {
                        android: 'restaurant',
                        ios: 'fork.knife',
                    },
                    onPress: () => {
                        router.push('(food)/preferences')
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
            header: 'Quick Links',
            items: [
                {
                    title: 'Primuss',
                    icon: linkIcon,
                    onPress: async () =>
                        await Linking.openURL(
                            'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
                        ),
                },
                {
                    title: 'Moodle',
                    icon: linkIcon,
                    onPress: async () =>
                        await Linking.openURL('https://moodle.thi.de/'),
                },
                {
                    title: 'Webmail',
                    icon: linkIcon,
                    onPress: async () =>
                        await Linking.openURL('http://outlook.thi.de/'),
                },
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
                        router.push('(user)/about')
                    },
                },
                {
                    title: t('menu.formlist.legal.rate'),
                    icon: {
                        ios: 'star',
                        android: 'star',
                    },
                    onPress: () => {
                        if (Platform.OS === 'android') {
                            void Linking.openURL(
                                'market://details?id=app.neuland'
                            )
                        } else {
                            alert('Not available yet')
                        }
                    },
                },
            ],
        },
    ]

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
        >
            <View style={styles.wrapper}>
                <Pressable
                    onPress={() => {
                        if (userKind === 'employee') {
                            logoutAlert()
                        } else {
                            if (userKind === 'student') {
                                router.push('(user)/profile')
                            } else if (userKind === 'guest') {
                                router.push('(user)/login')
                            }
                        }
                    }}
                >
                    <View
                        style={[
                            styles.container,
                            { backgroundColor: colors.card },
                        ]}
                    >
                        <View style={styles.nameBox}>
                            {(isLoading || isSuccess) &&
                            userKind === 'student' &&
                            data?.mtknr !== undefined ? (
                                <>
                                    <NameBox
                                        title={data?.vname + ' ' + data?.name}
                                        subTitle1={
                                            (data?.stgru ?? '') + '. Semester'
                                        }
                                        subTitle2={data?.fachrich ?? ''}
                                        loaded={data !== undefined}
                                    >
                                        <Avatar background={colors.primary}>
                                            <Text
                                                style={{
                                                    color: getContrastColor(
                                                        colors.primary
                                                    ),
                                                    ...styles.avatarText,
                                                }}
                                            >
                                                {getInitials(userFullName)}
                                            </Text>
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isSuccess &&
                              userKind === 'student' &&
                              data?.mtknr === undefined ? (
                                <>
                                    <NameBox
                                        title={t('menu.error.noData.title')}
                                        subTitle1={t(
                                            'menu.error.noData.subtitle1'
                                        )}
                                        subTitle2={t(
                                            'menu.error.noData.subtitle2'
                                        )}
                                        loaded={true}
                                    >
                                        <Avatar
                                            background={
                                                colors.labelTertiaryColor
                                            }
                                        >
                                            <PlatformIcon
                                                color={colors.background}
                                                ios={{
                                                    name: 'exclamationmark.triangle',
                                                    variant: 'fill',
                                                    size: 26,
                                                }}
                                                android={{
                                                    name: 'warning',
                                                    size: 28,
                                                }}
                                            />
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : userKind === 'employee' ? (
                                <>
                                    <NameBox
                                        title={userFullName}
                                        subTitle1={t('menu.employee.subtitle1')}
                                        subTitle2={t('menu.employee.subtitle2')}
                                        loaded={data !== undefined}
                                    >
                                        <Avatar background={colors.primary}>
                                            <Text
                                                style={{
                                                    color: getContrastColor(
                                                        colors.primary
                                                    ),
                                                    ...styles.avatarText,
                                                }}
                                            >
                                                {getInitials(userFullName)}
                                            </Text>
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : userKind === 'guest' ? (
                                <>
                                    <NameBox
                                        title={t('menu.guest.title')}
                                        subTitle1={t('menu.guest.subtitle')}
                                        subTitle2={''}
                                        loaded={true}
                                    >
                                        <Avatar
                                            background={
                                                colors.labelTertiaryColor
                                            }
                                        >
                                            <PlatformIcon
                                                color={'white'}
                                                ios={{
                                                    name: 'person',
                                                    variant: 'fill',
                                                    size: 26,
                                                }}
                                                android={{
                                                    name: 'account_circle',
                                                    size: 32,
                                                }}
                                            />
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isError ? (
                                <>
                                    <NameBox
                                        title="Error"
                                        subTitle1={
                                            error?.message ?? 'Unknown error'
                                        }
                                        subTitle2={t('menu.error.subtitle2')}
                                        loaded={true}
                                    >
                                        <Avatar
                                            background={
                                                colors.labelTertiaryColor
                                            }
                                        >
                                            <PlatformIcon
                                                color={colors.background}
                                                ios={{
                                                    name: 'exclamationmark.triangle',
                                                    variant: 'fill',
                                                    size: 26,
                                                }}
                                                android={{
                                                    name: 'warning',
                                                    size: 28,
                                                }}
                                            />
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isLoading ? (
                                <>
                                    <View style={styles.loading}>
                                        <ActivityIndicator />
                                    </View>
                                </>
                            ) : (
                                <></>
                            )}

                            {isSuccess || userKind === USER_GUEST ? (
                                <PlatformIcon
                                    color={colors.labelSecondaryColor}
                                    ios={{
                                        name: 'chevron.forward',

                                        size: 16,
                                    }}
                                    android={{
                                        name: 'chevron_right',
                                        size: 26,
                                    }}
                                />
                            ) : null}
                        </View>
                    </View>
                </Pressable>
                <View style={styles.formlistContainer}>
                    <FormList sections={sections} />
                </View>
            </View>

            <Text
                style={[
                    styles.copyrigth,
                    { color: colors.labelSecondaryColor },
                ]}
            >
                {t('menu.copyright', { year: new Date().getFullYear() })}
            </Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    wrapper: { paddingTop: 20, paddingHorizontal: 16 },

    copyrigth: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    container: {
        alignSelf: 'center',

        borderRadius: 10,
        width: '100%',
        paddingVertical: 24,
        paddingHorizontal: 14,
    },
    nameBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loading: {
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
    },
    formlistContainer: { marginVertical: 16 },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
})
