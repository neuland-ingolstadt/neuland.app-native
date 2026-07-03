import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, TouchableWithoutFeedback, View } from 'react-native'
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'

const SUBTITLE_KEYS = [
	'grades',
	'freeRooms',
	'mapSuggestions',
	'timetable',
	'exams',
	'searchLecturers',
	'viewLecturers',
	'thiNews',
	'printerBalance'
] as const

function shuffleArray(array: string[]): string[] {
	const shuffled = [...array]
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}

const shouldVibrate = Platform.OS === 'ios'

function LoginAnimatedText(): React.JSX.Element {
	const { t, i18n } = useTranslation('flow')
	const texts = useMemo(
		() => shuffleArray(SUBTITLE_KEYS.map((key) => t(`login.subtitles.${key}`))),
		[t, i18n.language]
	)
	const [currentTextIndex, setCurrentTextIndex] = useState(0)
	const currentTextIndexRef = useRef(currentTextIndex)
	const textOpacity = useSharedValue(1)
	const textTranslateY = useSharedValue(0)

	useEffect(() => {
		currentTextIndexRef.current = currentTextIndex
	}, [currentTextIndex])

	useEffect(() => {
		setCurrentTextIndex(0)
	}, [texts])

	const goToNextText = (): void => {
		textOpacity.value = withTiming(0, { duration: 300 }, () => {
			const nextIndex = (currentTextIndexRef.current + 1) % texts.length
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
	}, [currentTextIndex, texts, textOpacity, textTranslateY])

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: textOpacity.value,
			transform: [{ translateY: textTranslateY.value }]
		}
	})
	return (
		<View>
			<Text className="text-text text-[42px] font-bold text-left">
				{t('login.title1')}
			</Text>
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
						className="text-label text-[26px] font-normal mt-2.5 min-h-[30px] text-left"
						numberOfLines={1}
						adjustsFontSizeToFit
					>
						{texts[currentTextIndex]}
					</Text>
				</Animated.View>
			</TouchableWithoutFeedback>
		</View>
	)
}

export default LoginAnimatedText
