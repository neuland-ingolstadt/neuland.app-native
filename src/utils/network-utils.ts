export const OFFLINE_DEBOUNCE_MS = 2000

export interface NetInfoOnlineState {
	isConnected: boolean | null
	isInternetReachable: boolean | null
}

/**
 * Optimistic online check for NetInfo.
 * Treats unknown reachability (`null`) as online so queries are not paused
 * while NetInfo is still probing.
 */
export function isNetInfoOnline(state: NetInfoOnlineState): boolean {
	return state.isConnected !== false && state.isInternetReachable !== false
}
