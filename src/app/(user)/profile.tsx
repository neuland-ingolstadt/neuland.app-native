import API from '@/api/authenticated-api'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { chevronIcon } from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import {
    DashboardContext,
    ThemeContext,
    UserKindContext,
} from '@/components/provider'
import { type FormListSections } from '@/types/components'
import { type PersDataDetails } from '@/types/thi-api'
import { isKnownError, performLogout } from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { captureException } from '@sentry/react-native'
import * as Clipboard from 'expo-clipboard'
import * as LocalAuthentication from 'expo-local-authentication'
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
import Toast from 'react-native-root-toast'

export default function Profile(): JSX.Element {
    const [userData, setUserData] = useState<PersDataDetails | null>(null)
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { toggleUserKind } = useContext(UserKindContext)
    const { toggleAccentColor } = useContext(ThemeContext)
    const { resetOrder } = useContext(DashboardContext)
    const { t } = useTranslation('settings')

    const [errorMsg, setErrorMsg] = useState('')

    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )

    async function load(): Promise<void> {
        try {
            const response = await API.getPersonalData()
            const data: PersDataDetails = response.persdata
            data.pcounter = response.pcounter
            setUserData(data)
            setLoadingState(LoadingState.LOADED)
        } catch (e: any) {
            setLoadingState(LoadingState.ERROR)
            setErrorMsg(e.message)
            if (!isKnownError(e)) {
                captureException(e)
            }
        }
    }

    useEffect(() => {
        void load()
    }, [])

    const onRefresh: () => void = () => {
        void load()
    }

    const handleBiometricAuth = async (): Promise<void> => {
        const securityLevel = await LocalAuthentication.getEnrolledLevelAsync()
        if (securityLevel === 0) {
            // no passcode or biometric auth set up
            router.push('(user)/grades')
            return
        }

        const biometricAuth = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Verify your identity to show your grades',
            fallbackLabel: 'Enter Passcode',
        })

        if (biometricAuth.success) {
            router.push('(user)/grades')
        }
    }

    let toast: any = null
    const copyToClipboard = async (text: string): Promise<void> => {
        if (text.length === 0) {
            return
        }
        await Clipboard.setStringAsync(text)
        // Android shows clipboard toast by default so we don't need to show it
        if (Platform.OS === 'android') {
            return
        }
        if (toast !== null) {
            Toast.hide(toast)
        }

        toast = Toast.show(t('toast.clipboard', { ns: 'common' }), {
            duration: Toast.durations.SHORT,
            position: 50,
            shadow: false,
            animation: true,
            hideOnPress: true,
            delay: 0,
        })
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

    if (userData == null) {
        return <></>
    }

    const sections: FormListSections[] = [
        {
            header: t('profile.formlist.grades.title'),
            items: [
                {
                    title: t('profile.formlist.grades.button'),
                    icon: chevronIcon,
                    onPress: async () => {
                        await handleBiometricAuth()
                    },
                },
            ],
        },
        {
            header: t('profile.formlist.user.title'),
            items: [
                {
                    title: 'Name',
                    value: userData.vname + ' ' + userData.name,
                },
                {
                    title: t('profile.formlist.user.matrical'),
                    value: userData.mtknr,
                    onPress: async () => {
                        await copyToClipboard(userData.mtknr)
                    },
                },
                {
                    title: t('profile.formlist.user.library'),
                    value: userData.bibnr,
                    onPress: async () => {
                        await copyToClipboard(userData.bibnr)
                    },
                },
                {
                    title: t('profile.formlist.user.printer'),
                    value: userData.pcounter,
                },
            ],
        },

        {
            header: t('profile.formlist.study.title'),
            items: [
                {
                    title: t('profile.formlist.study.degree'),
                    value: userData.fachrich + ' (' + userData.stg + ')',
                },
                {
                    title: t('profile.formlist.study.spo'),
                    value: userData.pvers,
                    onPress: async () => {
                        if (userData.po_url.length > 0) {
                            void Linking.openURL(userData.po_url)
                        }
                    },
                },
                {
                    title: t('profile.formlist.study.group'),
                    value: userData.stgru,
                },
            ],
        },
        {
            header: t('profile.formlist.contact.title'),
            items: [
                {
                    title: 'THI Email',
                    value: userData.fhmail,
                    onPress: async () => {
                        await copyToClipboard(userData.fhmail)
                    },
                },
                {
                    title: 'Email',
                    value: userData.email,
                    onPress: async () => {
                        await copyToClipboard(userData.email)
                    },
                },
                {
                    title: t('profile.formlist.contact.phone'),
                    value: userData.telefon,
                    onPress: async () => {
                        await copyToClipboard(userData.telefon)
                    },
                },
                {
                    title: t('profile.formlist.contact.street'),
                    value: userData.str,
                },
                {
                    title: t('profile.formlist.contact.city'),
                    value: userData.plz + ' ' + userData.ort,
                },
            ],
        },
    ]

    return (
        <>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    loadingState !== LoadingState.LOADING &&
                    loadingState !== LoadingState.LOADED ? (
                        <RefreshControl
                            refreshing={
                                loadingState === LoadingState.REFRESHING
                            }
                            onRefresh={onRefresh}
                        />
                    ) : undefined
                }
            >
                {loadingState === LoadingState.LOADING && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
                {loadingState === LoadingState.ERROR && (
                    <ErrorView
                        title={errorMsg}
                        onRefresh={onRefresh}
                        refreshing={false}
                    />
                )}
                {loadingState === LoadingState.LOADED && (
                    <View style={styles.container}>
                        <FormList sections={sections} />
                    </View>
                )}
                <View
                    style={{
                        backgroundColor: colors.card,
                        ...styles.logoutContainer,
                    }}
                >
                    <Pressable
                        onPress={logoutAlert}
                        style={styles.logoutButton}
                    >
                        <PlatformIcon
                            color={colors.notification}
                            ios={{
                                name: 'rectangle.portrait.and.arrow.right',
                                size: 18,
                            }}
                            android={{
                                name: 'logout',
                                size: 22,
                            }}
                        />
                        <Text style={{ color: colors.notification }}>
                            Logout
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    contentContainer: { paddingBottom: 32 },
    container: {
        paddingVertical: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    logoutContainer: {
        borderRadius: 10,
        marginBottom: 30,
        marginTop: 10,
        alignItems: 'center',
        alignSelf: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 40,
        gap: 10,
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
