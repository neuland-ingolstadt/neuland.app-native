import { useQuery } from '@tanstack/react-query'
import { useUserKind } from '@/contexts'
import { evaluateBooleanFlag, type FeatureFlagKey } from '@/lib/feature-flags'
import { getEvaluationPlatform } from '@/utils/evaluation-platform'

const FEATURE_FLAG_STALE_TIME_MS = 5 * 60 * 1000

export function useFeatureFlag(flagKey: FeatureFlagKey, defaultValue = false) {
	const { userKind } = useUserKind()
	const platform = getEvaluationPlatform()

	return useQuery({
		queryKey: ['feature-flag', flagKey, userKind, platform],
		queryFn: () =>
			evaluateBooleanFlag(flagKey, defaultValue, {
				userKind: userKind ?? 'guest'
			}),
		staleTime: FEATURE_FLAG_STALE_TIME_MS
	})
}
