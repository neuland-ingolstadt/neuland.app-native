import type React from 'react'
import { createContext, use, useMemo } from 'react'
import {
	FEATURE_FLAG_QUERY_KEYS,
	useFeatureFlagQueries
} from '@/hooks/useFeatureFlag'
import {
	createDefaultFeatureFlagState,
	type FeatureFlagState
} from '@/lib/feature-flags'
import { getEvaluationPlatform } from '@/utils/evaluation-platform'
import { useUserKind } from './userKind'

export const FeatureFlagsContext = createContext<FeatureFlagState>(
	createDefaultFeatureFlagState()
)

export function FeatureFlagsProvider({
	children
}: {
	children: React.ReactNode
}): React.JSX.Element {
	const { userKind } = useUserKind()
	const platform = getEvaluationPlatform()
	const results = useFeatureFlagQueries(userKind, platform)

	const flags = useMemo((): FeatureFlagState => {
		const state = createDefaultFeatureFlagState()

		for (let index = 0; index < FEATURE_FLAG_QUERY_KEYS.length; index++) {
			const flagKey = FEATURE_FLAG_QUERY_KEYS[index]
			state[flagKey] = results[index]?.data ?? false
		}

		return state
	}, [results])

	return (
		<FeatureFlagsContext.Provider value={flags}>
			{children}
		</FeatureFlagsContext.Provider>
	)
}

export function useFeatureFlags(): FeatureFlagState {
	return use(FeatureFlagsContext)
}
