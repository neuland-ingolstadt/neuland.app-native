import { createGuestSession, createSession } from '@/api/thi-session-handler'
import { LoginFailureAlert } from '@/components/Elements/Settings'
import { Checkbox } from '@/components/Elements/Universal/Checkbox'
import { type Colors } from '@/stores/colors'
import { USER_GUEST } from '@/stores/hooks/userKind'
import { UserKindContext } from '@/stores/provider'
import { trimErrorMsg } from '@/utils/api-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
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

export default function Login(): JSX.Element {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [saveCredentials, setSaveCredentials] = useState(true)
    const [failure, setFailure] = useState('')
    const router = useRouter()
    const colors = useTheme().colors as Colors

    const { toggleUserKind } = React.useContext(UserKindContext)

    const floatingKeyboard = useIsFloatingKeyboard()

    const resetFailure = (): void => {
        setFailure('')
    }

    async function login(): Promise<void> {
        try {
            const userKind = await createSession(
                username,
                password,
                saveCredentials
            )
            toggleUserKind(userKind)

            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            ).catch(() => {})

            Toast.show('Login successful', {
                duration: Toast.durations.LONG,
                position: 50,
                shadow: false,
                animation: true,
                hideOnPress: true,
                delay: 0,
            })
            router.push('(tabs)')
        } catch (e: any) {
            const message = trimErrorMsg(e.message)
            setFailure(message)
        }
    }

    async function guestLogin(): Promise<void> {
        await createGuestSession()
        toggleUserKind(USER_GUEST)
        router.push('(tabs)')
    }

    return (
        <LinearGradient
            colors={[colors.primary, '#cd148c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
        >
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
                                { backgroundColor: colors.background },
                            ]}
                        >
                            <Text
                                style={[styles.header, { color: colors.text }]}
                                adjustsFontSizeToFit={true}
                                numberOfLines={1}
                            >
                                Sign in with your THI account
                            </Text>

                            {failure !== '' ? (
                                <LoginFailureAlert
                                    errorMsg={failure}
                                    resetFailure={resetFailure}
                                />
                            ) : null}
                            <View style={{ paddingTop: 3 }}>
                                <Text
                                    style={{
                                        paddingBottom: 5,
                                        color: colors.labelColor,
                                    }}
                                >
                                    THI Username
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
                                        placeholder="abc1234"
                                        onChangeText={(text) => {
                                            setUsername(text)
                                        }}
                                        autoCapitalize="none"
                                        autoComplete="username"
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
                                    Password
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
                                        placeholder="Passwort"
                                        onChangeText={(text) => {
                                            setPassword(text)
                                        }}
                                        autoCapitalize="none"
                                        secureTextEntry={true}
                                        autoComplete="current-password"
                                    />
                                </View>
                            </View>

                            <View style={styles.checkboxContainer}>
                                <Pressable
                                    onPress={() => {
                                        setSaveCredentials(!saveCredentials)
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Checkbox
                                        checked={saveCredentials}
                                        onChange={setSaveCredentials}
                                        activeButtonStyle={{
                                            backgroundColor: colors.primary,
                                            borderColor: colors.border,
                                        }}
                                        inactiveButtonStyle={{
                                            backgroundColor: colors.card,
                                            borderColor: colors.labelColor,
                                        }}
                                        style={{
                                            marginRight: 5,
                                        }}
                                    />

                                    <Text style={{ color: colors.text }}>
                                        Stay signed in
                                    </Text>
                                </Pressable>
                            </View>

                            <TouchableOpacity
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
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        color: getContrastColor(colors.primary),
                                    }}
                                >
                                    Sign in
                                </Text>
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
                                        or continue as guest
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    gradient: {
        height: '100%',
        width: '100%',
    },
    loginContainer: {
        shadowColor: '#00000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 10,
        maxWidth: 500,
        width: '90%',
        paddingVertical: 30,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        marginTop: 5,
        alignSelf: 'center',
    },
    loginButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
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
    checkboxContainer: {
        paddingTop: 20,
        marginRight: 10,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    guestContainer: {
        paddingTop: 3,
        alignItems: 'center',
    },
    guestText: {
        fontSize: 13,
        marginTop: 10,
    },
    checkboxChecked: {
        backgroundColor: 'blue',
        borderColor: 'blue',
    },
    checkboxUnchecked: {
        backgroundColor: 'white',
        borderColor: 'black',
    },
})
