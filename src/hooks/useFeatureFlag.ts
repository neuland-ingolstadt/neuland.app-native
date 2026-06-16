import { useQueries, useQuery } from '@tanstack/react-query'
import { useUserKind } from '@/contexts/userKind'
import {
	evaluateBooleanFlag,
	type FeatureFlagKey,
	FeatureFlagKeys
} from '@/lib/feature-flags'
import { getEvaluationPlatform } from '@/utils/evaluation-platform'

export const FEATURE_FLAG_QUERY_KEY_ROOT = 'feature-flag' as const

const FEATURE_FLAG_STALE_TIME_MS = 5 * 60 * 1000

export const FEATURE_FLAG_QUERY_KEYS = Object.values(
	FeatureFlagKeys
) as FeatureFlagKey[]

export function featureFlagQueryKey(
	flagKey: FeatureFlagKey,
	userKind: string | undefined,
	platform: string
) {
	return [FEATURE_FLAG_QUERY_KEY_ROOT, flagKey, userKind, platform] as const
}

export function getFeatureFlagQueryOptions(
	flagKey: FeatureFlagKey,
	userKind: string | undefined,
	platform: string,
	defaultValue = false
) {
	return {
		queryKey: featureFlagQueryKey(flagKey, userKind, platform),
		queryFn: async () =>
			evaluateBooleanFlag(flagKey, defaultValue, {
				userKind: userKind ?? 'guest'
			}),
		staleTime: FEATURE_FLAG_STALE_TIME_MS,
		refetchOnReconnect: true,
		refetchOnWindowFocus: true,
		placeholderData: (previousData: boolean | undefined) => previousData
	}
}

export function useFeatureFlag(flagKey: FeatureFlagKey, defaultValue = false) {
	const { userKind } = useUserKind()
	const platform = getEvaluationPlatform()

	return useQuery(
		getFeatureFlagQueryOptions(flagKey, userKind, platform, defaultValue)
	)
}

export function useIsFeatureEnabled(
	flagKey: FeatureFlagKey,
	defaultValue = false
): boolean {
	return useFeatureFlag(flagKey, defaultValue).data ?? defaultValue
}

export function useFeatureFlagQueries(
	userKind: string | undefined,
	platform: string
) {
	return useQueries({
		queries: FEATURE_FLAG_QUERY_KEYS.map((flagKey) =>
			getFeatureFlagQueryOptions(flagKey, userKind, platform)
		)
	})
}
