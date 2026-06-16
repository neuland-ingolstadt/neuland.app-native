import type React from 'react'
import CampusLifeEventsScreen from '@/components/Events/campus-life-events-screen'
import { useFeatureFlagEnabled } from '@/hooks'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'

export default function ThiEventsScreen(): React.JSX.Element {
	const { enabled: thiEventsVisible, isPending } = useFeatureFlagEnabled(
		FeatureFlagKeys.thiEventsVisible
	)

	return (
		<CampusLifeEventsScreen
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT}
			clubsListRoute="/thi-departments"
			queryEnabled={thiEventsVisible}
			featureFlagPending={isPending}
			redirectWhenDisabled="/(tabs)"
		/>
	)
}
