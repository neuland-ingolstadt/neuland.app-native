import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useAppState } from './useAppState'
import { useInterval } from './useInterval'

const TICK_INTERVAL_MS = 60 * 1000

export function useNow(enabled: boolean): Date {
	const [now, setNow] = useState(() => new Date())
	const [isFocused, setIsFocused] = useState(false)
	const [appState, setAppState] = useState<AppStateStatus>(
		() => AppState.currentState
	)

	const refresh = useCallback(() => {
		setNow(new Date())
	}, [])

	const isActive = enabled && isFocused && appState === 'active'

	const onAppStateChange = useCallback(
		(nextState: AppStateStatus) => {
			setAppState(nextState)
			if (nextState === 'active' && enabled && isFocused) {
				refresh()
			}
		},
		[enabled, isFocused, refresh]
	)

	useAppState(onAppStateChange)

	useFocusEffect(
		useCallback(() => {
			setIsFocused(true)
			if (enabled) {
				refresh()
			}
			return () => {
				setIsFocused(false)
			}
		}, [enabled, refresh])
	)

	useInterval(refresh, isActive ? TICK_INTERVAL_MS : null)

	return now
}
