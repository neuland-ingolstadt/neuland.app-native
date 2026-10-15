import {
	evaluateFliptBoolean,
	type FeatureFlagContextAttributes
} from '@/lib/flipt'

/**
 * Flipt flag keys for namespace `neuland-app`.
 * Keep in sync with `production/neuland-app/features.yaml` in the flags repo.
 * Currently empty — former flags were phased out as always-on features.
 */
export const FeatureFlagKeys = {
	indoorNavigation: 'indoor-navigation'
} as const satisfies Record<string, string>

type FeatureFlagKeyValues =
	(typeof FeatureFlagKeys)[keyof typeof FeatureFlagKeys]

/** Registered flag keys, or `string` while the registry is empty. */
export type FeatureFlagKey = [FeatureFlagKeyValues] extends [never]
	? string
	: FeatureFlagKeyValues

export type FeatureFlagState = Record<FeatureFlagKey, boolean>

export function createDefaultFeatureFlagState(): FeatureFlagState {
	return Object.fromEntries(
		Object.values(FeatureFlagKeys).map((key) => [key, false])
	) as FeatureFlagState
}

export async function evaluateBooleanFlag(
	flagKey: FeatureFlagKey,
	defaultValue = false,
	attributes: FeatureFlagContextAttributes = {}
): Promise<boolean> {
	return evaluateFliptBoolean(flagKey, defaultValue, attributes)
}
