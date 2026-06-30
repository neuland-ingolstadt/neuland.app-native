import { Redirect } from 'expo-router'
import type React from 'react'
import { View } from 'react-native'
import CampusLifeOrganizersList from '@/components/Events/campus-life-organizers-list'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useFeatureFlagEnabled } from '@/hooks'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'

export default function ThiDepartmentsScreen(): React.JSX.Element {
	const { enabled: thiEventsVisible, isPending } = useFeatureFlagEnabled(
		FeatureFlagKeys.thiEventsVisible
	)

	if (isPending) {
		return (
			<View className="flex-1 items-center justify-center">
				<LoadingIndicator />
			</View>
		)
	}

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
