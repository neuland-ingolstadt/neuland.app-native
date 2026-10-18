import { trackEvent } from '@aptabase/react-native'
import { toast } from 'burnt'
import { router, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import ErrorView from '@/components/Error/error-view'
import FormList from '@/components/Universal/form-list'
import { useIsFeatureEnabled } from '@/hooks/useFeatureFlag'
import { usePersonalEventsStore } from '@/hooks/usePersonalEventsStore'
import { useSheetDetailScroll } from '@/hooks/useSheetDetailScroll'
import dayjs from '@/lib/dayjs'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import type { FormListSections } from '@/types/components'
import { formatFriendlyDate, formatFriendlyTime } from '@/utils/date-utils'
import { expandPersonalEvents } from '@/utils/personal-events-utils'
import { isValidRoom } from '@/utils/timetable-utils'

export default function PersonalEventDetail(): React.JSX.Element {
	const { id, start } = useLocalSearchParams<{ id?: string; start?: string }>()
	const { t } = useTranslation('timetable')
	const enabled = useIsFeatureEnabled(FeatureFlagKeys.personalEvents)
	const event = usePersonalEventsStore((state) =>
		state.events.find((entry) => entry.id === id)
	)
	const deleteEvent = usePersonalEventsStore((state) => state.deleteEvent)
	const { scrollHandler, contentInsetAdjustmentBehavior } =
		useSheetDetailScroll()
	if (!enabled || !event)
		return <ErrorView title={t('personalEvents.notFound')} isCritical={false} />
	const requestedStart =
		start && dayjs(start).isValid() ? dayjs(start) : dayjs(event.start)
	const occurrence = expandPersonalEvents(
		[event],
		requestedStart.startOf('day').toDate(),
		requestedStart.endOf('day').toDate()
	).find((entry) => entry.startDate.getTime() === requestedStart.valueOf())
	const begin = occurrence?.startDate ?? dayjs(event.start).toDate()
	const end = occurrence?.endDate ?? dayjs(event.end).toDate()
	const recurring = event.recurrence !== 'none'
	const remove = () => {
		deleteEvent(event.id)
		trackEvent('PersonalEvent', {
			action: 'delete',
			recurrence: event.recurrence,
			origin: 'Detail'
		})
		toast({ title: t('personalEvents.deleted'), preset: 'done' })
		router.back()
	}
	const confirmDelete = () => {
		const title = t(
			recurring ? 'personalEvents.deleteSeries' : 'personalEvents.delete'
		)
		const message = t(
			recurring
				? 'personalEvents.deleteSeriesMessage'
				: 'personalEvents.deleteMessage'
		)
		if (Platform.OS === 'web') {
			if (window.confirm(`${title}\n\n${message}`)) remove()
			return
		}
		Alert.alert(title, message, [
			{ text: t('personalEvents.cancel'), style: 'cancel' },
			{ text: title, style: 'destructive', onPress: remove }
		])
	}
	const room = event.location?.trim() ?? ''
	const sections: FormListSections[] = [
		{
			items: [
				{ title: t('personalEvents.date'), value: formatFriendlyDate(begin) },
				{
					title: t('personalEvents.time'),
					value: `${formatFriendlyTime(begin)} – ${formatFriendlyTime(end)}`
				},
				...(room
					? [
							{
								title: t('personalEvents.location'),
								value: room,
								onPress: isValidRoom(room)
									? () =>
											router.dismissTo({ pathname: '/map', params: { room } })
									: undefined
							}
						]
					: []),
				{
					title: t('personalEvents.repeat'),
					value: recurring
						? t('personalEvents.recurrenceSummary', {
								recurrence: t(`personalEvents.recurrence.${event.recurrence}`),
								date: formatFriendlyDate(dayjs(event.recurrenceUntil).toDate())
							})
						: t('personalEvents.recurrence.none')
				}
			]
		},
		{
			footer: t('personalEvents.localOnly'),
			items: [
				{
					testID: 'personal-event-edit',
					title: t('personalEvents.edit'),
					onPress: () =>
						router.navigate({
							pathname: '/personal-event-edit',
							params: { id: event.id, origin: 'Detail' }
						})
				},
				{
					testID: 'personal-event-delete',
					title: t(
						recurring ? 'personalEvents.deleteSeries' : 'personalEvents.delete'
					),
					onPress: confirmDelete
				}
			]
		}
	]
	return (
		<Animated.ScrollView
			testID="personal-event-screen"
			className="px-page"
			contentContainerClassName="gap-3 pb-modal-bottom"
			contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<View className="pt-4 pb-2">
				<Text className="text-text text-2xl font-semibold" selectable>
					{event.title}
				</Text>
			</View>
			<FormList sections={sections} />
		</Animated.ScrollView>
	)
}
