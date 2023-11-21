import API from '@/api/authenticated-api'
import {
    NoSessionError,
    UnavailableSessionError,
} from '@/api/thi-session-handler'
import { ErrorButtonView } from '@/components/Elements/Universal/ErrorPage'
import FormList from '@/components/Elements/Universal/FormList'
import { type Colors } from '@/components/colors'
import { type FormListSections } from '@/types/components'
import { PAGE_PADDING } from '@/utils/style-utils'
import { LoadingState, getStatusBarStyle } from '@/utils/ui-utils'
import Barcode from '@kichiyaki/react-native-barcode-generator'
import { useTheme } from '@react-navigation/native'
import * as Brightness from 'expo-brightness'
import { router, useFocusEffect } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export default function LibraryCode(): JSX.Element {
    const colors = useTheme().colors as Colors
    const { t } = useTranslation('common')
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [libraryCode, setLibraryCode] = useState<string>('')
    const [loadingState, setLoadingState] = useState<LoadingState>(
        LoadingState.LOADING
    )
    const [brightness, setBrightness] = useState<number>(0)
    const brightnessRef = useRef<number>(0)

    async function load(): Promise<void> {
        try {
            setLibraryCode((await API.getLibraryNumber()) ?? '')
            setLoadingState(LoadingState.LOADED)
        } catch (e: any) {
            if (
                e instanceof NoSessionError ||
                e instanceof UnavailableSessionError
            ) {
                router.push('(user)/login')
            } else {
                setLoadingState(LoadingState.ERROR)
                setErrorMsg(e.message)
            }
        }
    }

    useEffect(() => {
        void load()
    }, [])

    const onRefresh: () => void = () => {
        setLoadingState(LoadingState.LOADING)
        void load()
    }

    useEffect(() => {
        brightnessRef.current = brightness
    }, [brightness])

    useFocusEffect(
        React.useCallback(() => {
            return () => {
                void Brightness.setSystemBrightnessAsync(brightnessRef.current)
            }
        }, [])
    )

    useEffect(() => {
        void (async () => {
            const { status } = await Brightness.requestPermissionsAsync()
            if (status === 'granted') {
                const value = await Brightness.getSystemBrightnessAsync()
                setBrightness(value)

                void Brightness.setSystemBrightnessAsync(1)
            }
        })()
    }, [])

    const sections: FormListSections[] = [
        {
            header: t('profile.formlist.user.library', { ns: 'settings' }),
            items: [
                {
                    title: t('pages.library.code.number'),
                    value: libraryCode,
                },
            ],
        },
    ]

    const toggleBrightness = async (): Promise<void> => {
        if ((await Brightness.getSystemBrightnessAsync()) === 1) {
            void Brightness.setSystemBrightnessAsync(brightness)
        } else {
            void Brightness.setSystemBrightnessAsync(1)
        }
    }
    return (
        <View>
            <StatusBar style={getStatusBarStyle()} />
            {loadingState === LoadingState.LOADING && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            )}
            {loadingState === LoadingState.ERROR && (
                <ErrorButtonView message={errorMsg} onRefresh={onRefresh} />
            )}
            {loadingState === LoadingState.LOADED && (
                <View style={styles.container}>
                    <View style={{}}>
                        <FormList sections={sections} />
                    </View>
                    <Pressable
                        style={{
                            marginTop: 20,
                            paddingVertical: 14,
                            backgroundColor: 'white',
                            borderRadius: 10,
                            alignSelf: 'center',
                            marginHorizontal: PAGE_PADDING,
                            width: '100%',
                        }}
                        onPress={() => {
                            void toggleBrightness()
                        }}
                    >
                        <Barcode
                            format="CODE128B"
                            value={libraryCode}
                            maxWidth={Dimensions.get('window').width - 56}
                            width={5}
                            style={{
                                marginVertical: 6,
                                paddingHorizontal: 10,
                                alignSelf: 'center',
                            }}
                        />
                    </Pressable>
                    <View style={styles.notesContainer}>
                        <Text
                            style={[
                                styles.notesText,
                                { color: colors.labelColor },
                            ]}
                        >
                            {t('pages.library.code.footer')}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    barcode: {
        width: 200,
        height: 100,
    },
    page: {
        padding: PAGE_PADDING,
    },
    formList: {
        width: '100%',
        alignSelf: 'center',
    },
    container: {
        paddingVertical: 16,
        paddingHorizontal: PAGE_PADDING,
        width: '100%',
        alignSelf: 'center',
    },
    loadingContainer: {
        paddingVertical: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notesContainer: {
        alignSelf: 'center',
        width: '100%',
        marginTop: 14,
        marginBottom: 40,
    },
    notesText: {
        textAlign: 'left',
        fontSize: 12,
    },
})
