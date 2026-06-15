import {
	evaluateFliptBoolean,
	type FeatureFlagContextAttributes
} from '@/lib/flipt'

export async function evaluateBooleanFlag(
	flagKey: string,
	defaultValue = false,
	attributes: FeatureFlagContextAttributes = {}
): Promise<boolean> {
	return evaluateFliptBoolean(flagKey, defaultValue, attributes)
}
