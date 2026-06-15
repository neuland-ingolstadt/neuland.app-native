import { useQuery } from '@tanstack/react-query'
import { useUserKind } from '@/contexts'
import { evaluateBooleanFlag, type FeatureFlagKey } from '@/lib/feature-flags'

const FEATURE_FLAG_STALE_TIME_MS = 5 * 60 * 1000

export function useFeatureFlag(
	flagKey: FeatureFlagKey | string,
	defaultValue = false
) {
	const { userKind } = useUserKind()

	return useQuery({
		queryKey: ['feature-flag', flagKey, userKind],
		queryFn: () =>
			evaluateBooleanFlag(flagKey, defaultValue, {
				userKind: userKind ?? 'guest'
			}),
		staleTime: FEATURE_FLAG_STALE_TIME_MS
	})
}
