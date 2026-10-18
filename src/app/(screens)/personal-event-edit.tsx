import { trackEvent } from '@aptabase/react-native'
import { toast } from 'burnt'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Keyboard,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import { CustomDropdown } from '@/components/Menu/custom-dropdown'
import DateTimeField from '@/components/Universal/date-time-field'
import { useIsFeatureEnabled } from '@/hooks/useFeatureFlag'
import { usePersonalEventsStore } from '@/hooks/usePersonalEventsStore'
import dayjs from '@/lib/dayjs'
import { FeatureFlagKeys } from '@/lib/feature-flags'
import type {
	PersonalEventDraft,
	PersonalEventRecurrence
} from '@/types/personal-events'
import { validatePersonalEvent } from '@/utils/personal-events-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

const recurrences: PersonalEventRecurrence[] = [
	'none',
	'daily',
	'weekly',
	'monthly'
]

export default function PersonalEventEdit(): React.JSX.Element {
	const { id, origin } = useLocalSearchParams<{
		id?: string
		origin?: string
	}>()
	const { t } = useTranslation('timetable')
	const enabled = useIsFeatureEnabled(FeatureFlagKeys.personalEvents)
	const event = usePersonalEventsStore((state) =>
		state.events.find((entry) => entry.id === id)
	)
	const addEvent = usePersonalEventsStore((state) => state.addEvent)
	const updateEvent = usePersonalEventsStore((state) => state.updateEvent)
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const [draft, setDraft] = useState<PersonalEventDraft>(() => {
		if (event)
			return {
				title: event.title,
				location: event.location,
				start: event.start,
				end: event.end,
				recurrence: event.recurrence,
				recurrenceUntil: event.recurrenceUntil
			}
		let start = dayjs().add(1, 'hour').startOf('hour')
		if (start.hour() === 23) start = start.add(1, 'day').startOf('day')
		return {
			title: '',
			location: '',
			start: start.format('YYYY-MM-DDTHH:mm:ss'),
			end: start.add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss'),
			recurrence: 'none',
			recurrenceUntil: start.add(3, 'month').format('YYYY-MM-DD')
		}
	})
	const errors = validatePersonalEvent(draft)
	const patch = (value: Partial<PersonalEventDraft>) =>
		setDraft((current) => ({ ...current, ...value }))
	const start = dayjs(draft.start)
	const end = dayjs(draft.end)
	const save = () => {
		if (!enabled || (id && !event) || validatePersonalEvent(draft).length)
			return
		const value = {
			...draft,
			title: draft.title.trim(),
			location: draft.location?.trim() || undefined,
			recurrenceUntil:
				draft.recurrence === 'none' ? undefined : draft.recurrenceUntil
		}
		if (id) updateEvent(id, value)
		else addEvent(value)
		const eventOrigin =
			origin === 'TimetableHeader' ||
			origin === 'DashboardCard' ||
			origin === 'EmptyState'
				? origin
				: 'Detail'
		trackEvent('PersonalEvent', {
			action: id ? 'edit' : 'create',
			recurrence: draft.recurrence,
			origin: eventOrigin
		})
		toast({ title: t('personalEvents.saved'), preset: 'done' })
		router.back()
	}
	if (!enabled || (id && !event))
		return <ErrorView title={t('personalEvents.notFound')} isCritical={false} />
	return (
		<ScrollView
			testID="personal-event-edit-screen"
			contentContainerClassName="p-page gap-5 pb-bottom-safe"
			contentInsetAdjustmentBehavior="automatic"
			keyboardShouldPersistTaps="handled"
			keyboardDismissMode="on-drag"
		>
			<Stack.Screen
				options={{
					title: t(id ? 'personalEvents.edit' : 'personalEvents.add')
				}}
			/>
			<View className="gap-2">
				<Text className="text-text text-[15px]">
					{t('personalEvents.title')}
				</Text>
				<TextInput
					testID="personal-event-title"
					accessibilityLabel={t('personalEvents.title')}
					className="bg-input-background rounded-md text-text text-[17px] min-h-11 px-2.5 border border-border"
					value={draft.title}
					onChangeText={(title) => patch({ title })}
					autoFocus={!id}
					returnKeyType="done"
					onSubmitEditing={Keyboard.dismiss}
				/>
			</View>
			<View className="gap-2">
				<Text className="text-text text-[15px]">
					{t('personalEvents.location')}
				</Text>
				<TextInput
					testID="personal-event-location"
					accessibilityLabel={t('personalEvents.location')}
					className="bg-input-background rounded-md text-text text-[17px] min-h-11 px-2.5 border border-border"
					value={draft.location ?? ''}
					onChangeText={(location) => patch({ location })}
					returnKeyType="done"
					onSubmitEditing={Keyboard.dismiss}
				/>
			</View>
			<View className="gap-2">
				<Text className="text-text text-[15px]">
					{t('personalEvents.date')}
				</Text>
				<DateTimeField
					testID="personal-event-date"
					label={t('personalEvents.date')}
					mode="date"
					value={start.toDate()}
					onChange={(date) => {
						const day = dayjs(date).format('YYYY-MM-DD')
						patch({
							start: `${day}T${start.format('HH:mm:ss')}`,
							end: `${day}T${end.format('HH:mm:ss')}`
						})
					}}
				/>
			</View>
			<View className="gap-2">
				<Text className="text-text text-[15px]">
					{t('personalEvents.startTime')}
				</Text>
				<DateTimeField
					testID="personal-event-start"
					label={t('personalEvents.startTime')}
					mode="time"
					value={start.toDate()}
					onChange={(date) =>
						patch({
							start: `${start.format('YYYY-MM-DD')}T${dayjs(date).format('HH:mm:ss')}`
						})
					}
				/>
			</View>
			<View className="gap-2">
				<Text className="text-text text-[15px]">
					{t('personalEvents.endTime')}
				</Text>
				<DateTimeField
					testID="personal-event-end"
					label={t('personalEvents.endTime')}
					mode="time"
					value={end.toDate()}
					onChange={(date) =>
						patch({
							end: `${start.format('YYYY-MM-DD')}T${dayjs(date).format('HH:mm:ss')}`
						})
					}
				/>
			</View>
			<View className="gap-2">
				<Text className="text-text text-[15px]">
					{t('personalEvents.repeat')}
				</Text>
				<CustomDropdown
					testID="personal-event-recurrence"
					value={draft.recurrence}
					placeholder={t('personalEvents.repeat')}
					options={recurrences.map((value) => ({
						value,
						label: t(`personalEvents.recurrence.${value}`)
					}))}
					onChange={(recurrence) => {
						Keyboard.dismiss()
						patch({
							recurrence,
							recurrenceUntil:
								draft.recurrenceUntil ??
								start.add(3, 'month').format('YYYY-MM-DD')
						})
					}}
				/>
			</View>
			{draft.recurrence !== 'none' && (
				<View className="gap-2">
					<Text className="text-text text-[15px]">
						{t('personalEvents.until')}
					</Text>
					<DateTimeField
						testID="personal-event-until"
						label={t('personalEvents.until')}
						mode="date"
						value={dayjs(draft.recurrenceUntil).toDate()}
						minimumDate={start.toDate()}
						maximumDate={start.add(2, 'year').toDate()}
						onChange={(date) =>
							patch({ recurrenceUntil: dayjs(date).format('YYYY-MM-DD') })
						}
					/>
				</View>
			)}
			{errors.length > 0 && (
				<View accessibilityLiveRegion="polite" className="gap-1">
					{errors.map((error) => (
						<Text key={error} className="text-notification text-sm" selectable>
							{t(`personalEvents.validation.${error}`)}
						</Text>
					))}
				</View>
			)}
			<Pressable
				testID="personal-event-save"
				accessibilityRole="button"
				disabled={errors.length > 0}
				accessibilityState={{ disabled: errors.length > 0 }}
				onPress={save}
				className={`min-h-11 rounded-md items-center justify-center ${errors.length ? 'opacity-50' : ''}`}
				style={{ backgroundColor: primaryColor }}
			>
				<Text
					className="font-bold text-[15px]"
					style={{ color: getContrastColor(primaryColor) }}
				>
					{t('personalEvents.save')}
				</Text>
			</Pressable>
			<Text className="text-label text-sm">
				{t('personalEvents.localOnly')}
			</Text>
		</ScrollView>
	)
}
