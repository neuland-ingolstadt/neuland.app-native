import { Host, Picker } from '@expo/ui'
import DateTimePicker from '@react-native-community/datetimepicker'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { RoomSearchResults } from '@/components/Map/room-search-results'
import Divider from '@/components/Universal/divider'
import PlatformIcon from '@/components/Universal/icon'
import { useRoomSearch } from '@/hooks/useRoomSearch'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import { BUILDINGS_ALL, ROOM_SEARCH_DURATIONS } from '@/utils/map-constants'
import { toColor } from '@/utils/uniwind-utils'

const maximumSearchDate = new Date(
	new Date().setDate(new Date().getDate() + 90)
)

export default function AdvancedSearch(): React.JSX.Element {
	const { t } = useTranslation('common')
	const headerPadding = useTransparentHeaderPadding() + 10
	const roomSearch = useRoomSearch()
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)

	return (
		<ScrollView
			testID="room-search-screen"
			className="p-3"
			style={{ paddingTop: headerPadding }}
		>
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
							testID="room-search-date"
							value={roomSearch.searchDateTime}
							mode="date"
							accentColor={primaryColor}
							locale="de-DE"
							onValueChange={(_event, selectedDate) => {
								roomSearch.setDate(formatISODate(selectedDate))
							}}
							minimumDate={new Date()}
							maximumDate={maximumSearchDate}
						/>
					</View>

					<Divider paddingLeft={16} />
					<View className="items-center flex-row justify-between px-[15px] py-2">
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.time')}
						</Text>

						<DateTimePicker
							testID="room-search-time"
							value={roomSearch.searchDateTime}
							mode="time"
							is24Hour={true}
							accentColor={primaryColor}
							locale="de-DE"
							minuteInterval={5}
							onValueChange={(_event, selectedDate) => {
								roomSearch.setTime(formatISOTime(selectedDate))
							}}
						/>
					</View>
					<Divider paddingLeft={16} />
					<View
						testID="room-search-duration"
						className="items-center flex-row justify-between px-[15px] py-2"
					>
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.duration')}
						</Text>

						<Host matchContents seedColor={primaryColor}>
							<Picker
								selectedValue={roomSearch.duration}
								onValueChange={roomSearch.setDuration}
								appearance="menu"
							>
								{ROOM_SEARCH_DURATIONS.map((option) => (
									<Picker.Item key={option} label={option} value={option} />
								))}
							</Picker>
						</Host>
					</View>
					<Divider paddingLeft={16} />
					<View
						testID="room-search-building"
						className="items-center flex-row justify-between px-[15px] py-2"
					>
						<Text className="text-text text-[15px]">
							{t('pages.rooms.options.building')}
						</Text>

						<Host matchContents seedColor={primaryColor}>
							<Picker
								selectedValue={roomSearch.building}
								onValueChange={roomSearch.setBuilding}
								appearance="menu"
							>
								{[BUILDINGS_ALL, ...roomSearch.buildings].map((option) => (
									<Picker.Item key={option} label={option} value={option} />
								))}
							</Picker>
						</Host>
					</View>
				</View>
				{roomSearch.wasModified && roomSearch.isDateAndTimeEqualToStart && (
					<View className="bg-card rounded-md mb-4">
						<View className="content-center items-center flex-row gap-[5px] px-2.5 pt-2.5">
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
							<Text className="text-primary text-base font-medium ms-[5px]">
								{t('pages.rooms.modified.title')}
							</Text>
						</View>

						<Text className="text-text text-[15px] p-2.5">
							{t('pages.rooms.modified.description', {
								date: roomSearch.date,
								time: roomSearch.time
							})}
						</Text>
					</View>
				)}
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
