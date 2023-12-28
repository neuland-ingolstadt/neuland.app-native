import LoginForm from '@/components/Elements/Universal/LoginForm'
import { type Colors } from '@/components/colors'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native'

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
    const colors = useTheme().colors as Colors
    const floatingKeyboard = useIsFloatingKeyboard()

    return (
        <>
            <StatusBar style={getStatusBarStyle()} />
            <View
                style={{ ...styles.gradient, backgroundColor: colors.primary }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                    enabled={!floatingKeyboard}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.loginContainer}>
                            <LoginForm></LoginForm>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center' },
    gradient: {
        height: '100%',
        width: '100%',
    },
    loginContainer: {
        minHeight: 370,
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
})
