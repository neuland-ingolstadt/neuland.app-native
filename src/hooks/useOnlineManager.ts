import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import * as React from 'react'
import { Platform } from 'react-native'

/**
 * Hook that updates the online state.
 */
export function useOnlineManager(): void {
	React.useEffect(() => {
		if (Platform.OS !== 'web') {
			return NetInfo.addEventListener((state) => {
				onlineManager.setOnline(
					state.isConnected != null &&
						state.isConnected &&
						Boolean(state.isInternetReachable)
				)
			})
		}
	}, [])
}
