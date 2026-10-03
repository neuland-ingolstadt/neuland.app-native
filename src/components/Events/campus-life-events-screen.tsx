import { useQuery } from '@tanstack/react-query'
import {
	type Href,
	router,
	useFocusEffect,
	useLocalSearchParams
} from 'expo-router'
import type React from 'react'
import { useCallback, useEffect } from 'react'
import { InteractionManager, View } from 'react-native'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import type { CampusLifePublicOrganizerKind } from '@/types/campus-life'
import {
	CAMPUS_LIFE_EVENT_DETAIL_PATH,
	campusLifeEventDetailParams,
	resolveCampusLifeOrganizerKind
} from '@/utils/campus-life-utils'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'

import ClEventsPage from './cl-events-page'

interface CampusLifeEventsScreenProps {
	organizerKind: CampusLifePublicOrganizerKind
	clubsListRoute?: Href
	enableSportsTabRedirect?: boolean
}

export default function CampusLifeEventsScreen({
	organizerKind,
	clubsListRoute,
	enableSportsTabRedirect = false
}: CampusLifeEventsScreenProps): React.JSX.Element {
	const headerPadding = useTransparentHeaderPadding()
	const { tab, openEvent, id, org } = useLocalSearchParams<{
		tab?: string
		openEvent?: string
		id?: string
		org?: string
	}>()

	const eventsResult = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS, organizerKind],
		queryFn: () => loadCampusLifeEvents({ organizerKind }),
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24
	})

	useEffect(() => {
		if (!enableSportsTabRedirect || tab !== 'sports') {
			return
		}
		router.replace({
			pathname: '/sports',
			params: {
				...(openEvent != null ? { openEvent } : {}),
				...(id != null ? { id } : {})
			}
		})
	}, [enableSportsTabRedirect, tab, openEvent, id])

	useFocusEffect(
		useCallback(() => {
			if (openEvent === 'true' && id) {
				const resolvedOrganizerKind = resolveCampusLifeOrganizerKind(
					organizerKind,
					org
				)
				InteractionManager.runAfterInteractions(() => {
					router.setParams({ openEvent: 'false' })
					router.navigate({
						pathname: CAMPUS_LIFE_EVENT_DETAIL_PATH,
						params: campusLifeEventDetailParams(id, resolvedOrganizerKind)
					})
				})
			}
		}, [openEvent, id, org, organizerKind])
	)

	return (
		<View
			testID="campus-life-events-screen"
			className="flex-1"
			style={{ paddingTop: headerPadding + 12 }}
		>
			{enableSportsTabRedirect && tab === 'sports' ? (
				<View className="flex-1 justify-center items-center">
					<LoadingIndicator />
				</View>
			) : (
				<ClEventsPage
					clEventsResult={eventsResult}
					organizerKind={organizerKind}
					clubsListRoute={clubsListRoute}
				/>
			)}
		</View>
	)
}
