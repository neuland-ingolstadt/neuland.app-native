import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { reactNativeOpenURLMock } from './react-native-mock'

const trackEventMock = mock(() => {})

mock.module('@aptabase/react-native', () => ({
	trackEvent: trackEventMock
}))

const { pressLink } = await import('../linking')

describe('linking', () => {
	beforeEach(() => {
		reactNativeOpenURLMock.mockReset()
		trackEventMock.mockReset()
	})

	it('pressLink - Should be a no-op for nullish URLs', () => {
		pressLink(null)
		pressLink(undefined)

		expect(reactNativeOpenURLMock).not.toHaveBeenCalled()
		expect(trackEventMock).not.toHaveBeenCalled()
	})

	it('pressLink - Should open the URL without analytics when no tag is provided', () => {
		reactNativeOpenURLMock.mockReset()
		trackEventMock.mockReset()

		pressLink('https://thi.de')

		expect(reactNativeOpenURLMock).toHaveBeenCalledWith('https://thi.de')
		expect(trackEventMock).not.toHaveBeenCalled()
	})

	it('pressLink - Should track EventLink analytics when a tag is provided', () => {
		reactNativeOpenURLMock.mockReset()
		trackEventMock.mockReset()

		pressLink('https://thi.de/events/1', 'campus-life')

		expect(trackEventMock).toHaveBeenCalledWith('EventLink', {
			link: 'campus-life'
		})
		expect(reactNativeOpenURLMock).toHaveBeenCalledWith(
			'https://thi.de/events/1'
		)
	})
})
