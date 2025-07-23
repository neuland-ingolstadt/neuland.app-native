import DateTimePicker from '@react-native-community/datetimepicker'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { Picker, useBinding } from 'swiftui-react-native'
import API from '@/api/authenticated-api'
import { NoSessionError } from '@/api/thi-session-handler'
import ErrorView from '@/components/Error/error-view'
import { FreeRoomsList } from '@/components/Map/FreeRoomsList'
import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
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
	const { styles, theme } = useStyles(stylesheet)
	const router = useRouter()
	const { t } = useTranslation('common')

	const { startDate, wasModified } = getNextValidDate()
	const building = useBinding(BUILDINGS_ALL)
	const [date, setDate] = useState(formatISODate(startDate))

	const [time, setTime] = useState(formatISOTime(startDate))

	/**
	 * Checks if the provided date and time are equal to the start date.
	 *
	 * This function compares the hours and minutes from a time string in the format "HH:MM",
	 * and a date string in the format "YYYY-MM-DD" against a global `startDate` object of type Date.
	 * It returns true if the hours and minutes of `startDate` match the provided time,
	 * and the date part of `startDate` matches the provided date string.
	 *
	 * @returns {boolean} True if the date and time match the start date, false otherwise.
	 */
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
		staleTime: 1000 * 60 * 60, // 60 minutes
		gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days
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
		<ScrollView style={styles.scrollView}>
			<View>
				<Text style={styles.sectionHeader}>
					{t('pages.rooms.options.title')}
				</Text>
				<View style={styles.section}>
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.date')}
						</Text>

						<DateTimePicker
							value={new Date(`${date}T${time}`)}
							mode="date"
							accentColor={theme.colors.primary}
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
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.time')}
						</Text>

						<DateTimePicker
							value={new Date(`${date}T${time}`)}
							mode="time"
							is24Hour={true}
							accentColor={theme.colors.primary}
							locale="de-DE"
							minuteInterval={5}
							onChange={(_event, selectedDate) => {
								setTime(formatISOTime(selectedDate))
							}}
						/>
					</View>
					<Divider paddingLeft={16} />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.duration')}
						</Text>

						<Picker
							selection={duration}
							pickerStyle="menu"
							tint={theme.colors.primary}
							offset={{ x: 15, y: 0 }}
						>
							{DURATIONS.map((option) => (
								<Text key={option}>{option}</Text>
							))}
						</Picker>
					</View>
					<Divider paddingLeft={16} />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.building')}
						</Text>

						<Picker
							selection={building}
							pickerStyle="menu"
							tint={theme.colors.primary}
							offset={{ x: 20, y: 0 }}
						>
							{ALL_BUILDINGS.map((option) => (
								<Text key={option}>{option}</Text>
							))}
						</Picker>
					</View>
				</View>
				{wasModified && isDateAndTimeEqualToStart() && (
					<View style={styles.section}>
						<View style={styles.adjustContainer}>
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
							<Text style={styles.adjustedTitle}>
								{t('pages.rooms.modified.title')}
							</Text>
						</View>

						<Text style={styles.adjustText}>
							{t('pages.rooms.modified.description', {
								date,
								time
							})}
						</Text>
					</View>
				)}
				<Text style={styles.sectionHeader}>{t('pages.rooms.results')}</Text>
				<View style={styles.sectionContainer}>
					<View style={styles.section}>
						{filterState === LoadingState.LOADING || isLoading ? (
							<LoadingIndicator style={styles.loadingIndicator} />
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

const stylesheet = createStyleSheet((theme) => ({
	adjustContainer: {
		alignContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		gap: 5,
		paddingHorizontal: 10,
		paddingTop: 10
	},
	adjustText: {
		color: theme.colors.text,
		fontSize: 15,
		padding: 10
	},
	adjustedTitle: {
		color: theme.colors.primary,
		fontSize: 16,
		fontWeight: '500',
		marginLeft: 5
	},

	loadingIndicator: {
		paddingVertical: 30
	},
	optionTitle: {
		color: theme.colors.text,
		fontSize: 15
	},
	optionsRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 15,
		paddingVertical: 8
	},
	scrollView: {
		padding: 12
	},
	section: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		marginBottom: 16
	},
	sectionContainer: {
		paddingBottom: 20
	},
	sectionHeader: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		marginBottom: 4,
		textTransform: 'uppercase'
	}
}))
