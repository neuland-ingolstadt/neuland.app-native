import {
	evaluateFliptBoolean,
	type FeatureFlagContextAttributes
} from '@/lib/flipt'

/**
 * Flipt flag keys for namespace `neuland-app`.
 * Keep in sync with `production/neuland-app/features.yaml` in the flags repo.
 */
export const FeatureFlagKeys = {
	thiEventsVisible: 'thi-events-visible',
	memberOfficePresenceEnabled: 'member-officepresence-enabled'
} as const satisfies Record<string, string>

export type FeatureFlagKey =
	(typeof FeatureFlagKeys)[keyof typeof FeatureFlagKeys]

export type FeatureFlagState = Record<FeatureFlagKey, boolean>

export function createDefaultFeatureFlagState(): FeatureFlagState {
	return Object.fromEntries(
		(Object.values(FeatureFlagKeys) as FeatureFlagKey[]).map((key) => [
			key,
			false
		])
	) as FeatureFlagState
}

export async function evaluateBooleanFlag(
	flagKey: FeatureFlagKey,
	defaultValue = false,
	attributes: FeatureFlagContextAttributes = {}
): Promise<boolean> {
	return evaluateFliptBoolean(flagKey, defaultValue, attributes)
}
