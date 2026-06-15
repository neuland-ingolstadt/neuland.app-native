import { FliptProvider } from '@openfeature/flipt-provider'
import { type EvaluationContext, OpenFeature } from '@openfeature/server-sdk'
import * as Application from 'expo-application'
import { Platform } from 'react-native'

const namespace = process.env.EXPO_PUBLIC_FLIPT_NAMESPACE ?? 'neuland-app'
const fliptUrl =
	process.env.EXPO_PUBLIC_FLIPT_URL ?? 'https://flipt.neuland.ing'

let providerReady: Promise<void> | undefined

export async function ensureOpenFeatureProvider(): Promise<void> {
	if (!providerReady) {
		const provider = new FliptProvider(namespace, {
			url: fliptUrl
		})

		providerReady = OpenFeature.setProviderAndWait(provider)
	}

	await providerReady
}

/**
 * Optional attributes merged into every Flipt evaluation.
 *
 * Built-in context (always sent):
 * - `targetingKey`: `anonymous` — no per-device identifier
 * - `platform`: `ios` | `android` | `web`
 * - `appVersion`: from expo-application
 *
 * Optional:
 * - `userKind`: self-reported profile (`guest` | `student` | `employee`)
 */
export interface FeatureFlagContextAttributes {
	userKind?: string
}

export function buildEvaluationContext(
	attributes: FeatureFlagContextAttributes = {}
): EvaluationContext {
	const context: EvaluationContext = {
		targetingKey: 'anonymous',
		platform: Platform.OS,
		appVersion: Application.nativeApplicationVersion ?? 'unknown'
	}

	if (attributes.userKind) {
		context.userKind = attributes.userKind
	}

	return context
}
