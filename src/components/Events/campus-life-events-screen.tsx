import { useQuery } from '@tanstack/react-query'
import {
	type Href,
	Redirect,
	router,
	useFocusEffect,
	useLocalSearchParams
} from 'expo-router'
import type React from 'react'
import { useCallback, useEffect } from 'react'
import { InteractionManager, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import type { CampusLifePublicOrganizerKind } from '@/types/campus-life'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'
import { pausedToast } from '@/utils/ui-utils'

import ClEventsPage from './cl-events-page'

interface CampusLifeEventsScreenProps {
	organizerKind: CampusLifePublicOrganizerKind
	clubsListRoute?: Href
	queryEnabled?: boolean
	redirectWhenDisabled?: Href
	enableSportsTabRedirect?: boolean
}

export default function CampusLifeEventsScreen({
	organizerKind,
	clubsListRoute,
	queryEnabled = true,
	redirectWhenDisabled,
	enableSportsTabRedirect = false
}: CampusLifeEventsScreenProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const headerPadding = useTransparentHeaderPadding()
	const { tab, openEvent, id } = useLocalSearchParams<{
		tab?: string
		openEvent?: string
		id?: string
	}>()

	const eventsResult = useQuery({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS, organizerKind],
		queryFn: () => loadCampusLifeEvents({ organizerKind }),
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24,
		enabled: queryEnabled
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

	useEffect(() => {
		if (eventsResult.isPaused && eventsResult.data != null) {
			pausedToast()
		}
	}, [eventsResult.isPaused, eventsResult.data])

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

	if (redirectWhenDisabled != null && !queryEnabled) {
		return <Redirect href={redirectWhenDisabled} />
	}

	return (
		<View
			style={[styles.page, { paddingTop: headerPadding + theme.margins.page }]}
		>
			{enableSportsTabRedirect && tab === 'sports' ? (
				<View style={styles.loaderWrapper}>
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

const stylesheet = createStyleSheet(() => ({
	page: {
		flex: 1
	},
	loaderWrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
