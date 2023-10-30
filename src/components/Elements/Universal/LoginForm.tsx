import { createGuestSession, createSession } from '@/api/thi-session-handler'
import { LoginFailureAlert } from '@/components/Elements/Settings'
import { type Colors } from '@/stores/colors'
import { FlowContext, UserKindContext } from '@/stores/provider'
import { trimErrorMsg } from '@/utils/api-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
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
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [failure, setFailure] = useState('')
    const router = useRouter()
    const colors = useTheme().colors as Colors
    const { toggleOnboarded, toggleUpdated } = React.useContext(FlowContext)
    const { toggleUserKind } = React.useContext(UserKindContext)
    const [loading, setLoading] = useState(false)

    const floatingKeyboard = useIsFloatingKeyboard()

    const resetFailure = (): void => {
        setFailure('')
    }

    async function login(): Promise<void> {
        try {
            setLoading(true)
            const userKind = await createSession(username, password, true)
            toggleUserKind(userKind)
            toggleUpdated()
            toggleOnboarded()
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
            router.push('/')
        } catch (e: any) {
            const message = trimErrorMsg(e.message)
            setLoading(false)
            setFailure(message)
        }
    }

    async function guestLogin(): Promise<void> {
        setLoading(true)
        await createGuestSession()
        toggleUpdated()
        toggleOnboarded()
        router.push('/')
    }

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
                                        returnKeyType="next"
                                        placeholder="abc1234"
                                        onChangeText={(text) => {
                                            setUsername(text)
                                        }}
                                        selectionColor={colors.primary}
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
                                        placeholder="Password"
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
                                        Sign in
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
                                        or continue as guest
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
    checkboxChecked: {
        backgroundColor: 'blue',
        borderColor: 'blue',
    },
    checkboxUnchecked: {
        backgroundColor: 'white',
        borderColor: 'black',
    },
})

export default LoginForm
