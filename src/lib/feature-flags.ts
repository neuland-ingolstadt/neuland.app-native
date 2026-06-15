import {
	evaluateFliptBoolean,
	type FeatureFlagContextAttributes
} from '@/lib/flipt'

/**
 * Flipt flag keys for namespace `neuland-app`.
 * Keep in sync with `production/neuland-app/features.yaml` in the flags repo.
 */
export const FeatureFlagKeys = {} as const satisfies Record<string, string>

export type FeatureFlagKey =
	(typeof FeatureFlagKeys)[keyof typeof FeatureFlagKeys]

export async function evaluateBooleanFlag(
	flagKey: FeatureFlagKey,
	defaultValue = false,
	attributes: FeatureFlagContextAttributes = {}
): Promise<boolean> {
	return evaluateFliptBoolean(flagKey, defaultValue, attributes)
}
