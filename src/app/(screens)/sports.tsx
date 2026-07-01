import { useQuery } from '@tanstack/react-query'
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useCallback, useEffect } from 'react'
import { InteractionManager, View } from 'react-native'
import ClSportsPage from '@/components/Events/cl-sports-page'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { loadUniversitySportsEvents, QUERY_KEYS } from '@/utils/events-utils'
import { pausedToast } from '@/utils/ui-utils'

export default function SportsScreen(): React.JSX.Element {
	const headerPadding = useTransparentHeaderPadding()
	const { openEvent, id } = useLocalSearchParams<{
		openEvent?: string
		id?: string
	}>()

	const sportsResult = useQuery({
		queryKey: [QUERY_KEYS.UNIVERSITY_SPORTS],
		queryFn: loadUniversitySportsEvents,
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24
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
						pathname: '/events/sports/[id]',
						params: { id }
					})
				})
			}
		}, [openEvent, id])
	)

	return (
		<View className="flex-1" style={{ paddingTop: headerPadding + 12 }}>
			<ClSportsPage sportsResult={sportsResult} />
		</View>
	)
}
