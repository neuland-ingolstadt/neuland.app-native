import DateTimePicker from '@react-native-community/datetimepicker'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { Picker } from 'swiftui-react-native'
import { useCSSVariable } from 'uniwind'
import { RoomSearchResults } from '@/components/Map/room-search-results'
import Divider from '@/components/Universal/divider'
import PlatformIcon from '@/components/Universal/icon'
import { usePickerBinding } from '@/hooks/usePickerBinding.ios'
import { useRoomSearch } from '@/hooks/useRoomSearch'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { formatISODate, formatISOTime } from '@/utils/date-utils'
import { ALL_BUILDINGS, ROOM_SEARCH_DURATIONS } from '@/utils/map-utils'
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

	const building = usePickerBinding(roomSearch.building, roomSearch.setBuilding)
	const duration = usePickerBinding(roomSearch.duration, roomSearch.setDuration)

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
							value={roomSearch.searchDateTime}
							mode="date"
							accentColor={primaryColor}
							locale="de-DE"
							onChange={(_event, selectedDate) => {
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
							value={roomSearch.searchDateTime}
							mode="time"
							is24Hour={true}
							accentColor={primaryColor}
							locale="de-DE"
							minuteInterval={5}
							onChange={(_event, selectedDate) => {
								roomSearch.setTime(formatISOTime(selectedDate))
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
							{ROOM_SEARCH_DURATIONS.map((option) => (
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
