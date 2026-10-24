import { afterEach, beforeAll, describe, expect, it, mock } from 'bun:test'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const evaluateFliptBooleanMock = mock(async (): Promise<boolean> => false)

void mock.module(`${SRC_ROOT}lib/flipt.ts`, () => ({
	evaluateFliptBoolean: evaluateFliptBooleanMock
}))

let featureFlags: typeof import('@/lib/feature-flags')
let indoorNavFlag: typeof import('@/lib/indoor-nav-flag')

describe('indoor-nav flag', () => {
	const env = process.env

	beforeAll(async () => {
		featureFlags = await import('@/lib/feature-flags')
		indoorNavFlag = await import('@/lib/indoor-nav-flag')
	})

	afterEach(() => {
		process.env = env
		evaluateFliptBooleanMock.mockReset()
	})

	it('exposes the Flipt key for indoor navigation', () => {
		expect(indoorNavFlag.INDOOR_NAV_FLAG_KEY).toBe(
			featureFlags.FeatureFlagKeys.indoorNavigation
		)
		expect(indoorNavFlag.INDOOR_NAV_FLAG_KEY).toBe('indoor-navigation')
	})

	it('reads the local preview env toggle', () => {
		process.env.EXPO_PUBLIC_INDOOR_NAV_PREVIEW = '1'
		expect(indoorNavFlag.isIndoorNavPreviewEnabled()).toBe(true)
		delete process.env.EXPO_PUBLIC_INDOOR_NAV_PREVIEW
		expect(indoorNavFlag.isIndoorNavPreviewEnabled()).toBe(false)
	})

	it('defaults feature flag state and delegates evaluation to Flipt', async () => {
		expect(featureFlags.createDefaultFeatureFlagState()).toEqual({
			'indoor-navigation': false
		})
		evaluateFliptBooleanMock.mockResolvedValueOnce(true)
		await expect(
			featureFlags.evaluateBooleanFlag(
				featureFlags.FeatureFlagKeys.indoorNavigation
			)
		).resolves.toBe(true)
		expect(evaluateFliptBooleanMock).toHaveBeenCalledWith(
			'indoor-navigation',
			false,
			{}
		)
	})
})
