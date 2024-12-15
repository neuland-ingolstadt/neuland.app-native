import { selectionAsync } from 'expo-haptics'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, TouchableWithoutFeedback, View } from 'react-native'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
const shouldVibrate = Platform.OS === 'ios'

function LoginAnimatedText(): JSX.Element {
    const { styles } = useStyles(stylesheet)
    const { t, i18n } = useTranslation('flow')
    const [currentTextIndex, setCurrentTextIndex] = useState(0)
    const currentTextIndexRef = useRef(currentTextIndex)
    const textOpacity = useSharedValue(1)
    const textTranslateY = useSharedValue(0)
    const texts3 = i18n.language === 'de' ? textsDE : textsEN

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
    return (
        <View>
            <Text style={styles.header1}>{t('login.title1')}</Text>
            <TouchableWithoutFeedback
                onPress={() => {
                    goToNextText()
                    if (shouldVibrate) {
                        void selectionAsync()
                    }
                }}
            >
                <Animated.View style={animatedStyle}>
                    <Text
                        style={styles.header3}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        {texts3[currentTextIndex]}
                    </Text>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    )
}

export default LoginAnimatedText

const stylesheet = createStyleSheet((theme) => ({
    header1: {
        color: theme.colors.text,
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'left',
    },

    header3: {
        color: theme.colors.labelColor,
        fontSize: 26,
        fontWeight: '400',
        marginTop: 10,
        minHeight: 30,
        textAlign: 'left',
    },
}))
