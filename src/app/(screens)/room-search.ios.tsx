import DateTimePicker from '@react-native-community/datetimepicker'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { Picker, useBinding } from 'swiftui-react-native'
import { useCSSVariable } from 'uniwind'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/error-view'
import { FreeRoomsList } from '@/components/Map/free-rooms-list'
import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useRefreshByUser } from '@/hooks'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
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
import { LoadingState } from '@/utils/ui-utils'

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
	const headerPadding = useTransparentHeaderPadding() + 10
	const primaryColor = useCSSVariable('--color-primary') as string | undefined

	const { startDate, wasModified } = getNextValidDate()
	const building = useBinding(BUILDINGS_ALL)
	const [date, setDate] = useState(formatISODate(startDate))

	const [time, setTime] = useState(formatISOTime(startDate))

	const isDateAndTimeEqualToStart = (): boolean => {
		return (
			startDate.getHours() === Number.parseInt(time.split(':')[0], 10) &&
			startDate.getMinutes() === Number.parseInt(time.split(':')[1], 10) &&
			startDate.toISOString().split('T')[0] === date
		)
	}

	const duration = useBinding(DURATION_PRESET)

	const [filterState, setFilterState] = useState<LoadingState>(
		LoadingState.LOADING
	)
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
	const [rooms, setRooms] = useState<AvailableRoom[] | null>(null)

	useEffect(() => {
		const fetchRooms = (): void => {
			try {
				const validateDate = new Date(date)
				if (Number.isNaN(validateDate.getTime())) {
					throw new Error('Invalid date')
				}
				if (data === undefined) {
					return
				}

				const rooms = filterRooms(
					data,
					date,
					time,
					building.value,
					duration.value
				)
				if (rooms == null) {
					throw new Error('Error while filtering rooms')
				}
				setRooms(rooms)
				setFilterState(LoadingState.LOADED)
			} catch (error) {
				setFilterState(LoadingState.ERROR)
				console.error(error)
			}
		}

		setFilterState(LoadingState.LOADING)
		setTimeout(() => {
			fetchRooms()
		})
	}, [date, time, building.value, duration.value, data])

	const { refetchByUser } = useRefreshByUser(refetch)

	return (
		<ScrollView className="p-3" style={{ paddingTop: headerPadding }}>
			<View>
				<Text className="text-label-secondary text-[13px] font-normal mb-1 uppercase">
					{t('pages.rooms.options.title')}
				</Text>
				<View className="bg-card rounded-md mb-4">
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.date')}
						</Text>

						<DateTimePicker
							value={new Date(`${date}T${time}`)}
							mode="date"
							accentColor={primaryColor}
							locale="de-DE"
							onChange={(_event, selectedDate) => {
								setDate(formatISODate(selectedDate))
							}}
							minimumDate={new Date()}
							maximumDate={
								new Date(new Date().setDate(new Date().getDate() + 90))
							}
						/>
					</View>

					<Divider paddingLeft={16} />
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.time')}
						</Text>

						<DateTimePicker
							value={new Date(`${date}T${time}`)}
							mode="time"
							is24Hour={true}
							accentColor={primaryColor}
							locale="de-DE"
							minuteInterval={5}
							onChange={(_event, selectedDate) => {
								setTime(formatISOTime(selectedDate))
							}}
						/>
					</View>
					<Divider paddingLeft={16} />
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.duration')}
						</Text>

						<Picker
							selection={duration}
							pickerStyle="menu"
							tint={primaryColor}
							offset={{ x: 15, y: 0 }}
						>
							{DURATIONS.map((option) => (
								<Text key={option}>{option}</Text>
							))}
						</Picker>
					</View>
					<Divider paddingLeft={16} />
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.building')}
						</Text>

						<Picker
							selection={building}
							pickerStyle="menu"
							tint={primaryColor}
							offset={{ x: 20, y: 0 }}
						>
							{ALL_BUILDINGS.map((option) => (
								<Text key={option}>{option}</Text>
							))}
						</Picker>
					</View>
				</View>
				{wasModified && isDateAndTimeEqualToStart() && (
					<View className="bg-card rounded-md mb-4">
						<View className="items-center flex-row gap-[5px] px-2.5 pt-2.5">
							<PlatformIcon
								ios={{
									name: 'sparkles',
									size: 18
								}}
								android={{
									name: 'update',
									size: 20
								}}
								web={{
									name: 'Sparkles',
									size: 20
								}}
							/>
							<Text className="text-primary text-base font-medium ml-[5px]">
								{t('pages.rooms.modified.title')}
							</Text>
						</View>

						<Text className="text-text text-[15px] p-2.5">
							{t('pages.rooms.modified.description', {
								date,
								time
							})}
						</Text>
					</View>
				)}
				<Text className="text-label-secondary text-[13px] font-normal mb-1 uppercase">
					{t('pages.rooms.results')}
				</Text>
				<View className="pb-5">
					<View className="bg-card rounded-md mb-4">
						{filterState === LoadingState.LOADING || isLoading ? (
							<LoadingIndicator style={{ paddingVertical: 30 }} />
						) : isPaused ? (
							<ErrorView
								title={networkError}
								onButtonPress={() => {
									void refetchByUser()
								}}
								inModal
							/>
						) : isError || filterState === LoadingState.ERROR ? (
							<ErrorView
								title={error?.message ?? t('error.title')}
								onButtonPress={() => {
									void refetchByUser()
								}}
								inModal
							/>
						) : filterState === LoadingState.LOADED ? (
							<FreeRoomsList rooms={rooms} />
						) : null}
					</View>
				</View>
			</View>
		</ScrollView>
	)
}
