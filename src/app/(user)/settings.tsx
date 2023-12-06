import API from '@/api/authenticated-api'
import { createGuestSession } from '@/api/thi-session-handler'
import { Avatar, NameBox } from '@/components/Elements/Settings'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { linkIcon } from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import { UserKindContext } from '@/components/provider'
import { type UserKindContextType } from '@/hooks/userKind'
import { type FormListSections } from '@/types/components'
import { type PersDataDetails } from '@/types/thi-api'
import { LoadingState, getContrastColor, getInitials } from '@/utils/ui-utils'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useContext, useEffect, useState } from 'react'
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
    const { userKind, userFullName, updateUserFullName } =
        useContext<UserKindContextType>(UserKindContext)

    const [userdata, setUserdata] = useState<PersDataDetails | null>(null)
    const [isLoaded, setIsLoaded] = useState(LoadingState.LOADING)
    const [errorMsg, setErrorMsg] = useState('Unknown error')

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
                        logout().catch((e) => {
                            console.log(e)
                        })
                    },
                },
            ]
        )
    }

    const loadData = async (): Promise<void> => {
        try {
            setIsLoaded(LoadingState.LOADING)
            if (userKind === 'student') {
                const response = await API.getPersonalData()
                const data = response.persdata
                data.pcounter = response.pcounter
                setUserdata(data)
                updateUserFullName(data.vname + ' ' + data.name)
                setIsLoaded(LoadingState.LOADED)
            } else if (userKind === 'employee' || userKind === 'guest') {
                setIsLoaded(LoadingState.LOADED)
            }
        } catch (e: any) {
            setIsLoaded(LoadingState.ERROR)
            setErrorMsg(e.toString().split(':')[1].trim())
        }
    }

    useEffect(() => {
        void loadData()
    }, [userKind])

    const handleRefresh = (): void => {
        setIsLoaded(LoadingState.LOADING)
        void loadData()
    }

    const { toggleUserKind } = React.useContext(UserKindContext)

    const logout = async (): Promise<void> => {
        try {
            toggleUserKind(undefined)
            await createGuestSession()
            router.push('(user)/login')
        } catch (e) {
            console.log(e)
        }
    }

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
                        android: 'dashboard-customize',
                    },

                    onPress: () => {
                        router.push('(user)/dashboard')
                    },
                },
                {
                    title: t('navigation.notifications', { ns: 'navigation' }),
                    icon: {
                        ios: 'bell',
                        android: 'bell',
                    },
                    onPress: () => {
                        router.push('(user)/notifications')
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
                        if (Platform.OS === 'ios') {
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
                        android: 'chevron-right',
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
                        alert('Not available yet')
                    },
                },
            ],
        },
    ]

    return (
        <ScrollView
            refreshControl={
                isLoaded !== LoadingState.LOADED && userKind === 'student' ? (
                    <RefreshControl
                        refreshing={isLoaded === LoadingState.REFRESHING}
                        onRefresh={handleRefresh}
                    />
                ) : undefined
            }
        >
            <View style={styles.wrapper}>
                <Pressable
                    onPress={() => {
                        if (
                            isLoaded === LoadingState.ERROR ||
                            userKind === 'employee'
                        ) {
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
                            {(isLoaded === LoadingState.LOADING ||
                                isLoaded === LoadingState.LOADED) &&
                            userKind === 'student' ? (
                                <>
                                    <NameBox
                                        title={userFullName}
                                        subTitle1={
                                            (userdata?.stgru ?? '') +
                                            '. Semester'
                                        }
                                        subTitle2={userdata?.fachrich ?? ''}
                                        loaded={
                                            isLoaded === LoadingState.LOADED
                                        }
                                    >
                                        <Avatar background={colors.primary}>
                                            <Text
                                                style={{
                                                    color: getContrastColor(
                                                        colors.primary
                                                    ),
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {getInitials(userFullName)}
                                            </Text>
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isLoaded === LoadingState.LOADED &&
                              userKind === 'employee' ? (
                                <>
                                    <NameBox
                                        title={userFullName}
                                        subTitle1={t('menu.employee.subtitle1')}
                                        subTitle2={t('menu.employee.subtitle2')}
                                        loaded={true}
                                    >
                                        <Avatar background={colors.primary}>
                                            <Text
                                                style={{
                                                    color: getContrastColor(
                                                        colors.primary
                                                    ),
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {getInitials(userFullName)}
                                            </Text>
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isLoaded === LoadingState.LOADED &&
                              userKind === 'guest' ? (
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
                                                    name: 'account-circle',
                                                    size: 32,
                                                }}
                                            />
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isLoaded === LoadingState.ERROR ? (
                                <>
                                    <NameBox
                                        title="Error"
                                        subTitle1={errorMsg}
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
                            ) : isLoaded === LoadingState.LOADING ? (
                                <>
                                    <View style={styles.loading}>
                                        <ActivityIndicator />
                                    </View>
                                </>
                            ) : (
                                <></>
                            )}

                            {isLoaded !== LoadingState.ERROR ? (
                                <PlatformIcon
                                    color={colors.labelSecondaryColor}
                                    ios={{
                                        name: 'chevron.forward',

                                        size: 16,
                                    }}
                                    android={{
                                        name: 'chevron-right',
                                        size: 26,
                                    }}
                                />
                            ) : null}
                        </View>
                    </View>
                </Pressable>
                <View style={{ marginVertical: 16 }}>
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
})
