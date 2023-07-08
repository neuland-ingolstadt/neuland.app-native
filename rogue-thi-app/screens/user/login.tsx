import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import {
    Alert,
    Box,
    Button,
    Center,
    Checkbox,
    FormControl,
    HStack,
    Icon,
    IconButton,
    Input,
    KeyboardAvoidingView,
    Pressable,
    Text,
    VStack,
    useToast,
} from 'native-base'
import React, { useEffect, useState } from 'react'
import {
    Dimensions,
    Keyboard,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useColorScheme,
} from 'react-native'

import {
    createGuestSession,
    createSession,
} from '../../lib/backend/thi-session-handler'

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

export default useIsFloatingKeyboard

export function LoginScreen(): JSX.Element {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [saveCredentials, setSaveCredentials] = useState(true)
    const [failure, setFailure] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const toast = useToast()
    const colorScheme = useColorScheme()
    const toggleSaveCredentials = (): void => {
        setSaveCredentials(!saveCredentials)
    }
    const toggleShowPassword = (): void => {
        setShowPassword(!showPassword)
    }
    const floatingKeyboard = useIsFloatingKeyboard()

    const resetFailure = (): void => {
        setFailure(false)
    }

    async function login(): Promise<void> {
        try {
            await createSession(username, password, saveCredentials)

            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            ).catch(() => {})
            toast.show({
                title: 'Login successful',
                placement: 'top',
                duration: 3000,
            })
            router.push('(tabs)')
        } catch (e: any) {
            setFailure(e.message)
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
            style={{
                height: '100%',
                width: '100%',
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                enabled={!floatingKeyboard}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Box
                            bg={colorScheme === 'dark' ? 'black' : 'white'}
                            shadow={2}
                            rounded="lg"
                            maxWidth={500}
                            width="90%"
                            p={8}
                            justifyContent="center"
                        >
                            <Text
                                style={{
                                    fontSize: 22,
                                    fontWeight: 'bold',
                                    marginBottom: 30,
                                    marginTop: 10,
                                }}
                            >
                                Sign in with your THI account
                            </Text>

                            {failure ? (
                                <Center>
                                    <Alert
                                        status="error"
                                        width="100%"
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <VStack space={1} w={'90%'}>
                                            <HStack
                                                flexShrink={1}
                                                space={2}
                                                justifyContent="space-between"
                                            >
                                                <HStack
                                                    flexShrink={1}
                                                    space={2}
                                                    alignItems="center"
                                                >
                                                    <Alert.Icon />
                                                    <Text
                                                        fontSize="md"
                                                        fontWeight="medium"
                                                        color="coolGray.800"
                                                    >
                                                        Login failed
                                                    </Text>
                                                </HStack>
                                                <IconButton
                                                    variant="unstyled"
                                                    _focus={{
                                                        borderWidth: 0,
                                                    }}
                                                    icon={
                                                        <Ionicons
                                                            name="close"
                                                            size={14}
                                                            color="black"
                                                        />
                                                    }
                                                    _icon={{
                                                        color: 'coolGray.600',
                                                    }}
                                                    onPress={resetFailure}
                                                />
                                            </HStack>
                                            <Box
                                                flexShrink={1}
                                                _text={{
                                                    color: 'coolGray.600',
                                                }}
                                            >
                                                <Text
                                                    ellipsizeMode="tail"
                                                    numberOfLines={1}
                                                    color="black"
                                                >
                                                    {failure}
                                                </Text>
                                            </Box>
                                        </VStack>
                                    </Alert>
                                </Center>
                            ) : null}
                            <FormControl paddingTop={3}>
                                <FormControl.Label>
                                    THI Username
                                </FormControl.Label>
                                <Input
                                    size="lg"
                                    placeholder="abc1234"
                                    onChangeText={(text) => {
                                        setUsername(text)
                                    }}
                                    textContentType="username"
                                    autoCapitalize="none"
                                />
                            </FormControl>
                            <FormControl paddingTop={3}>
                                <FormControl.Label>Password</FormControl.Label>
                                <Input
                                    size="lg"
                                    placeholder="Password"
                                    onChangeText={(text) => {
                                        setPassword(text)
                                    }}
                                    textContentType="password"
                                    secureTextEntry={!showPassword}
                                    type={showPassword ? 'text' : 'password'}
                                    InputRightElement={
                                        <Pressable
                                            onPress={() => {
                                                toggleShowPassword()
                                            }}
                                        >
                                            <Icon
                                                as={Ionicons}
                                                name={
                                                    showPassword
                                                        ? 'eye-off-outline'
                                                        : 'eye-outline'
                                                }
                                                size={5}
                                                mr="2"
                                                color="muted.400"
                                            />
                                        </Pressable>
                                    }
                                />
                            </FormControl>

                            <Box width="100%" mt={2} mb={2} paddingY={3}>
                                <Checkbox
                                    size={'sm'}
                                    value="saveCredentials"
                                    my={1}
                                    onChange={toggleSaveCredentials}
                                    defaultIsChecked={true}
                                >
                                    Stay signed in
                                </Checkbox>
                            </Box>

                            <Button
                                onPress={() => {
                                    login().catch((error: Error) => {
                                        console.log(error)
                                    })
                                }}
                                colorScheme={'primary'}
                            >
                                {'Sign in'}
                            </Button>

                            <HStack>
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
                                        }}
                                    >
                                        {'Or continue as guest'}
                                    </Text>
                                </TouchableOpacity>
                            </HStack>
                        </Box>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}
