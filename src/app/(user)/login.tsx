import { type Colors } from '@/stores/provider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@react-navigation/native'
import Checkbox from 'expo-checkbox'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
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
    useColorScheme,
} from 'react-native'
import Toast from 'react-native-root-toast'

import {
    createGuestSession,
    createSession,
} from '../../api/thi-session-handler'

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
    const colorScheme = useColorScheme()

    const floatingKeyboard = useIsFloatingKeyboard()

    const resetFailure = (): void => {
        setFailure('')
    }

    async function login(): Promise<void> {
        try {
            await createSession(username, password, saveCredentials)

            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            ).catch(() => {})

            Toast.show('Login successful', {
                duration: Toast.durations.LONG,
                position: 55,
                shadow: false,
                animation: true,
                hideOnPress: true,
                delay: 0,
            })
            router.push('(tabs)')
        } catch (e: any) {
            const message = removeNumber(e.message)
            console.log(message)
            setFailure(message)
        }
    }

    const removeNumber = (str: string): string => {
        const match = str.match(/"([^"]*)"/)
        if (match !== null) {
            return match[1].trim()
        } else {
            return str
        }
    }

    async function guestLogin(): Promise<void> {
        await createGuestSession()
        router.push('(tabs)')
    }

    return (
        <LinearGradient
            colors={['#f7ba2c', '#ea5459']}
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
                            style={{
                                backgroundColor:
                                    colorScheme === 'dark' ? 'black' : 'white',
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
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 22,
                                    fontWeight: 'bold',
                                    marginBottom: 20,
                                    marginTop: 10,
                                    alignSelf: 'center',
                                    color: colors.text,
                                }}
                            >
                                Sign in with your THI account
                            </Text>

                            {failure !== '' ? (
                                <View style={{ alignItems: 'center' }}>
                                    <View
                                        style={{
                                            backgroundColor: '#f9c0c0df',
                                            width: '100%',
                                            justifyContent: 'center',

                                            paddingVertical: 10,
                                            paddingHorizontal: 20,
                                            borderRadius: 5,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                width: '90%',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: 'bold',
                                                        color: 'black',
                                                    }}
                                                >
                                                    Login failed
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={resetFailure}
                                                style={{
                                                    marginLeft: 'auto',
                                                }}
                                            >
                                                <Ionicons
                                                    name="close"
                                                    size={16}
                                                    color="black"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View
                                            style={{
                                                width: '90%',
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                style={{ marginTop: 4 }}
                                            >
                                                {failure}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ) : null}
                            <View style={{ paddingTop: 3 }}>
                                <Text
                                    style={{
                                        paddingBottom: 5,
                                        color: colors.text,
                                    }}
                                >
                                    THI Username
                                </Text>
                                <View
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.labelTertiaryColor,
                                        borderRadius: 5,
                                    }}
                                >
                                    <TextInput
                                        style={{
                                            fontSize: 16,
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                            color: colors.text,
                                        }}
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
                                        color: colors.text,
                                    }}
                                >
                                    Password
                                </Text>
                                <View
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.labelTertiaryColor,
                                        borderRadius: 5,
                                    }}
                                >
                                    <TextInput
                                        style={{
                                            fontSize: 16,
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                        }}
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

                            <View
                                style={{
                                    paddingTop: 20,
                                    paddingBottom: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <Checkbox
                                    onValueChange={setSaveCredentials}
                                    value={saveCredentials}
                                    color={
                                        saveCredentials
                                            ? colors.primary
                                            : colors.labelSecondaryColor
                                    }
                                    style={{ marginRight: 10 }}
                                />

                                <Text style={{ color: colors.text }}>
                                    Stay signed in
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    login().catch((error: Error) => {
                                        console.log(error)
                                    })
                                }}
                                style={{
                                    backgroundColor: colors.primary,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    borderRadius: 5,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        color: colors.text,
                                    }}
                                >
                                    Sign in
                                </Text>
                            </TouchableOpacity>
                            <View
                                style={{
                                    paddingTop: 3,
                                    alignItems: 'center',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        guestLogin().catch((error: Error) => {
                                            console.log(error)
                                        })
                                    }}
                                >
                                    <Text
                                        style={{
                                            opacity: 0.7,
                                            fontSize: 13,
                                            marginTop: 10,
                                            color: colors.labelColor,
                                        }}
                                    >
                                        {'or continue as guest'}
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
})
