import { Redirect } from 'expo-router'
import type React from 'react'
import CampusLifeOrganizersList from '@/components/Events/campus-life-organizers-list'
import { useIsFeatureEnabled } from '@/hooks'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'

export default function ThiDepartmentsScreen(): React.JSX.Element {
	const thiEventsVisible = useIsFeatureEnabled(FeatureFlagKeys.thiEventsVisible)

	if (!thiEventsVisible) {
		return <Redirect href="/(tabs)" />
	}

	return (
		<CampusLifeOrganizersList
			organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT}
			page="thiEvents"
			section="departments"
		/>
	)
}
