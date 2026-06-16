import { Redirect } from 'expo-router'
import type React from 'react'
import { View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import CampusLifeOrganizersList from '@/components/Events/campus-life-organizers-list'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useFeatureFlagEnabled } from '@/hooks'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'

export default function ThiDepartmentsScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { enabled: thiEventsVisible, isPending } = useFeatureFlagEnabled(
		FeatureFlagKeys.thiEventsVisible
	)

	if (isPending) {
		return (
			<View style={styles.centered}>
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

const stylesheet = createStyleSheet(() => ({
	centered: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
}))
