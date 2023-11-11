import API from '@/api/authenticated-api'
import { createGuestSession } from '@/api/thi-session-handler'
import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/stores/colors'
import { UserKindContext } from '@/stores/provider'
import { type FormListSections } from '@/stores/types/components'
import { type PersDataDetails } from '@/stores/types/thi-api'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import * as LocalAuthentication from 'expo-local-authentication'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import Toast from 'react-native-root-toast'

export default function Profile(): JSX.Element {
    const [userData, setUserData] = useState<PersDataDetails | null>(null)
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { toggleUserKind } = React.useContext(UserKindContext)
    const { t } = useTranslation('settings')
    const logout = async (): Promise<void> => {
        try {
            toggleUserKind(undefined)
            await createGuestSession()
            router.push('(tabs)')
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        async function load(): Promise<void> {
            try {
                const response = await API.getPersonalData()
                const data: PersDataDetails = response.persdata
                data.pcounter = response.pcounter
                setUserData(data)
            } catch (e) {
                console.log(e)
            }
        }

        void load()
    }, [])

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
                        logout().catch((e) => {
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
                    icon: 'chevron-forward-outline',
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
                    disabled: true,
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
                    disabled: true,
                },
            ],
        },

        {
            header: t('profile.formlist.study.title'),
            items: [
                {
                    title: t('profile.formlist.study.degree'),
                    value: userData.fachrich + ' (' + userData.stg + ')',
                    disabled: true,
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
                    disabled: true,
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
                    disabled: true,
                },
                {
                    title: t('profile.formlist.contact.city'),
                    value: userData.plz + ' ' + userData.ort,
                    disabled: true,
                },
            ],
        },
    ]

    return (
        <ScrollView>
            <View style={styles.container}>
                <FormList sections={sections} />
            </View>

            <View
                style={{
                    backgroundColor: colors.card,
                    ...styles.logoutContainer,
                }}
            >
                <TouchableOpacity
                    onPress={logoutAlert}
                    activeOpacity={0.5}
                    style={styles.logoutButton}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={24}
                        color={colors.notification}
                        style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: colors.notification }}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 16,
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
        paddingVertical: 10,
        paddingHorizontal: 40,
    },
})
