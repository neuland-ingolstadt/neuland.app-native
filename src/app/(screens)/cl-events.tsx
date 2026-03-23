import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect } from 'react'
import { InteractionManager, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ClEventsPage from '@/components/Events/cl-events-page'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'
import { pausedToast } from '@/utils/ui-utils'

export default function ClEventsScreen(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const headerPadding = useTransparentHeaderPadding()
	const { openEvent, id } = useLocalSearchParams<{
		openEvent?: string
		id?: string
	}>()

	const clEventsResult = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS],
		queryFn: () => loadCampusLifeEvents(),
		staleTime: 1000 * 60 * 60, // 60 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
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

	return (
		<View
			style={[styles.page, { paddingTop: headerPadding + theme.margins.page }]}
		>
			<ClEventsPage clEventsResult={clEventsResult} />
		</View>
	)
}

const stylesheet = createStyleSheet(() => ({
	page: {
		flex: 1
	}
}))
