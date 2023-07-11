import API from '@/api/authenticated-api'
import FormList from '@/components/FormList'
import { Avatar, NameBox } from '@/components/Settings'
import { type Colors } from '@/components/provider'
import { type FormListSections } from '@/stores/types/components'
import { type PersDataDetails } from '@/stores/types/thi-api'
import { getContrastColor, getInitials, getNameColor } from '@/utils/ui-utils'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
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
            header: 'Preferences',
            items: [
                {
                    title: 'Theme',
                    icon: 'color-palette-outline',
                    onPress: () => {
                        router.push('(user)/theme')
                    },
                },
                {
                    title: 'Language',
                    icon: 'language-outline',
                    onPress: async () => {
                        await Linking.openSettings()
                    },
                },
                {
                    title: 'Dashboard',
                    icon: 'cube-outline',
                    onPress: () => {
                        router.push('(user)/dashboard')
                    },
                },
            ],
        },
        {
            header: 'Quick Links',
            items: [
                {
                    title: 'Primuss',
                    icon: 'link-outline',
                    onPress: async () =>
                        await Linking.openURL(
                            'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
                        ),
                },
                {
                    title: 'Moodle',
                    icon: 'link-outline',
                    onPress: async () =>
                        await Linking.openURL('https://moodle.thi.de/'),
                },
                {
                    title: 'Webmail',
                    icon: 'link-outline',
                    onPress: async () =>
                        await Linking.openURL('http://outlook.thi.de/'),
                },
            ],
        },
        {
            header: 'Legal',
            items: [
                {
                    title: 'About',
                    icon: 'chevron-forward-outline',
                    onPress: () => {
                        router.push('(user)/about')
                    },
                },
                {
                    title: 'Rate the app',
                    icon: 'star-outline',
                    onPress: () => {
                        router.push('(user)/rate')
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
            <View style={{ paddingTop: 20 }}>
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
                                                name="alert-circle-outline"
                                                size={20}
                                                color={colors.background}
                                            />
                                        </Avatar>
                                    </NameBox>
                                </>
                            ) : isLoaded === LoadingState.GUEST ? (
                                <>
                                    <NameBox
                                        title="Sign in"
                                        subTitle1="Sign in to unlock all features of
                                        the app"
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
                {'© 2023 by Neuland Ingolstadt e.V.'}
            </Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    copyrigth: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    container: {
        alignSelf: 'center',

        borderRadius: 10,
        width: '92%',

        justifyContent: 'center',
        paddingVertical: 22,
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
