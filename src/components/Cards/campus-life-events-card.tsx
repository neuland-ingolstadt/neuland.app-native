import { useQuery } from '@tanstack/react-query'
import { type RelativePathString, router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type { LanguageKey } from '@/localization/i18n'
import type {
	CampusLifeEvent,
	CampusLifePublicOrganizerKind
} from '@/types/campus-life'
import {
	CAMPUS_LIFE_EVENT_DETAIL_PATH,
	campusLifeEventDetailParams
} from '@/utils/campus-life-utils'
import { loadCampusLifeEvents, QUERY_KEYS } from '@/utils/events-utils'
import EventItem from '../Universal/event-item'
import BaseCard from './base-card'

interface CampusLifeEventsCardProps {
	title: 'events' | 'thiEvents'
	organizerKind: CampusLifePublicOrganizerKind
	listRoute: RelativePathString
	queryEnabled?: boolean
}

export default function CampusLifeEventsCard({
	title,
	organizerKind,
	listRoute,
	queryEnabled = true
}: CampusLifeEventsCardProps): React.JSX.Element {
	const primaryColor = useCSSVariable('--color-primary') as string | undefined
	const { i18n } = useTranslation('navigation')
	const { t } = useTranslation('common')
	const { data: events = [], isSuccess } = useQuery<CampusLifeEvent[]>({
		queryKey: [QUERY_KEYS.CAMPUS_LIFE_EVENTS, organizerKind],
		queryFn: () => loadCampusLifeEvents({ organizerKind }),
		staleTime: 1000 * 60 * 5,
		gcTime: 1000 * 60 * 60 * 24,
		enabled: queryEnabled
	})

	const handleEventItemPress = (id: string) => {
		const detailParams = campusLifeEventDetailParams(id, organizerKind)

		if (Platform.OS !== 'ios') {
			router.navigate({
				pathname: CAMPUS_LIFE_EVENT_DETAIL_PATH,
				params: detailParams
			})
			return
		}

		router.navigate({
			pathname: listRoute,
			params: {
				openEvent: 'true',
				...detailParams
			}
		})
	}

	const noData = (
		<Text className="mt-2.5 text-text text-base font-medium">
			{t('error.noEvents')}
		</Text>
	)

	return (
		<BaseCard
			title={title}
			onPressRoute={listRoute}
			noDataComponent={noData}
			noDataPredicate={() => isSuccess && events.length === 0}
		>
			{isSuccess && events.length > 0 && (
				<View className="mt-2.5 gap-3 border-border">
					{events.slice(0, 2).map((event) => (
						<Pressable
							key={event.id}
							onPress={() => handleEventItemPress(event.id)}
						>
							<EventItem
								title={event.titles[i18n.language as LanguageKey] ?? ''}
								subtitle={event.host.name ?? ''}
								startDateTime={
									event.startDateTime
										? new Date(event.startDateTime)
										: undefined
								}
								location={event.location ?? undefined}
								subtitleTranslationKey="cards.events.by"
								subtitleTranslationParams={{ name: event.host.name ?? '' }}
								color={primaryColor}
							/>
						</Pressable>
					))}
				</View>
			)}
		</BaseCard>
	)
}
