import { createGuestSession, createSession } from '@/api/thi-session-handler'
import { type Colors } from '@/components/colors'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import {
    STATUS_URL,
    USER_EMPLOYEE,
    USER_GUEST,
    USER_STUDENT,
} from '@/data/constants'
import { trimErrorMsg } from '@/utils/api-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import Color from 'color'
import * as Haptics from 'expo-haptics'
import * as SecureStore from 'expo-secure-store'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Toast from 'react-native-root-toast'

const LoginForm = ({
    navigateHome,
}: {
    navigateHome: () => void
}): JSX.Element => {
    const ORIGINAL_ERROR_WRONG_CREDENTIALS = 'Wrong credentials'
    const ORGINAL_ERROR_MISSING = 'Wrong or missing parameter'
    const KNOWN_BACKEND_ERRORS = ['Response is not valid JSON']
    const ORIGINAL_ERROR_NO_CONNECTION = 'Network request failed'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const colors = useTheme().colors as Colors
    const isDark = useTheme().dark
    const { userKind = USER_GUEST, toggleUserKind } =
        React.useContext(UserKindContext)
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation('flow')
    const { resetOrder } = useContext(DashboardContext)

    async function login(): Promise<void> {
        let showStatus = true
        try {
            setLoading(true)
            const userKind = await createSession(username, password, true)
            toggleUserKind(userKind)
            resetOrder(userKind ? USER_STUDENT : USER_EMPLOYEE)
            if (Platform.OS === 'ios') {
                void Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                )
            }

            Toast.show(t('login.toast'), {
                duration: Toast.durations.LONG,
                position: 50,
                shadow: false,
                animation: true,
                hideOnPress: true,
                delay: 0,
            })
            navigateHome()
        } catch (e) {
            const error = e as Error
            const message = trimErrorMsg(error.message)
            setLoading(false)

            let title = t('login.alert.error.title')
            let msg = t('login.alert.error.generic')

            if (message.includes(ORIGINAL_ERROR_WRONG_CREDENTIALS)) {
                title = t('login.alert.error.wrongCredentials.title')
                msg = t('login.alert.error.wrongCredentials.message')
                showStatus = false
                setPassword('')
            } else if (message.includes(ORIGINAL_ERROR_NO_CONNECTION)) {
                title = t('login.alert.error.noConnection.title')
                msg = t('login.alert.error.noConnection.message')
                showStatus = false
            } else if (message.includes(ORGINAL_ERROR_MISSING)) {
                msg = t('login.alert.error.missing')
                showStatus = false
            } else if (
                KNOWN_BACKEND_ERRORS.some((error) => message.includes(error))
            ) {
                msg = t('login.alert.error.backend')
            }
            Alert.alert(
                title,
                msg,
                [
                    { text: 'OK' },
                    ...(showStatus
                        ? [
                              {
                                  text: t('error.crash.status', {
                                      ns: 'common',
                                  }),
                                  onPress: async () =>
                                      await Linking.openURL(STATUS_URL),
                              },
                          ]
                        : []),
                ],
                {
                    cancelable: false,
                }
            )
        }
    }

    async function guestLogin(): Promise<void> {
        setLoading(true)

        try {
            await createGuestSession(userKind !== USER_GUEST)
        } catch (error) {
            console.error('Failed to create guest session', error)
        }

        toggleUserKind(undefined)
        navigateHome()
    }

    async function load(key: string): Promise<string | null> {
        return SecureStore.getItem(key)
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

                    Alert.alert(
                        t('login.alert.restored.title'),
                        t('login.alert.restored.message'),
                        [{ text: 'OK' }],
                        {
                            cancelable: false,
                        }
                    )
                }
            }

            void loadSavedData()
        }
    }, [])

    const signInDisabled =
        username.trim() === '' || password.trim() === '' || loading
    const disabledBackgroundColor = isDark
        ? Color(colors.primary).darken(0.3).hex()
        : Color(colors.primary).lighten(0.3).hex()
    const disabledTextColor = isDark
        ? Color(getContrastColor(colors.primary)).lighten(0.1).hex()
        : Color(getContrastColor(colors.primary)).darken(0.1).hex()
    return (
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
                    {'THI Account'}
                </Text>
                <View style={styles.userNameContainer}>
                    <Text
                        style={{
                            ...styles.userNameLabel,
                            color: colors.text,
                        }}
                    >
                        {t('login.username')}
                    </Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                color: colors.text,
                                backgroundColor: colors.inputBackground,
                                borderColor: colors.border,
                            },
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
                        autoCorrect={false}
                        textContentType="oneTimeCode"
                    />
                </View>
                <View style={styles.passwordContainer}>
                    <Text
                        style={{
                            ...styles.userNameLabel,
                            color: colors.text,
                        }}
                    >
                        {t('login.password')}
                    </Text>

                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                color: colors.text,
                                backgroundColor: colors.inputBackground,
                                borderColor: colors.border,
                            },
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
                                login().catch((error: Error) => {
                                    console.log(error)
                                })
                            }
                        }}
                        selectionColor={colors.primary}
                        selectTextOnFocus={true}
                        autoCapitalize="none"
                        secureTextEntry={true}
                        clearButtonMode="while-editing"
                        autoComplete="current-password"
                        textContentType="password"
                        autoCorrect={false}
                    />
                </View>
                <TouchableOpacity
                    disabled={signInDisabled}
                    onPress={() => {
                        login().catch((error: Error) => {
                            console.log(error)
                        })
                    }}
                    style={[
                        styles.loginButton,
                        {
                            backgroundColor: signInDisabled
                                ? disabledBackgroundColor
                                : colors.primary,
                        },
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
                                color: signInDisabled
                                    ? disabledTextColor
                                    : getContrastColor(colors.primary),
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
                        >
                            {t('login.guest')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
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
        justifyContent: 'center',
        paddingTop: 30,
        paddingBottom: 30,
    },
    header: {
        fontSize: 23,
        fontWeight: '600',
        textAlign: 'left',

        marginBottom: 14,
    },
    loginButton: {
        height: 40,
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 25,
        borderRadius: 7,
        alignItems: 'center',
    },
    textInput: {
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 7,
        borderWidth: 1,
    },

    guestContainer: {
        paddingTop: 24,
        alignItems: 'center',
    },
    guestText: {
        fontSize: 14.5,
    },

    userNameContainer: {
        paddingTop: 3,
    },
    userNameLabel: {
        paddingBottom: 5,
        fontSize: 15,
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
