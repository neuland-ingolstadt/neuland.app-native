import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import * as React from 'react'
import { Platform } from 'react-native'
import { isNetInfoOnline, OFFLINE_DEBOUNCE_MS } from '@/utils/network-utils'

/**
 * Syncs React Query's online manager with NetInfo on native.
 * Going offline is debounced; coming back online applies immediately.
 * Web keeps React Query's built-in online/offline listeners.
 */
export function useOnlineManager(): void {
	React.useEffect(() => {
		if (Platform.OS === 'web') {
			return
		}

		return onlineManager.setEventListener((setOnline) => {
			let offlineTimer: ReturnType<typeof setTimeout> | undefined

			const clearOfflineTimer = (): void => {
				if (offlineTimer != null) {
					clearTimeout(offlineTimer)
					offlineTimer = undefined
				}
			}

			const unsubscribe = NetInfo.addEventListener((state) => {
				const online = isNetInfoOnline(state)

				if (online) {
					clearOfflineTimer()
					setOnline(true)
					return
				}

				if (offlineTimer != null) {
					return
				}

				offlineTimer = setTimeout(() => {
					offlineTimer = undefined
					setOnline(false)
				}, OFFLINE_DEBOUNCE_MS)
			})

			return () => {
				clearOfflineTimer()
				unsubscribe()
			}
		})
	}, [])
}
