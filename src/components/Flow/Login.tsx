import LoginForm from '@/components/Universal/LoginForm'
import { PRIVACY_URL } from '@/data/constants'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import LoginAnimatedText from './LoginAnimatedText'

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
    const { styles } = useStyles(stylesheet)
    const floatingKeyboard = useIsFloatingKeyboard()
    const { t } = useTranslation('flow')

    const { fromOnboarding } = useLocalSearchParams<{
        fromOnboarding: string
    }>()

    const navigateHome = (): void => {
        if (fromOnboarding === 'true') {
            router.dismissAll()
            router.replace('/')
            return
        }
        router.dismissAll()
        if (Platform.OS === 'web') {
            router.replace('/')
        }
    }

    const insets = useSafeAreaInsets()

    return (
        <>
            <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                disabled={Platform.OS === 'web'}
            >
                <View style={{ ...styles.container, paddingTop: insets.top }}>
                    <KeyboardAvoidingView
                        style={styles.keyboardContainer}
                        behavior="padding"
                        enabled={!floatingKeyboard}
                    >
                        <LoginAnimatedText />
                        <LoginForm navigateHome={navigateHome} />
                        <View />
                        <View />
                    </KeyboardAvoidingView>
                    <View style={styles.linkContainer}>
                        <Pressable
                            onPress={() => {
                                void Linking.openURL(PRIVACY_URL)
                            }}
                        >
                            <Text style={styles.privacyLink}>
                                {t('onboarding.links.privacy')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        alignSelf: 'center',
        flex: 1,
        width: '90%',
    },

    keyboardContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
    },
    linkContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        bottom: 70,
        gap: 6,
        position: 'absolute',
    },
    privacyLink: {
        color: theme.colors.labelColor,
        fontSize: 14,
        textAlign: 'center',
    },
}))
