import API from '@/api/authenticated-api'
import { Avatar, NameBox } from '@/components/Elements/Settings'
import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { type FormListSections } from '@/stores/types/components'
import { type PersDataDetails } from '@/stores/types/thi-api'
import { getContrastColor, getInitials, getNameColor } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Linking,
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
    GUEST,
    ERROR,
}

export default function Settings(): JSX.Element {
    const [userdata, setUserdata] = useState<PersDataDetails | null>(null)
    const [fullName, setFullName] = useState('')
    const [isLoaded, setIsLoaded] = useState(LoadingState.LOADING)
    const [errorMsg, setErrorMsg] = useState('')

    const router = useRouter()
    const colors = useTheme().colors as Colors
    const nameColor = getNameColor(fullName)
    const { t } = useTranslation(['settings'])

    const loadData = async (): Promise<void> => {
        try {
            const response = await API.getPersonalData()
            const data = response.persdata
            data.pcounter = response.pcounter
            setIsLoaded(LoadingState.LOADED)
            setUserdata(data)
            setFullName(data.vname + ' ' + data.name)
        } catch (e: any) {
            if (
                e.toString() === 'Error: User is logged in as guest' ||
                e.toString() === 'Error: User is not logged in'
            ) {
                setIsLoaded(LoadingState.GUEST)
            } else {
                setIsLoaded(LoadingState.ERROR)
                setErrorMsg(e.toString().split(':')[1].trim())
            }
        }
    }

    useEffect(() => {
        void loadData()
    }, [])

    const handleRefresh = (): void => {
        setIsLoaded(LoadingState.LOADING)
        void loadData()
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
                        await Linking.openSettings()
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
                isLoaded !== LoadingState.LOADED &&
                isLoaded !== LoadingState.GUEST ? (
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
                        if (isLoaded === LoadingState.LOADED) {
                            router.push('(user)/profile')
                        } else if (isLoaded === LoadingState.GUEST) {
                            router.push('(user)/login')
                        }
                    }}
                    disabled={
                        isLoaded === LoadingState.LOADING ||
                        isLoaded === LoadingState.ERROR
                    }
                >
                    <View
                        style={[
                            styles.container,
                            { backgroundColor: colors.card },
                        ]}
                    >
                        <View style={styles.nameBox}>
                            {isLoaded === LoadingState.LOADING ? (
                                <>
                                    <View style={styles.loading}>
                                        <ActivityIndicator />
                                    </View>
                                </>
                            ) : isLoaded === LoadingState.ERROR ? (
                                <>
                                    <NameBox title="Error" subTitle1={errorMsg}>
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
                            ) : isLoaded === LoadingState.GUEST ? (
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
                            ) : (
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
                            )}

                            {isLoaded === LoadingState.LOADED ||
                            isLoaded === LoadingState.GUEST ? (
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
