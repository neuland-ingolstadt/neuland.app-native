import LoginForm from '@/components/Elements/Universal/LoginForm'
import { type Colors } from '@/components/colors'
import { getStatusBarStyle } from '@/utils/ui-utils'
import { useTheme } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
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
            <LinearGradient
                colors={[colors.primary, '#cd148c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'center' }}
                    enabled={!floatingKeyboard}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.loginContainer}>
                            <LoginForm></LoginForm>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </LinearGradient>
        </>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
