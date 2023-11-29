import API from '@/api/authenticated-api'
import { createGuestSession, createSession } from '@/api/thi-session-handler'
import { LoginAlert } from '@/components/Elements/Settings'
import { type Colors } from '@/components/colors'
import {
    DashboardContext,
    FlowContext,
    UserKindContext,
} from '@/components/provider'
import { trimErrorMsg } from '@/utils/api-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import Toast from 'react-native-root-toast'

const useIsFloatingKeyboard = (): boolean => {
    const windowWidth = Dimensions.get('window').width
    const [floating, setFloating] = useState(false)
    useEffect(() => {
        const onKeyboardWillChangeFrame = (event: any): void => {
            setFloating(event.endCoordinates.width !== windowWidth)
        }

        Keyboard.addListener(
            'keyboardWillChangeFrame',
            onKeyboardWillChangeFrame
        )
        return () => {
            Keyboard.removeAllListeners('keyboardWillChangeFrame')
        }
    }, [windowWidth])

    return floating
}

const LoginForm = (): JSX.Element => {
    const ORIGINAL_ERROR_WRONG_CREDENTIALS = 'Wrong credentials'
    const KNOWN_BACKEND_ERRORS = ['Response is not valid JSON']
    const ORIGINAL_ERROR_NO_CONNECTION = 'Network request failed'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [infoMsg, setInfoMsg] = useState('')
    const [notice, setNotice] = useState('')
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { toggleOnboarded, toggleUpdated } = React.useContext(FlowContext)
    const { toggleUserKind, updateUserFullName } =
        React.useContext(UserKindContext)
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation('flow')
    const floatingKeyboard = useIsFloatingKeyboard()
    const { resetOrder } = useContext(DashboardContext)
    const resetInfo = (): void => {
        setInfoMsg('')
        setNotice('')
    }

    async function login(): Promise<void> {
        try {
            setLoading(true)
            const userKind = await createSession(username, password, true)
            if (userKind) {
                updateUserFullName(await API.getFullName())
            } else {
                updateUserFullName(username)
            }
            toggleUserKind(userKind)
            toggleUpdated()
            toggleOnboarded()
            resetOrder()
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            ).catch(() => {})

            Toast.show(t('login.toast'), {
                duration: Toast.durations.LONG,
                position: 50,
                shadow: false,
                animation: true,
                hideOnPress: true,
                delay: 0,
            })
            router.push('/')
        } catch (e: any) {
            const message = trimErrorMsg(e.message)
            setLoading(false)
            setNotice(t('login.alert.error.title'))
            if (message.includes(ORIGINAL_ERROR_WRONG_CREDENTIALS)) {
                setInfoMsg(t('login.alert.error.wrongCredentials'))
            } else if (message.includes(ORIGINAL_ERROR_NO_CONNECTION)) {
                setInfoMsg(t('login.alert.error.noConnection'))
            } else if (
                KNOWN_BACKEND_ERRORS.some((error) => e.message.includes(error))
            ) {
                setInfoMsg(t('login.alert.error.backend'))
            } else {
                setInfoMsg(t('login.alert.error.generic'))
            }
        }
    }

    async function guestLogin(): Promise<void> {
        setLoading(true)
        await createGuestSession()
        toggleUserKind('guest')
        toggleUpdated()
        toggleOnboarded()
        router.push('/')
    }

    async function load(key: string): Promise<string | null> {
        return await SecureStore.getItemAsync(key)
    }

    useEffect(() => {
        // on iOS secure store is synced with iCloud, so we can prefill the login form
        if (Platform.OS === 'ios') {
            const loadSavedData = async (): Promise<void> => {
                const savedUsername = await load('username')
                const savedPassword = await load('password')
                if (savedUsername !== null && savedPassword !== null) {
                    setUsername(savedUsername)
                    setPassword(savedPassword)
                    setNotice(t('login.alert.restored.title'))
                    setInfoMsg(t('login.alert.restored.message'))
                }
            }

            void loadSavedData()
        }
    }, [])

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                enabled={!floatingKeyboard}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <View
                            style={[
                                styles.loginContainer,
                                { backgroundColor: colors.card },
                            ]}
                        >
                            <Text
                                style={[styles.header, { color: colors.text }]}
                                adjustsFontSizeToFit={true}
                                numberOfLines={1}
                            >
                                {t('login.title')}
                            </Text>

                            {infoMsg !== '' ? (
                                <LoginAlert
                                    errorMsg={infoMsg}
                                    errorTitle={notice}
                                    resetAlert={resetInfo}
                                />
                            ) : null}
                            <View style={{ paddingTop: 3 }}>
                                <Text
                                    style={{
                                        paddingBottom: 5,
                                        color: colors.labelColor,
                                    }}
                                >
                                    {t('login.username')}
                                </Text>
                                <View
                                    style={[
                                        styles.textInputContainer,
                                        {
                                            borderColor:
                                                colors.labelTertiaryColor,
                                        },
                                    ]}
                                >
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            { color: colors.text },
                                        ]}
                                        placeholderTextColor={colors.labelColor}
                                        defaultValue={username}
                                        returnKeyType="next"
                                        placeholder="abc1234"
                                        onChangeText={(text) => {
                                            setUsername(text)
                                        }}
                                        clearButtonMode="while-editing"
                                        selectionColor={colors.primary}
                                        autoCapitalize="none"
                                        autoComplete="username"
                                        textContentType="username"
                                    />
                                </View>
                            </View>
                            <View style={{ paddingTop: 15 }}>
                                <Text
                                    style={{
                                        paddingBottom: 5,
                                        color: colors.labelColor,
                                    }}
                                >
                                    {t('login.password')}
                                </Text>
                                <View
                                    style={[
                                        styles.textInputContainer,
                                        {
                                            borderColor:
                                                colors.labelTertiaryColor,
                                        },
                                    ]}
                                >
                                    <TextInput
                                        style={[
                                            styles.textInput,
                                            { color: colors.text },
                                        ]}
                                        placeholderTextColor={colors.labelColor}
                                        placeholder={t('login.password')}
                                        defaultValue={password}
                                        returnKeyType="done"
                                        onChangeText={(text) => {
                                            setPassword(text)
                                        }}
                                        onSubmitEditing={() => {
                                            if (username !== '') {
                                                login().catch(
                                                    (error: Error) => {
                                                        console.log(error)
                                                    }
                                                )
                                            }
                                        }}
                                        selectionColor={colors.primary}
                                        selectTextOnFocus={true}
                                        autoCapitalize="none"
                                        secureTextEntry={true}
                                        clearButtonMode="while-editing"
                                        autoComplete="current-password"
                                        textContentType="password"
                                    />
                                </View>
                            </View>
                            <TouchableOpacity
                                disabled={loading}
                                onPress={() => {
                                    login().catch((error: Error) => {
                                        console.log(error)
                                    })
                                }}
                                style={[
                                    styles.loginButton,
                                    { backgroundColor: colors.primary },
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator
                                        color={getContrastColor(colors.primary)}
                                        size={15}
                                    />
                                ) : (
                                    <Text
                                        style={{
                                            fontWeight: 'bold',
                                            fontSize: 15,
                                            color: getContrastColor(
                                                colors.primary
                                            ),
                                        }}
                                    >
                                        {t('login.button')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                            <View style={styles.guestContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        guestLogin().catch((error: Error) => {
                                            console.log(error)
                                        })
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.guestText,
                                            {
                                                color: colors.labelSecondaryColor,
                                            },
                                        ]}
                                        allowFontScaling={true}
                                    >
                                        {t('login.guest')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loginContainer: {
        shadowColor: '#00000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderRadius: 10,
        width: '100%',
        maxWidth: 400,
        paddingHorizontal: 25,
        paddingVertical: 20,
        justifyContent: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        paddingTop: 15,
        alignSelf: 'center',
    },
    loginButton: {
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    textInput: {
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    textInputContainer: {
        borderWidth: 1,
        borderRadius: 5,
    },
    guestContainer: {
        paddingTop: 3,
        alignItems: 'center',
        paddingBottom: 10,

        marginBottom: 15,
    },
    guestText: {
        fontSize: 14,
        marginTop: 10,
    },
})

export default LoginForm
