import { useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
	runOnJS,
	type SharedValue,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'

const ATTRIBUTION_VISIBLE_MS = 5000
const IGNORE_PROGRAMMATIC_MOVE_MS = 1000

export function useOsmAttributionFade(mapReady: boolean): {
	opacity: SharedValue<number>
	onRegionChange: (changing: boolean) => void
} {
	const [isVisible, setIsVisible] = useState(true)
	const [regionChange, setRegionChange] = useState(false)
	const [isFocused, setIsFocused] = useState(false)
	const opacity = useSharedValue(1)
	const fadeOutStarted = useRef(false)
	const panFadeArmed = useRef(false)

	const startFadeOut = useCallback((): void => {
		if (fadeOutStarted.current) {
			return
		}
		fadeOutStarted.current = true
		opacity.set(
			withTiming(0, { duration: 500 }, () => {
				runOnJS(setIsVisible)(false)
			})
		)
	}, [opacity])

	useFocusEffect(
		useCallback(() => {
			setIsFocused(true)
			return () => {
				setIsFocused(false)
			}
		}, [])
	)

	useEffect(() => {
		if (!mapReady || !isFocused) {
			panFadeArmed.current = false
			return
		}

		const armTimer = setTimeout(() => {
			panFadeArmed.current = true
		}, IGNORE_PROGRAMMATIC_MOVE_MS)

		return () => {
			clearTimeout(armTimer)
		}
	}, [mapReady, isFocused])

	useEffect(() => {
		if (!mapReady || !isFocused || !isVisible) {
			return
		}

		const timer = setTimeout(() => {
			startFadeOut()
		}, ATTRIBUTION_VISIBLE_MS)

		return () => {
			clearTimeout(timer)
		}
	}, [mapReady, isFocused, isVisible, startFadeOut])

	useEffect(() => {
		if (regionChange && isVisible) {
			startFadeOut()
		}
	}, [regionChange, isVisible, startFadeOut])

	const onRegionChange = useCallback((changing: boolean) => {
		if (!changing || !panFadeArmed.current) {
			return
		}
		setRegionChange(true)
	}, [])

	return { opacity, onRegionChange }
}
