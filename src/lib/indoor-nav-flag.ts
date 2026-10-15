import { FeatureFlagKeys } from '@/lib/feature-flags'

/** Local preview without Flipt (see `.env.local.example`). */
export function isIndoorNavPreviewEnabled(): boolean {
	return process.env.EXPO_PUBLIC_INDOOR_NAV_PREVIEW === '1'
}

export const INDOOR_NAV_FLAG_KEY = FeatureFlagKeys.indoorNavigation
