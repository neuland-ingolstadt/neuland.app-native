import DateTimePicker, {
	DateTimePickerAndroid
} from '@react-native-community/datetimepicker'
import type React from 'react'
import { type ChangeEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, View } from 'react-native'
import { useStyles } from 'react-native-unistyles'
import { RoomSearchResults } from '@/components/Map/room-search-results'
import { roomSearchStylesheet } from '@/components/Map/room-search-styles'
import Divider from '@/components/Universal/divider'
import Dropdown, { DropdownButton } from '@/components/Universal/dropdown'
import { useRoomSearch } from '@/hooks/useRoomSearch'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import {
	ALL_BUILDINGS,
	BUILDINGS_ALL,
	DURATION_PRESET,
	ROOM_SEARCH_DURATIONS
} from '@/utils/map-utils'

const maximumSearchDate = new Date(
	new Date().setDate(new Date().getDate() + 90)
)

export default function AdvancedSearch(): React.JSX.Element {
	const { styles, theme } = useStyles(roomSearchStylesheet)
	const { t } = useTranslation('common')
	const roomSearch = useRoomSearch()

	const [showDate, setShowDate] = useState(Platform.OS === 'ios')
	const [showTime, setShowTime] = useState(Platform.OS === 'ios')

	const openAndroidDatePicker = (): void => {
		DateTimePickerAndroid.open({
			value: roomSearch.searchDateTime,
			mode: 'date',
			minimumDate: new Date(),
			maximumDate: maximumSearchDate,
			onChange: (event, selectedDate) => {
				if (event.type === 'set' && selectedDate != null) {
					roomSearch.setDate(formatISODate(selectedDate))
				}
			}
		})
	}

	const openAndroidTimePicker = (): void => {
		DateTimePickerAndroid.open({
			value: roomSearch.searchDateTime,
			mode: 'time',
			is24Hour: true,
			minuteInterval: 5,
			onChange: (event, selectedDate) => {
				if (event.type === 'set' && selectedDate != null) {
					roomSearch.setTime(formatISOTime(selectedDate))
				}
			}
		})
	}

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

						{Platform.OS === 'android' && (
							<DropdownButton onPress={openAndroidDatePicker}>
								{roomSearch.date.split('-').reverse().join('.')}
							</DropdownButton>
						)}

						{Platform.OS === 'web' ? (
							<input
								type="date"
								value={roomSearch.date}
								onChange={(event: ChangeEvent<HTMLInputElement>) => {
									roomSearch.setDate(event.currentTarget.value)
								}}
								style={styles.webInput as unknown as React.CSSProperties}
								min={formatISODate(new Date())}
								max={formatISODate(maximumSearchDate)}
							/>
						) : (
							showDate && (
								<DateTimePicker
									value={roomSearch.searchDateTime}
									mode="date"
									accentColor={theme.colors.primary}
									locale="de-DE"
									onChange={(_event, selectedDate) => {
										setShowDate(Platform.OS !== 'android')
										roomSearch.setDate(formatISODate(selectedDate))
									}}
									minimumDate={new Date()}
									maximumDate={maximumSearchDate}
								/>
							)
						)}
					</View>
					<Divider />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.time')}
						</Text>

						{Platform.OS === 'android' && (
							<DropdownButton onPress={openAndroidTimePicker}>
								{roomSearch.time}
							</DropdownButton>
						)}

						{Platform.OS === 'web' ? (
							<input
								type="time"
								value={roomSearch.time}
								onChange={(event: ChangeEvent<HTMLInputElement>) => {
									roomSearch.setTime(event.currentTarget.value)
								}}
								style={styles.webInput as unknown as React.CSSProperties}
								step={300}
							/>
						) : (
							showTime && (
								<DateTimePicker
									value={roomSearch.searchDateTime}
									mode="time"
									is24Hour={true}
									accentColor={theme.colors.primary}
									locale="de-DE"
									minuteInterval={5}
									onChange={(_event, selectedDate) => {
										setShowTime(Platform.OS !== 'android')
										roomSearch.setTime(formatISOTime(selectedDate))
									}}
								/>
							)
						)}
					</View>
					<Divider />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.duration')}
						</Text>
						<Dropdown
							data={[...ROOM_SEARCH_DURATIONS]}
							defaultValue={DURATION_PRESET}
							onSelect={roomSearch.setDuration}
						/>
					</View>
					<Divider />
					<View style={styles.optionsRow}>
						<Text style={styles.optionTitle}>
							{t('pages.rooms.options.building')}
						</Text>
						<Dropdown
							data={[...ALL_BUILDINGS]}
							defaultValue={BUILDINGS_ALL}
							onSelect={roomSearch.setBuilding}
						/>
					</View>
				</View>
				<RoomSearchResults
					rooms={roomSearch.rooms}
					filterError={roomSearch.filterError}
					isLoading={roomSearch.isLoading}
					isError={roomSearch.isError}
					isPaused={roomSearch.isPaused}
					error={roomSearch.error}
					refetchByUser={roomSearch.refetchByUser}
				/>
			</View>
		</ScrollView>
	)
}
