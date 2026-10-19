import { describe, expect, it } from 'bun:test'
import { isNetInfoOnline } from '../network-utils'

describe('isNetInfoOnline', () => {
	it('treats unknown reachability as online when connected', () => {
		expect(
			isNetInfoOnline({ isConnected: true, isInternetReachable: null })
		).toBe(true)
	})

	it('treats fully unknown state as online', () => {
		expect(
			isNetInfoOnline({ isConnected: null, isInternetReachable: null })
		).toBe(true)
	})

	it('is offline when not connected', () => {
		expect(
			isNetInfoOnline({ isConnected: false, isInternetReachable: null })
		).toBe(false)
		expect(
			isNetInfoOnline({ isConnected: false, isInternetReachable: false })
		).toBe(false)
	})

	it('is offline when reachability is explicitly false', () => {
		expect(
			isNetInfoOnline({ isConnected: true, isInternetReachable: false })
		).toBe(false)
	})

	it('is online when connected and reachable', () => {
		expect(
			isNetInfoOnline({ isConnected: true, isInternetReachable: true })
		).toBe(true)
	})
})
