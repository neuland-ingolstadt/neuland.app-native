import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'

const dismissAllMock = mock(() => {})
const pushMock = mock(() => {})

mock.module('expo-router', () => ({
	router: {
		dismissAll: dismissAllMock,
		push: pushMock
	}
}))

mock.module('@aptabase/react-native', () => ({
	trackEvent: mock(() => {})
}))

mock.module('react-native', () => ({
	Platform: { OS: 'web' }
}))

mock.module('../ui-utils', () => ({
	copyToClipboard: mock(async () => {}),
	shareNative: mock(async () => {})
}))

let mapActions: typeof import('../map-actions')

beforeAll(async () => {
	mapActions = await import('../map-actions')
})

describe('map-actions', () => {
	beforeEach(() => {
		dismissAllMock.mockReset()
		pushMock.mockReset()
	})

	it('openMapRoom - Should dismiss stacked sheets and navigate to the map tab', () => {
		mapActions.openMapRoom('G101')

		expect(dismissAllMock).toHaveBeenCalledTimes(1)
		expect(pushMock).toHaveBeenCalledWith({
			pathname: '/(tabs)/map',
			params: { room: 'G101' }
		})
	})
})
