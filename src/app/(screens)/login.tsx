import LoginForm from '@/components/Elements/Universal/LoginForm'
import { type Colors } from '@/components/colors'
import { PRIVACY_URL } from '@/data/constants'
import { useTheme } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
function shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]] // Swap elements
    }
    return array
}

const textsEN = shuffleArray([
    'to view your grades',
    'to search for free rooms',
    'to get map suggestions',
    'to book a library seat',
    'to view your timetable',
    'to see your exam schedule',
    'to search all lectureres',
    'to view your lectureres',
    'to view the latest THI news',
    'to check your printer balance',
])

const textsDE = shuffleArray([
    'um deine Noten zu sehen',
    'um freie Räume zu suchen',
    'um Karten Vorschläge zu erhalten',
    'um einen Bibliotheksplatz zu buchen',
    'um deinen Stundenplan zu sehen',
    'um deinen Prüfungsplan zu sehen',
    'um alle Dozenten zu suchen',
    'um deine Dozenten zu sehen',
    'um die THI-News anzuzeigen',
    'um dein Drucker Guthaben zu prüfen',
])

export default function Login(): JSX.Element {
    const colors = useTheme().colors as Colors
    const floatingKeyboard = useIsFloatingKeyboard()
    const { t, i18n } = useTranslation('flow')
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const currentTextIndexRef = useRef(currentTextIndex)
    const textOpacity = useSharedValue(1)
    const textTranslateY = useSharedValue(0)
    const texts3 = i18n.language === 'de' ? textsDE : textsEN
    const shouldVibrate = Platform.OS === 'ios'

    const { fromOnboarding } = useLocalSearchParams<{
        fromOnboarding: string
    }>()

    const navigateHome = (): void => {
        if (fromOnboarding === 'true') {
            router.dismissAll()
            router.replace('(tabs)/(index)')
            return
        }
        router.navigate('(tabs)/(index)')
    }

    useEffect(() => {
        currentTextIndexRef.current = currentTextIndex
    }, [currentTextIndex])

    const goToNextText = (): void => {
        textOpacity.value = withTiming(0, { duration: 300 }, () => {
            const nextIndex = (currentTextIndex + 1) % texts3.length
            runOnJS(setCurrentTextIndex)(nextIndex)

            textTranslateY.value = 5
            textOpacity.value = withTiming(1, { duration: 300 })
            textTranslateY.value = withTiming(0, { duration: 600 })
        })
    }

    useEffect(() => {
        const interval = setInterval(goToNextText, 3500)

        return () => {
            clearInterval(interval)
        }
    }, [currentTextIndex, texts3, textOpacity, textTranslateY])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [{ translateY: textTranslateY.value }],
        }
    })

    const insets = useSafeAreaInsets()

    return (
        <>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ ...styles.container, paddingTop: insets.top }}>
                    <KeyboardAvoidingView
                        style={styles.keyboardContainer}
                        behavior="padding"
                        enabled={!floatingKeyboard}
                    >
                        <View>
                            <Text
                                style={{
                                    ...styles.header1,
                                    color: colors.text,
                                }}
                            >
                                {t('login.title1')}
                            </Text>
                            <TouchableWithoutFeedback
                                onPress={() => {
                                    goToNextText()
                                    if (shouldVibrate) {
                                        void Haptics.selectionAsync()
                                    }
                                }}
                            >
                                <Animated.View style={animatedStyle}>
                                    <Text
                                        style={{
                                            ...styles.header3,
                                            color: colors.labelColor,
                                        }}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit
                                    >
                                        {texts3[currentTextIndex]}
                                    </Text>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style={styles.loginContainer}>
                            <LoginForm navigateHome={navigateHome} />
                        </View>
                        <View />
                        <View />
                    </KeyboardAvoidingView>
                    <View style={styles.linkContainer}>
                        <Pressable
                            onPress={() => {
                                void Linking.openURL(PRIVACY_URL)
                            }}
                        >
                            <Text
                                style={{
                                    ...styles.privacyLink,
                                    color: colors.labelColor,
                                }}
                            >
                                {t('onboarding.links.privacy')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </>
    )
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        justifyContent: 'space-evenly',
    },
    container: {
        flex: 1,
        width: '90%',
        alignSelf: 'center',
    },

    loginContainer: {},
    header1: {
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'left',
    },

    header3: {
        fontSize: 26,
        textAlign: 'left',
        marginTop: 10,
        fontWeight: '400',
        minHeight: 30,
    },
    linkContainer: {
        bottom: 70,
        position: 'absolute',
        gap: 6,
        alignSelf: 'center',
        alignItems: 'center',
    },
    privacyLink: {
        textAlign: 'center',
        fontSize: 14,
    },
})
