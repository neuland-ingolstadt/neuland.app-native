import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Elements/Error/ErrorView'
import FormList from '@/components/Elements/Universal/FormList'
import PlatformIcon from '@/components/Elements/Universal/Icon'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { queryClient } from '@/components/provider'
import { USER_STUDENT } from '@/data/constants'
import { useRefreshByUser } from '@/hooks'
import { type FormListSections } from '@/types/components'
import { getPersonalData, networkError, performLogout } from '@/utils/api-utils'
import { PAGE_PADDING } from '@/utils/style-utils'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'burnt'
import * as Clipboard from 'expo-clipboard'
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
    Text,
    View,
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

export default function Profile(): JSX.Element {
    const router = useRouter()
    const { styles } = useStyles(stylesheet)
    const { toggleUserKind, userKind } = useContext(UserKindContext)
    const { resetOrder } = useContext(DashboardContext)
    const { t } = useTranslation('settings')
    const [isLoggingOut, setIsLoggingOut] = React.useState(false)

    const { data, error, isLoading, isPaused, isSuccess, refetch, isError } =
        useQuery({
            queryKey: ['personalData'],
            queryFn: getPersonalData,
            staleTime: 1000 * 60 * 60 * 12, // 12 hours
            gcTime: 1000 * 60 * 60 * 24 * 60, // 60 days
            enabled: userKind === USER_STUDENT,
            retry(failureCount, error) {
                if (error instanceof NoSessionError) {
                    router.replace('login')
                    return false
                }
                return failureCount < 2
            },
        })
    const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

    const copyToClipboard = async (text: string): Promise<void> => {
        if (text.length === 0) {
            return
        }
        await Clipboard.setStringAsync(text)
        // Android shows clipboard toast by default so we don't need to show it
        if (Platform.OS === 'android') {
            return
        }

        toast({
            title: t('toast.clipboard', {
                ns: 'common',
            }),
            message: text,
            preset: 'done',
            haptic: 'success',
            duration: 2,
            from: 'top',
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
                        setIsLoggingOut(true)
                        performLogout(toggleUserKind, resetOrder, queryClient)
                            .catch((e) => {
                                console.log(e)
                            })
                            .finally(() => {
                                setIsLoggingOut(false)
                            })
                    },
                },
            ]
        )
    }

    const sections: FormListSections[] = [
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
                    value:
                        data?.pvers === 'k.A.'
                            ? t('misc.unknown', { ns: 'common' })
                            : data?.pvers,
                    onPress: async () => {
                        if (
                            data?.po_url !== undefined &&
                            data.po_url !== '' &&
                            data.po_url !== 'http://www.thi.de'
                        ) {
                            void Linking.openURL(data.po_url)
                        }
                    },
                },
                {
                    title: t('profile.formlist.study.group'),
                    value: data?.stgru,
                },
                {
                    title: t('profile.formlist.user.status'),
                    value:
                        data?.rue === '1'
                            ? data?.rue_sem
                            : t('profile.formlist.user.statusInactive'),
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
                ...(data?.email === ''
                    ? []
                    : [
                          {
                              title: 'Email',
                              value: data?.email,
                              onPress: async () => {
                                  await copyToClipboard(data?.email ?? '')
                              },
                          },
                      ]),
                ...(data?.telefon === ''
                    ? []
                    : [
                          {
                              title: t('profile.formlist.contact.phone'),
                              value: data?.telefon,
                              onPress: async () => {
                                  await copyToClipboard(data?.telefon ?? '')
                              },
                          },
                      ]),
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
                            color={styles.primary.color}
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
                {isSuccess &&
                    (data?.mtknr !== undefined ? (
                        <View style={styles.container}>
                            <FormList sections={sections} />
                        </View>
                    ) : (
                        <ErrorView
                            title={t('profile.error.title')}
                            message={t('profile.error.message')}
                            buttonText="Primuss"
                            onButtonPress={() => {
                                void Linking.openURL(
                                    'https://www3.primuss.de/cgi-bin/login/index.pl?FH=fhin'
                                )
                            }}
                            refreshing={isRefetchingByUser}
                            onRefresh={refetchByUser}
                            icon={{
                                ios: 'person.crop.circle.badge.exclamationmark',
                                android: 'account_circle_off',
                            }}
                            isCritical={false}
                        />
                    ))}

                <Pressable
                    onPress={logoutAlert}
                    style={styles.logoutButton}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator
                            size="small"
                            color={styles.notification.color}
                        />
                    ) : (
                        <>
                            <PlatformIcon
                                ios={{
                                    name: 'rectangle.portrait.and.arrow.right',
                                    size: 18,
                                }}
                                android={{
                                    name: 'logout',
                                    size: 22,
                                }}
                                style={styles.notification}
                            />
                            <Text style={styles.logoutText}>
                                {t('profile.logout.button')}
                            </Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    contentContainer: { paddingBottom: 32 },
    container: {
        paddingVertical: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    logoutButton: {
        borderRadius: 10,
        marginBottom: 30,
        marginTop: 10,
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 40,
        gap: 10,
        minWidth: 165,
        justifyContent: 'center',
        backgroundColor: theme.colors.card,
    },
    logoutText: {
        fontSize: 16,
        color: theme.colors.notification,
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primary: {
        color: theme.colors.primary,
    },
    notification: {
        color: theme.colors.notification,
    },
}))
