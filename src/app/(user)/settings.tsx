import API from '@/api/authenticated-api'
import { createGuestSession } from '@/api/thi-session-handler'
import { Avatar, NameBox } from '@/components/Elements/Settings'
import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { useUserKind } from '@/stores/hooks'
import { UserKindContext } from '@/stores/provider'
import { type FormListSections } from '@/stores/types/components'
import { type PersDataDetails } from '@/stores/types/thi-api'
import { getContrastColor, getInitials, getNameColor } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
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

enum LoadingState {
    LOADING,
    REFRESHING,
    LOADED,
    ERROR,
}

export default function Settings(): JSX.Element {
    const [userdata, setUserdata] = useState<PersDataDetails | null>(null)
    const [fullName, setFullName] = useState('')
    const [isLoaded, setIsLoaded] = useState(LoadingState.LOADING)
    const [errorMsg, setErrorMsg] = useState('Unknown error')

    const router = useRouter()
    const colors = useTheme().colors as Colors
    const nameColor = getNameColor(fullName)
    const { t, i18n } = useTranslation(['settings'])

    const { userKind } = useUserKind()

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
                setFullName(data.vname + ' ' + data.name)
                setIsLoaded(LoadingState.LOADED)
            } else if (userKind === 'employee') {
                setFullName(
                    (await SecureStore.getItemAsync('username')) ?? 'unknown'
                )
                setIsLoaded(LoadingState.LOADED)
            } else if (userKind === 'guest') {
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
                    icon: 'color-palette-outline',
                    onPress: () => {
                        router.push('(user)/theme')
                    },
                },
                {
                    title: 'Dashboard',
                    icon: 'apps-outline',
                    onPress: () => {
                        router.push('(user)/dashboard')
                    },
                },
                {
                    title: t('menu.formlist.preferences.food'),
                    icon: 'restaurant-outline',
                    onPress: () => {
                        router.push('(food)/preferences')
                    },
                },
                {
                    title: t('menu.formlist.preferences.language'),
                    icon: 'language-outline',

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
                    icon: 'compass-outline',
                    onPress: async () =>
                        await Linking.openURL(
                            'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
                        ),
                },
                {
                    title: 'Moodle',
                    icon: 'compass-outline',
                    onPress: async () =>
                        await Linking.openURL('https://moodle.thi.de/'),
                },
                {
                    title: 'Webmail',
                    icon: 'compass-outline',
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
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(user)/about')
                    },
                },
                {
                    title: t('menu.formlist.legal.rate'),
                    icon: 'star-outline',
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
                        if (userKind === 'student') {
                            router.push('(user)/profile')
                        } else if (userKind === 'guest') {
                            router.push('(user)/login')
                        } else {
                            logoutAlert()
                        }
                    }}
                    disabled={isLoaded === LoadingState.LOADING}
                >
                    <View
                        style={[
                            styles.container,
                            { backgroundColor: colors.card },
                        ]}
                    >
                        <View style={styles.nameBox}>
                            {isLoaded === LoadingState.LOADED &&
                            userKind === 'student' ? (
                                <>
                                    <NameBox
                                        title={fullName}
                                        subTitle1={
                                            (userdata?.stgru ?? '') +
                                            '. Semester'
                                        }
                                        subTitle2={userdata?.fachrich ?? ''}
                                    >
                                        <Avatar background={nameColor}>
                                            <Text
                                                style={{
                                                    color: getContrastColor(
                                                        nameColor
                                                    ),
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {getInitials(fullName)}
                                            </Text>
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isLoaded === LoadingState.LOADED &&
                              userKind === 'employee' ? (
                                <>
                                    <NameBox
                                        title={fullName}
                                        subTitle1={t('menu.employee.subtitle')}
                                        subTitle2={''}
                                    >
                                        <Avatar background={nameColor}>
                                            <Text
                                                style={{
                                                    color: getContrastColor(
                                                        nameColor
                                                    ),
                                                    fontSize: 20,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {getInitials(fullName)}
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
                                    >
                                        <Avatar
                                            background={
                                                colors.labelTertiaryColor
                                            }
                                        >
                                            <Ionicons
                                                name="person"
                                                size={20}
                                                color={colors.background}
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
                                    >
                                        <Avatar
                                            background={
                                                colors.labelTertiaryColor
                                            }
                                        >
                                            <Ionicons
                                                name="alert"
                                                size={20}
                                                color={colors.background}
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

                            {isLoaded === LoadingState.LOADED &&
                            userKind === 'student' ? (
                                <Ionicons
                                    name="chevron-forward-outline"
                                    size={24}
                                    color={colors.labelSecondaryColor}
                                />
                            ) : null}
                        </View>
                    </View>
                </Pressable>

                <FormList sections={sections} />
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
