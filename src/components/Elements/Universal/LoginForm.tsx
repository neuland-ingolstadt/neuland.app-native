import API from '@/api/authenticated-api'
import { createGuestSession, createSession } from '@/api/thi-session-handler'
import { LoginAlert } from '@/components/Elements/Settings'
import { type Colors } from '@/components/colors'
import {
    DashboardContext,
    FlowContext,
    UserKindContext,
} from '@/components/contexts'
import { USER_EMPLOYEE, USER_STUDENT } from '@/hooks/contexts/userKind'
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
    const ORGINAL_ERROR_MISSING = 'Wrong or missing parameter'
    const KNOWN_BACKEND_ERRORS = ['Response is not valid JSON']
    const ORIGINAL_ERROR_NO_CONNECTION = 'Network request failed'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [infoMsg, setInfoMsg] = useState('')
    const [notice, setNotice] = useState('')
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { toggleOnboarded, isOnboarded, toggleUpdated, toggleAnalytics } =
        React.useContext(FlowContext)
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
                updateUserFullName((await API.getFullName()) ?? username)
            } else {
                updateUserFullName(username)
            }
            toggleUserKind(userKind)
            toggleUpdated()
            if (isOnboarded === false) {
                toggleAnalytics()
            }
            toggleOnboarded()
            resetOrder(userKind ? USER_STUDENT : USER_EMPLOYEE)
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
            router.navigate('(tabs)')
        } catch (e) {
            const error = e as Error
            const message = trimErrorMsg(error.message)

            setLoading(false)
            setNotice(t('login.alert.error.title'))
            if (message.includes(ORIGINAL_ERROR_WRONG_CREDENTIALS)) {
                setInfoMsg(t('login.alert.error.wrongCredentials'))
            } else if (message.includes(ORIGINAL_ERROR_NO_CONNECTION)) {
                setInfoMsg(t('login.alert.error.noConnection'))
            } else if (message.includes(ORGINAL_ERROR_MISSING)) {
                setInfoMsg(t('login.alert.error.missing'))
            } else if (
                KNOWN_BACKEND_ERRORS.some((error) => message.includes(error))
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
        toggleUserKind(undefined)
        toggleUpdated()
        if (isOnboarded === false) {
            toggleAnalytics()
        }
        toggleOnboarded()
        router.navigate('(tabs)')
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
                style={styles.keyboardContainer}
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
                            <View style={styles.userNameContainer}>
                                <Text
                                    style={{
                                        ...styles.userNameLabel,
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
                            <View style={styles.passwordContainer}>
                                <Text
                                    style={{
                                        ...styles.userNameLabel,
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
                                            ...styles.buttonText,
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

const black = '#000000'
const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
    loginContainer: {
        shadowColor: black,
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
        marginBottom: 12,
        marginTop: 25,
        alignSelf: 'center',
    },
    loginButton: {
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 25,
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
        marginBottom: 16,
    },
    guestText: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 8,
    },
    keyboardContainer: {
        flex: 1,
    },
    userNameContainer: {
        paddingTop: 3,
    },
    userNameLabel: {
        paddingBottom: 5,
    },
    passwordContainer: {
        paddingTop: 15,
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 15,
    },
})

export default LoginForm
