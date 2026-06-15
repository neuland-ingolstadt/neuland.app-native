import { OpenFeature } from '@openfeature/server-sdk'
import {
	buildEvaluationContext,
	ensureOpenFeatureProvider,
	type FeatureFlagContextAttributes
} from '@/lib/openfeature'

/**
 * Flipt flag keys for namespace `neuland-app`.
 * Keep in sync with `production/neuland-app/features.yaml` in the flags repo.
 */
export const FeatureFlagKeys = {
	prideTheme: 'pride-theme'
} as const

export type FeatureFlagKey =
	(typeof FeatureFlagKeys)[keyof typeof FeatureFlagKeys]

export async function evaluateBooleanFlag(
	flagKey: FeatureFlagKey | string,
	defaultValue = false,
	attributes: FeatureFlagContextAttributes = {}
): Promise<boolean> {
	try {
		await ensureOpenFeatureProvider()
		const client = OpenFeature.getClient()

		return await client.getBooleanValue(
			flagKey,
			defaultValue,
			buildEvaluationContext(attributes)
		)
	} catch (error) {
		console.error(`Failed to evaluate Flipt flag "${flagKey}":`, error)
		return defaultValue
	}
}

export async function isPrideThemeEnabled(
	attributes: FeatureFlagContextAttributes = {}
): Promise<boolean> {
	return evaluateBooleanFlag(FeatureFlagKeys.prideTheme, false, attributes)
}
