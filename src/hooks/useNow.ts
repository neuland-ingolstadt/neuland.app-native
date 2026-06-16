import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { useAppState } from './useAppState'
import { useInterval } from './useInterval'

const TICK_INTERVAL_MS = 60 * 1000

export function useNow(active: boolean): Date {
	const [now, setNow] = useState(() => new Date())

	const refresh = useCallback(() => {
		setNow(new Date())
	}, [])

	useAppState((nextState) => {
		if (nextState === 'active' && active) {
			refresh()
		}
	})

	useFocusEffect(
		useCallback(() => {
			if (active) {
				refresh()
			}
		}, [active, refresh])
	)

	useInterval(refresh, active ? TICK_INTERVAL_MS : null)

	return now
}
