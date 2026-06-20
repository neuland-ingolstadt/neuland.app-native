import { beforeAll, describe, expect, it, mock } from 'bun:test'

const openURLMock = mock(async () => {})
const trackEventMock = mock(() => {})

const registerLinkingMocks = () => {
	mock.module('react-native', () => ({
		__esModule: true,
		default: {
			Linking: { openURL: openURLMock },
			Platform: { OS: 'web' }
		},
		Linking: { openURL: openURLMock },
		Platform: { OS: 'web' }
	}))

	mock.module('@aptabase/react-native', () => ({
		trackEvent: trackEventMock
	}))
}

let linking: typeof import('../linking')

beforeAll(async () => {
	registerLinkingMocks()
	linking = await import('../linking')
})

describe('linking', () => {
	it('pressLink - Should be a no-op for nullish URLs', () => {
		linking.pressLink(null)
		linking.pressLink(undefined)

		expect(openURLMock).not.toHaveBeenCalled()
		expect(trackEventMock).not.toHaveBeenCalled()
	})

	it('pressLink - Should open the URL without analytics when no tag is provided', () => {
		openURLMock.mockReset()
		trackEventMock.mockReset()

		linking.pressLink('https://thi.de')

		expect(openURLMock).toHaveBeenCalledWith('https://thi.de')
		expect(trackEventMock).not.toHaveBeenCalled()
	})

	it('pressLink - Should track EventLink analytics when a tag is provided', () => {
		openURLMock.mockReset()
		trackEventMock.mockReset()

		linking.pressLink('https://thi.de/events/1', 'campus-life')

		expect(trackEventMock).toHaveBeenCalledWith('EventLink', {
			link: 'campus-life'
		})
		expect(openURLMock).toHaveBeenCalledWith('https://thi.de/events/1')
	})
})
