import FormList from '@/components/FormList'
import { type FormListSections } from '@/stores/types/components'
import { type PersDataDetails } from '@/stores/types/thi-api'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    Linking,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native'
import Toast from 'react-native-root-toast'

import API from '../../api/authenticated-api'
import {
    createGuestSession,
    forgetSession,
} from '../../api/thi-session-handler'

export default function Profile(): JSX.Element {
    const scheme = useColorScheme()
    const [userData, setUserData] = useState<PersDataDetails | null>(null)
    const router = useRouter()
    const logout = async (): Promise<void> => {
        try {
            await forgetSession()
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

        toast = Toast.show('copied to clipboard', {
            duration: Toast.durations.SHORT,
            position: 55,
            shadow: false,
            animation: true,
            hideOnPress: true,
            delay: 0,
        })
    }

    if (userData == null) {
        return <></>
    }

    const sections: FormListSections[] = [
        {
            header: 'User',
            items: [
                {
                    title: 'Name',
                    value: userData.vname + ' ' + userData.name,
                    disabled: true,
                },
                {
                    title: 'Matriculation Number',
                    value: userData.mtknr,
                    onPress: async () => {
                        await copyToClipboard(userData.mtknr)
                    },
                },
                {
                    title: 'Library Number',
                    value: userData.bibnr,
                    onPress: async () => {
                        await copyToClipboard(userData.bibnr)
                    },
                },
                {
                    title: 'Printer Credits',
                    value: userData.pcounter,
                    disabled: true,
                },
            ],
        },

        {
            header: 'Study',
            items: [
                {
                    title: 'Degree',
                    value: userData.fachrich + ' (' + userData.stg + ')',
                    disabled: true,
                },
                {
                    title: 'Exam Regulations',
                    value: userData.pvers,
                    onPress: async () => {
                        if (userData.po_url.length > 0) {
                            void Linking.openURL(userData.po_url)
                        }
                    },
                },
                {
                    title: 'Study Group',
                    value: userData.stgru,
                    disabled: true,
                },
            ],
        },
        {
            header: 'Contact',
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
                    title: 'Phone',
                    value: userData.telefon,
                    onPress: async () => {
                        await copyToClipboard(userData.telefon)
                    },
                },
                {
                    title: 'Street',
                    value: userData.str,
                    disabled: true,
                },
                {
                    title: 'City',
                    value: userData.plz + ' ' + userData.ort,
                    disabled: true,
                },
            ],
        },
    ]

    return (
        <ScrollView>
            <FormList sections={sections} />
            <View
                style={{
                    backgroundColor: scheme === 'dark' ? 'gray.900' : 'white',
                    borderRadius: 10,
                    width: '42%',
                    marginTop: 14,

                    alignItems: 'center',
                    alignSelf: 'center',
                }}
            >
                <TouchableOpacity
                    onPress={() => {
                        logout().catch((e) => {
                            console.log(e)
                        })
                    }}
                    activeOpacity={0.5}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 10,
                    }}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={24}
                        color="red"
                        style={{ marginRight: 10 }}
                    />
                    <Text style={{ color: 'red' }}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}
