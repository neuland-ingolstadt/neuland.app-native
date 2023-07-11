import FormList from '@/components/FormList'
import { type FormListSections } from '@/stores/types/components'
import { type PersDataDetails } from '@/stores/types/thi-api'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { Box, Button, ScrollView, useToast } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Linking, Platform, useColorScheme } from 'react-native'

import API from '../../api/authenticated-api'
import {
    createGuestSession,
    forgetSession,
} from '../../api/thi-session-handler'

export default function Profile(): JSX.Element {
    const scheme = useColorScheme()
    const [userData, setUserData] = useState<PersDataDetails | null>(null)
    const router = useRouter()
    const toastIdRef = React.useRef()

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
    const toast = useToast()
    const copyToClipboard = async (text: string): Promise<void> => {
        if (text.length === 0) {
            return
        }
        await Clipboard.setStringAsync(text)
        // Android shows clipboard toast by default so we don't need to show it
        if (Platform.OS === 'android') {
            return
        }
        if (toastIdRef.current !== undefined) {
            toast.close(toastIdRef.current)
        }
        toastIdRef.current = toast.show({
            title: 'Copied to clipboard',
            placement: 'top',
            duration: 2000,
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
            <Box
                alignSelf="center"
                bg={scheme === 'dark' ? 'gray.900' : 'white'}
                rounded="lg"
                width="42%"
                mt={5}
                justifyContent="center"
            >
                <Button
                    onPress={() => {
                        logout().catch((e) => {
                            console.log(e)
                        })
                    }}
                    _pressed={{ opacity: 0.5 }}
                    variant="ghost"
                    colorScheme="red"
                    startIcon={
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color="red"
                        />
                    }
                >
                    Logout
                </Button>
            </Box>
        </ScrollView>
    )
}
