import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect } from 'react'
import { InteractionManager, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ClSportsPage from '@/components/Sports/cl-sports-page'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import {
	loadUniversitySportsEvents,
	SPORTS_QUERY_KEYS
} from '@/utils/sports-utils'
import { pausedToast } from '@/utils/ui-utils'

export default function SportsScreen(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const headerPadding = useTransparentHeaderPadding()
	const { openEvent, id } = useLocalSearchParams<{
		openEvent?: string
		id?: string
	}>()

	const sportsResult = useQuery({
		queryKey: [SPORTS_QUERY_KEYS.UNIVERSITY_SPORTS],
		queryFn: loadUniversitySportsEvents,
		staleTime: 1000 * 60 * 60, // 60 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hours
	})

	useEffect(() => {
		if (sportsResult.isPaused && sportsResult.data != null) {
			pausedToast()
		}
	}, [sportsResult.isPaused, sportsResult.data])

	useFocusEffect(
		useCallback(() => {
			if (openEvent === 'true' && id) {
				InteractionManager.runAfterInteractions(() => {
					router.setParams({ openEvent: 'false' })
					router.navigate({
						pathname: '/sports/[id]',
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
			<ClSportsPage sportsResult={sportsResult} />
		</View>
	)
}

const stylesheet = createStyleSheet(() => ({
	page: {
		flex: 1
	}
}))
