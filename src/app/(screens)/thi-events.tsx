import { useQuery } from '@tanstack/react-query'
import {
	Redirect,
	router,
	useFocusEffect,
	useLocalSearchParams
} from 'expo-router'
import type React from 'react'
import { useCallback, useEffect } from 'react'
import { InteractionManager, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ClEventsPage from '@/components/Events/cl-events-page'
import { useIsFeatureEnabled } from '@/hooks'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import { CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT } from '@/types/campus-life'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'
import { pausedToast } from '@/utils/ui-utils'

export default function ThiEventsScreen(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const headerPadding = useTransparentHeaderPadding()
	const thiEventsVisible = useIsFeatureEnabled(FeatureFlagKeys.thiEventsVisible)
	const { openEvent, id } = useLocalSearchParams<{
		openEvent?: string
		id?: string
	}>()

	const clEventsResult = useQuery({
		queryKey: [
			QUERY_KEYS.CAMPUS_LIFE_EVENTS,
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
		],
		queryFn: () =>
			loadCampusLifeEvents({
				organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
			}),
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24,
		enabled: thiEventsVisible
	})

	useEffect(() => {
		if (clEventsResult.isPaused && clEventsResult.data != null) {
			pausedToast()
		}
	}, [clEventsResult.isPaused, clEventsResult.data])

	useFocusEffect(
		useCallback(() => {
			if (openEvent === 'true' && id) {
				InteractionManager.runAfterInteractions(() => {
					router.setParams({ openEvent: 'false' })
					router.navigate({
						pathname: '/events/cl/[id]',
						params: { id }
					})
				})
			}
		}, [openEvent, id])
	)

	if (!thiEventsVisible) {
		return <Redirect href="/(tabs)" />
	}

	return (
		<View
			style={[styles.page, { paddingTop: headerPadding + theme.margins.page }]}
		>
			<ClEventsPage
				clEventsResult={clEventsResult}
				organizerKind={CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT}
			/>
		</View>
	)
}

const stylesheet = createStyleSheet(() => ({
	page: {
		flex: 1
	}
}))
