import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Elements/Universal/ErrorView'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon, { chevronIcon } from '@/components/Elements/Universal/Icon'
import { type Colors } from '@/components/colors'
import {
    DashboardContext,
    ThemeContext,
    UserKindContext,
} from '@/components/provider'
import { useRefreshByUser } from '@/hooks'
import { USER_STUDENT } from '@/hooks/contexts/userKind'
import { type FormListSections } from '@/types/components'
import { getPersonalData, networkError, performLogout } from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useTheme } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import * as Clipboard from 'expo-clipboard'
import * as LocalAuthentication from 'expo-local-authentication'
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
import Toast from 'react-native-root-toast'

export default function Profile(): JSX.Element {
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { toggleUserKind, userKind } = useContext(UserKindContext)
    const { toggleAccentColor } = useContext(ThemeContext)
    const { resetOrder } = useContext(DashboardContext)
    const { t } = useTranslation('settings')

    const { data, error, isLoading, isPaused, isSuccess, refetch, isError } =
        useQuery({
            queryKey: ['personalData'],
            queryFn: getPersonalData,
            staleTime: 1000 * 60 * 60 * 12, // 12 hours
            gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
            enabled: userKind === USER_STUDENT,
            retry(failureCount, error) {
                if (error instanceof NoSessionError) {
                    router.replace('user/login')
                    return false
                }
                return failureCount < 3
            },
        })
    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

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
                    value: data?.vname + ' ' + data?.name,
                },
                {
                    title: t('profile.formlist.user.matrical'),
                    value: data?.mtknr,
                    onPress: async () => {
                        await copyToClipboard(data?.mtknr ?? '')
                    },
                },
                {
                    title: t('profile.formlist.user.library'),
                    value: data?.bibnr,
                    onPress: async () => {
                        await copyToClipboard(data?.bibnr ?? '')
                    },
                },
                {
                    title: t('profile.formlist.user.printer'),
                    value: data?.pcounter,
                },
            ],
        },

        {
            header: t('profile.formlist.study.title'),
            items: [
                {
                    title: t('profile.formlist.study.degree'),
                    value: data?.fachrich + ' (' + data?.stg + ')',
                },
                {
                    title: t('profile.formlist.study.spo'),
                    value: data?.pvers,
                    onPress: async () => {
                        if (data?.po_url !== undefined && data.po_url !== '') {
                            void Linking.openURL(data.po_url)
                        }
                    },
                },
                {
                    title: t('profile.formlist.study.group'),
                    value: data?.stgru,
                },
            ],
        },
        {
            header: t('profile.formlist.contact.title'),
            items: [
                {
                    title: 'THI Email',
                    value: data?.fhmail,
                    onPress: async () => {
                        await copyToClipboard(data?.fhmail ?? '')
                    },
                },
                {
                    title: 'Email',
                    value: data?.email,
                    onPress: async () => {
                        await copyToClipboard(data?.email ?? '')
                    },
                },
                {
                    title: t('profile.formlist.contact.phone'),
                    value: data?.telefon,
                    onPress: async () => {
                        await copyToClipboard(data?.telefon ?? '')
                    },
                },
                {
                    title: t('profile.formlist.contact.street'),
                    value: data?.str,
                },
                {
                    title: t('profile.formlist.contact.city'),
                    value: data?.plz + ' ' + data?.ort,
                },
            ],
        },
    ]

    return (
        <>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    isSuccess ? (
                        <RefreshControl
                            refreshing={isRefetchingByUser}
                            onRefresh={() => {
                                void refetchByUser()
                            }}
                        />
                    ) : undefined
                }
            >
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="small"
                            color={colors.primary}
                        />
                    </View>
                )}
                {isError && (
                    <ErrorView
                        title={error.message}
                        onRefresh={refetchByUser}
                        refreshing={isRefetchingByUser}
                    />
                )}
                {isPaused && (
                    <ErrorView
                        title={networkError}
                        onRefresh={refetchByUser}
                        refreshing={isRefetchingByUser}
                    />
                )}
                {isSuccess && (
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
