import DateTimePicker, {
	DateTimePickerAndroid
} from '@react-native-community/datetimepicker'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import type React from 'react'
import { type ChangeEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/error-view'
import { FreeRoomsList } from '@/components/Map/free-rooms-list'
import Divider from '@/components/Universal/Divider'
import Dropdown, { DropdownButton } from '@/components/Universal/Dropdown'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useRefreshByUser } from '@/hooks'
import type { AvailableRoom } from '@/types/utils'
import { networkError } from '@/utils/api-utils'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
	BUILDINGS,
	BUILDINGS_ALL,
	DURATION_PRESET,
	filterRooms,
	getNextValidDate
} from '@/utils/map-utils'
import { toColor } from '@/utils/uniwind-utils'

const DURATIONS = [
	'00:15',
	'00:30',
	'00:45',
	'01:00',
	'01:30',
	'02:00',
	'02:30',
	'03:00',
	'03:30',
	'04:00',
	'04:30',
	'05:00',
	'05:30',
	'06:00'
]

const ALL_BUILDINGS = [BUILDINGS_ALL, ...BUILDINGS]

export default function AdvancedSearch(): React.JSX.Element {
	const router = useRouter()
	const { t } = useTranslation('common')
	const primaryColor = useCSSVariable('--color-primary') as string | undefined
	const textColor = useCSSVariable('--color-text') as string | undefined
	const datePickerBackground = useCSSVariable(
		'--color-date-picker-background'
	) as string | undefined

	const startDate = getNextValidDate()
	const [building, setBuilding] = useState(BUILDINGS_ALL)
	const [date, setDate] = useState(formatISODate(startDate.startDate))
	const [time, setTime] = useState(formatISOTime(startDate.startDate))
	const [duration, setDuration] = useState(DURATION_PRESET)

	const [showDate, setShowDate] = useState(Platform.OS === 'ios')
	const [showTime, setShowTime] = useState(Platform.OS === 'ios')

	const webInputStyle = {
		appearance: 'none' as const,
		backgroundColor: toColor(datePickerBackground),
		border: 'none',
		borderRadius: 17,
		color: toColor(textColor),
		height: 32,
		outline: 'none',
		paddingLeft: 10,
		paddingRight: 10,
		fontSize: 15
	}

	const openAndroidDatePicker = (): void => {
		DateTimePickerAndroid.open({
			value: new Date(`${date}T${time}`),
			mode: 'date',
			minimumDate: new Date(),
			maximumDate: new Date(new Date().setDate(new Date().getDate() + 90)),
			onChange: (event, selectedDate) => {
				if (event.type === 'set' && selectedDate != null) {
					setDate(formatISODate(selectedDate))
				}
			}
		})
	}

	const openAndroidTimePicker = (): void => {
		DateTimePickerAndroid.open({
			value: new Date(`${date}T${time}`),
			mode: 'time',
			is24Hour: true,
			minuteInterval: 5,
			onChange: (event, selectedDate) => {
				if (event.type === 'set' && selectedDate != null) {
					setTime(formatISOTime(selectedDate))
				}
			}
		})
	}
	const { data, error, isLoading, isError, isPaused, refetch } = useQuery({
		queryKey: ['freeRooms', date],
		queryFn: async () => await API.getFreeRooms(new Date(`${date}T${time}`)),
		staleTime: 1000 * 60 * 60,
		gcTime: 1000 * 60 * 60 * 24 * 4,
		retry(failureCount, error) {
			if (error instanceof NoSessionError) {
				router.replace('/login')
				return false
			}
			return failureCount < 2
		}
	})
	const { rooms, filterError } = useMemo(() => {
		if (data === undefined) {
			return { rooms: null as AvailableRoom[] | null, filterError: false }
		}
		try {
			const validateDate = new Date(date)
			if (Number.isNaN(validateDate.getTime())) {
				throw new Error('Invalid date')
			}
			const filteredRooms = filterRooms(data, date, time, building, duration)
			if (filteredRooms == null) {
				throw new Error('Error while filtering rooms')
			}
			return { rooms: filteredRooms, filterError: false }
		} catch (filteringError) {
			console.error(filteringError)
			return { rooms: null, filterError: true }
		}
	}, [data, date, time, building, duration])

	const { refetchByUser } = useRefreshByUser(refetch)

	return (
		<ScrollView className="p-3">
			<View>
				<Text className="text-label-secondary text-[13px] font-normal mb-1 uppercase">
					{t('pages.rooms.options.title')}
				</Text>
				<View className="bg-card rounded-md mb-4">
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.date')}
						</Text>

						{Platform.OS === 'android' && (
							<DropdownButton onPress={openAndroidDatePicker}>
								{date.split('-').reverse().join('.')}
							</DropdownButton>
						)}

						{Platform.OS === 'web' ? (
							<input
								type="date"
								value={date}
								onChange={(event: ChangeEvent<HTMLInputElement>) => {
									setDate(event.currentTarget.value)
								}}
								style={webInputStyle as unknown as React.CSSProperties}
								min={formatISODate(new Date())}
								max={formatISODate(
									new Date(new Date().setDate(new Date().getDate() + 90))
								)}
							/>
						) : (
							showDate && (
								<DateTimePicker
									value={new Date(`${date}T${time}`)}
									mode="date"
									accentColor={primaryColor}
									locale="de-DE"
									onChange={(_event, selectedDate) => {
										setShowDate(Platform.OS !== 'android')
										setDate(formatISODate(selectedDate))
									}}
									minimumDate={new Date()}
									maximumDate={
										new Date(new Date().setDate(new Date().getDate() + 90))
									}
								/>
							)
						)}
					</View>
					<Divider />
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.time')}
						</Text>

						{Platform.OS === 'android' && (
							<DropdownButton onPress={openAndroidTimePicker}>
								{time}
							</DropdownButton>
						)}

						{Platform.OS === 'web' ? (
							<input
								type="time"
								value={time}
								onChange={(event: ChangeEvent<HTMLInputElement>) => {
									setTime(event.currentTarget.value)
								}}
								style={webInputStyle as unknown as React.CSSProperties}
								step={300}
							/>
						) : (
							showTime && (
								<DateTimePicker
									value={new Date(`${date}T${time}`)}
									mode="time"
									is24Hour={true}
									accentColor={primaryColor}
									locale="de-DE"
									minuteInterval={5}
									onChange={(_event, selectedDate) => {
										setShowTime(Platform.OS !== 'android')
										setTime(formatISOTime(selectedDate))
									}}
								/>
							)
						)}
					</View>
					<Divider />
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.duration')}
						</Text>
						<Dropdown
							data={DURATIONS}
							defaultValue={DURATION_PRESET}
							onSelect={setDuration}
						/>
					</View>
					<Divider />
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.building')}
						</Text>
						<Dropdown
							data={ALL_BUILDINGS}
							defaultValue={BUILDINGS_ALL}
							onSelect={setBuilding}
						/>
					</View>
				</View>
				<Text className="text-label-secondary text-[13px] font-normal mb-1 uppercase">
					{t('pages.rooms.results')}
				</Text>
				<View className="pb-5">
					<View className="bg-card rounded-md mb-4">
						{isLoading ? (
							<LoadingIndicator style={{ paddingVertical: 30 }} />
						) : isPaused ? (
							<ErrorView
								title={networkError}
								onButtonPress={() => {
									void refetchByUser()
								}}
								inModal
							/>
						) : isError || filterError ? (
							<ErrorView
								title={error?.message ?? t('error.title')}
								onButtonPress={() => {
									void refetchByUser()
								}}
								inModal
							/>
						) : rooms != null ? (
							<FreeRoomsList rooms={rooms} />
						) : null}
					</View>
				</View>
			</View>
		</ScrollView>
	)
}
